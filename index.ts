import { WebClient } from '@slack/web-api';
import {
  Callback,
  Context,
  Handler,
  CodePipelineCloudWatchEvent,
} from 'aws-lambda';
import * as AWS from 'aws-sdk';

import { handleCodeBuildEvent } from './codebuild';
import { CodeBuildEvent } from './codebuildTypes';
import { handleCodePipelineEvent } from './codepipeline';
import { Channel, ChannelsResult } from './slack';

export const isCodePipelineEvent = (
  event: CodeBuildEvent | CodePipelineCloudWatchEvent,
): event is CodePipelineCloudWatchEvent => {
  return (
    event['detail-type'] === 'CodePipeline Action Execution State Change' ||
    event['detail-type'] === 'CodePipeline Pipeline Execution State Change' ||
    event['detail-type'] === 'CodePipeline Stage Execution State Change'
  );
};

const ssm = new AWS.SSM();

// Get project name out of the event
export const getProjectName = (
  event: CodeBuildEvent | CodePipelineCloudWatchEvent,
): string => {
  if (isCodePipelineEvent(event)) {
    return event.detail.pipeline;
  }
  return event.detail['project-name'];
};

export const handler: Handler = async (
  event: CodeBuildEvent | CodePipelineCloudWatchEvent,
  _context: Context,
  _callback: Callback | undefined,
) => {
  try {
    const indentLevel = 2;
    // console.log('Received event:', JSON.stringify(event, null, indentLevel));

    const projectName = getProjectName(event).split('-')[0];

    // Get list of channels to notify
    const notifyChannels = (
      await ssm
        .getParameter({
          Name: `/codebuild-slack-notifier/${projectName}_channels`,
          WithDecryption: false,
        })
        .promise()
    ).Parameter;

    // console.log(`notifyChannels - /codebuild-slack-notifier/${projectName}_channels`);
    // console.log(JSON.stringify(notifyChannels, null, indentLevel));

    if (notifyChannels === undefined || notifyChannels.Value === undefined) {
      throw new Error('Could not fetch notification channels');
    }

    const projectChannels = notifyChannels.Value.split(',');
    // console.log('Slack channels');
    // console.log(JSON.stringify(projectChannels, null, indentLevel));

    // Connect to slack
    const token = (
      await ssm
        .getParameter({
          Name: `/codebuild-slack-notifier/slack_token`,
          WithDecryption: true,
        })
        .promise()
    ).Parameter;

    // console.log(`token - /codebuild-slack-notifier/slack_token`);
    // console.log(JSON.stringify(token, null, indentLevel));

    if (token === undefined || token.Value === undefined) {
      throw new Error('Could not fetch slack token');
    }
    const slack = new WebClient(token.Value);

    // console.log('messageCache before', messageCache);

    // Get list of channels
    const result = (await slack.channels.list()) as ChannelsResult;
    const requests = result.channels.map(async (channel: Channel) => {
      // console.log(`Trying channel -> ${channel.name}`);
      if (projectChannels.find(c => c === channel.name)) {
        if (isCodePipelineEvent(event)) {
          console.log(
            `Processing CodePipeline event for channel -> ${channel.name}`,
          );
          return handleCodePipelineEvent(event, slack, channel);
        }
        console.log(
          `Processing CodeBuild event for channel -> ${channel.name}`,
        );
        return handleCodeBuildEvent(event, slack, channel);
      }
    });
    await Promise.all(requests).then(r => {
      console.log(
        JSON.stringify(
          r.filter(i => i != null),
          null,
          indentLevel,
        ),
      );
      // Add all sent messages to the cache
      /* r.forEach(m => {
        if (m) {
          messageCache.set([m.channel, buildId(event)].join(':'), {
            ...m.message,
            ts: m.ts,
          });
        }
      }); */
      // console.log('messageCache after', messageCache);
    });
  } catch (err) {
    console.log('An Error Occurred:', err.message);
    console.log(err);
  }
};
