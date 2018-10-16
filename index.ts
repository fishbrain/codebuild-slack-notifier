import { WebClient } from '@slack/client';
import { Callback, Context, Handler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { CodeBuildEvent, handleCodeBuildEvent } from './codebuild';
import { CodePipelineEvent, handleCodePipelineEvent } from './codepipeline';
import { ChannelsResult, Message } from './slack';
import { getParameter } from './ssm';

export const messageCache = new Map<string, Message>();

export const isCodePipelineEvent = (
  event: CodeBuildEvent | CodePipelineEvent,
): event is CodePipelineEvent => {
  return (
    event['detail-type'] === 'CodePipeline Action Execution State Change' ||
    event['detail-type'] === 'CodePipeline Pipeline Execution State Change' ||
    event['detail-type'] === 'CodePipeline Stage Execution State Change'
  );
};

// Get project name out of the event
export const getProjectName = (event: CodeBuildEvent | CodePipelineEvent) => {
  if (isCodePipelineEvent(event)) {
    return event.detail.pipeline;
  }
  return event.detail['project-name'];
};

export const handler: Handler = async (
  event: CodeBuildEvent | CodePipelineEvent,
  _context: Context,
  _callback: Callback | undefined,
) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const ssm = new AWS.SSM();
  const parameters = (await ssm
    .getParametersByPath({
      Path: `/codebuild-slack-notifier`,
      WithDecryption: true,
    })
    .promise()).Parameters;

  if (parameters === undefined) {
    throw new Error('Could not fetch parameters');
  }

  const projectName = getProjectName(event);

  // Get list of channels to notify
  const notifyChannels = getParameter(parameters, `${projectName}_channels`);
  if (notifyChannels === undefined) {
    console.log(`Empty notification channel list for ${projectName}`);
    return;
  }

  const projectChannels = notifyChannels.split(',');

  // Connect to slack
  const token = getParameter(parameters, 'slack_token');
  const slack = new WebClient(token);

  console.log('messageCache before', messageCache);

  // Get list of channels
  const result = (await slack.channels.list()) as ChannelsResult;
  const requests = result.channels.map(async channel => {
    if (projectChannels.find(c => c === channel.name)) {
      if (isCodePipelineEvent(event)) {
        return handleCodePipelineEvent(event, slack, channel);
      }
      return handleCodeBuildEvent(event, slack, channel);
    }
  });
  Promise.all(requests).then(r => {
    console.log(JSON.stringify(r.filter(i => i != null), null, 2));
    // Add all sent messages to the cache
    /* r.forEach(m => {
      if (m) {
        messageCache.set([m.channel, buildId(event)].join(':'), {
          ...m.message,
          ts: m.ts,
        });
      }
    }); */
    console.log('messageCache after', messageCache);
  });
};
