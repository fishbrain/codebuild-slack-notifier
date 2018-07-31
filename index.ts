import { Handler, Context, Callback } from 'aws-lambda';
import { WebClient } from '@slack/client';
import { CodeBuildEvent, CodeBuildStatus } from './codebuild';
import {
  Channel,
  ChannelsResult,
  ChannelHistoryResult,
  BotResult,
  Message,
} from './slack';

const buildStatusToColor = (status: CodeBuildStatus): string => {
  switch (status) {
    case 'IN_PROGRESS':
      return '#439FE0';
    case 'SUCCEEDED':
      return 'good';
    case 'TIMED_OUT':
      return 'danger';
    case 'STOPPED':
      return 'danger';
    case 'FAILED':
      return 'danger';
    case 'FAULT':
      return 'warning';
    case 'CLIENT_ERROR':
      return 'warning';
  }
};

const buildStatusToText = (status: CodeBuildStatus): string => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'started';
    case 'SUCCEEDED':
      return 'passed';
    case 'TIMED_OUT':
      return 'timed out';
    case 'STOPPED':
      return 'stopped';
    case 'FAILED':
      return 'failed';
    case 'FAULT':
      return 'errored';
    case 'CLIENT_ERROR':
      return 'had client error';
  }
};

export const projectLink = (event: CodeBuildEvent): string => {
  return `<https://${
    event.region
  }.console.aws.amazon.com/codebuild/home?region=${event.region}#/projects/${
    event.detail['project-name']
  }/view|${event.detail['project-name']}>`;
};

// Git revision, possibly with URL
const gitRevision = (event: CodeBuildEvent): string => {
  if (event.detail['additional-information'].source.type === 'GITHUB') {
    const sourceVersion =
      event.detail['additional-information']['source-version'];
    if (sourceVersion === undefined) {
      return 'unknown';
    }
    // The location minus '.git'
    const githubProjectUrl = event.detail[
      'additional-information'
    ].source.location.slice(0, -4);
    const pr = sourceVersion.match(/^pr\/(\d+)/);
    if (pr) {
      return `<${githubProjectUrl}/pull/${pr[1]}|Pull request #${pr[1]}>`;
    }
    return `<${githubProjectUrl}/commit/${sourceVersion}|${sourceVersion}>`;
  }
  return event.detail['additional-information']['source-version'] || 'unknown';
};

const buildEventToMessage = (event: CodeBuildEvent) => {
  const startTime = Date.parse(
    event.detail['additional-information']['build-start-time'],
  );

  // URL to the Codebuild view for the build
  const buildUrl = `https://${
    event.region
  }.console.aws.amazon.com/codebuild/home?region=${event.region}#/builds/${
    event.detail['build-id'].split('/')[1]
  }/view/new`;

  if (event.detail['additional-information']['build-complete']) {
    const endTime = Date.parse(event.time);
    const elapsedTime = endTime - startTime;
    const minutes = Math.floor(elapsedTime / 60 / 1000);
    const seconds = Math.floor(elapsedTime / 1000 - minutes * 60);

    const text = `<${buildUrl}|Build> of ${projectLink(
      event,
    )} ${buildStatusToText(event.detail['build-status'])} after ${
      minutes ? `${minutes} min ` : ''
    }${seconds ? `${seconds} sec` : ''}`;

    return {
      text,
      fallback: text,
      color: buildStatusToColor(event.detail['build-status']),
      fields: [
        {
          title: 'Git revision',
          value: gitRevision(event),
          short: false,
        },
        ...event.detail['additional-information'].phases
          .filter(
            phase =>
              phase['phase-status'] != null &&
              phase['phase-status'] !== 'SUCCEEDED',
          )
          .map(phase => ({
            title: `Phase ${phase[
              'phase-type'
            ].toLowerCase()} ${buildStatusToText(
              event.detail['build-status'],
            )}`,
            value: (phase['phase-context'] || []).join('\n'),
            short: false,
          })),
      ],
    };
  }

  const text = `<${buildUrl}|Build> of ${projectLink(
    event,
  )} ${buildStatusToText(event.detail['build-status'])}`;
  return {
    text,
    fallback: text,
    color: buildStatusToColor(event.detail['build-status']),
    fields: [
      {
        title: 'Git revision',
        value: gitRevision(event),
        short: true,
      },
    ],
  };
};

// Find any previous message for the build
// so we can update instead of posting a new message
export const findMyMessages = async (
  slack: WebClient,
  bot: Promise<BotResult>,
  channel: Channel,
): Promise<Message[]> => {
  const messages = (await slack.channels.history({
    channel: channel.id,
    count: 1000,
  })) as ChannelHistoryResult;

  const username = (await bot).bot.name;

  return messages.messages.filter(message => message.username === username);
};

export const handler: Handler = async (
  event: CodeBuildEvent,
  _context: Context,
  _callback: Callback | undefined,
) => {
  // Get list of channels to notify
  const notifyChannels = event.detail['additional-information'].environment[
    'environment-variables'
  ].find(
    env => env.type === 'PLAINTEXT' && env.name === 'SLACK_NOFITY_CHANNELS',
  );
  if (notifyChannels === undefined) {
    console.log(
      `No notification channels set for ${event.detail['project-name']}`,
    );
    return;
  }

  const projectChannels = notifyChannels.value.split(',');
  if (projectChannels.length === 0) {
    console.log(
      `Empty notification channel list for ${event.detail['project-name']}`,
    );
    return;
  }

  // Connect to slack
  const token = process.env.SLACK_TOKEN;
  if (token == null) {
    console.log('No SLACK_TOKEN specified');
    return;
  }
  const slack = new WebClient(token);

  // Get info about self
  const bot = slack.bots.info() as Promise<BotResult>;

  // Get list of channel
  const result = (await slack.channels.list()) as ChannelsResult;
  result.channels.forEach(channel => {
    if (projectChannels.find(c => c === channel.name)) {
      slack.chat.postMessage({
        channel: channel.id,
        attachments: [buildEventToMessage(event)],
        text: '',
      });
    }
  });
  console.log('Slack Channels:', JSON.stringify(result, null, 2));
  console.log('Received event:', JSON.stringify(event, null, 2));
};
