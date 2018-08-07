import { Handler, Context, Callback } from 'aws-lambda';
import { WebClient, MessageAttachment } from '@slack/client';
import {
  CodeBuildEvent,
  CodeBuildStateEvent,
  CodeBuildStatus,
  isCodeBuildStateEvent,
  CodeBuildPhaseEvent,
} from './codebuild';
import {
  ChannelsResult,
  ChannelHistoryResult,
  Message,
  MessageResult,
  Channel,
} from './slack';

const messageCache = new Map<[string, string], Message>();

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

// Get the build ID from the Codebuild event
export const buildId = (event: CodeBuildEvent): string => {
  return event.detail['build-id'].split(':').slice(-1)[0];
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

// Construct the build message
const buildEventToMessage = (
  event: CodeBuildStateEvent,
): MessageAttachment[] => {
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

    return [
      {
        text,
        fallback: text,
        color: buildStatusToColor(event.detail['build-status']),
        footer: buildId(event),
        fields: [
          {
            title: 'Git revision',
            value: gitRevision(event),
            short: false,
          },
          ...(event.detail['additional-information'].phases || [])
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
      },
      buildPhaseAttachment(event),
    ];
  }

  const text = `<${buildUrl}|Build> of ${projectLink(
    event,
  )} ${buildStatusToText(event.detail['build-status'])}`;
  return [
    {
      text,
      fallback: text,
      color: buildStatusToColor(event.detail['build-status']),
      footer: buildId(event),
      fields: [
        {
          title: 'Git revision',
          value: gitRevision(event),
          short: true,
        },
      ],
    },
    buildPhaseAttachment(event),
  ];
};

export const buildPhaseAttachment = (
  event: CodeBuildEvent,
): MessageAttachment => {
  const phases = event.detail['additional-information'].phases;
  if (phases) {
    return {
      fallback: `Current phase: ${phases[phases.length - 1]['phase-type']}`,
      title: 'Build Phases',
      text: phases
        .map(phase => {
          if (phase['duration-in-seconds'] !== undefined) {
            return `${
              phase['phase-status'] === 'SUCCEEDED'
                ? ':white_check_mark:'
                : ':red_circle:'
            } ${phase['phase-type']} (${phase['duration-in-seconds']}s)`;
          }
          return `:building_construction: ${phase['phase-type']}`;
        })
        .join(' '),
    };
  }
  return {
    fallback: `not started yet`,
    title: 'Build Phases',
    text: '',
  };
};

// Update a build message with new info
export const updateBuildMessage = (
  message: Message,
  event: CodeBuildPhaseEvent,
): MessageAttachment[] => {
  const newPhasesAttachment = buildPhaseAttachment(event);
  if (message.attachments === undefined) {
    return [newPhasesAttachment];
  }
  if (
    message.attachments.find(attachment => attachment.title === 'Build Phases')
  ) {
    return message.attachments.map(attachment => {
      if (attachment.title === 'Build Phases') {
        return newPhasesAttachment;
      }
      return attachment;
    });
  }
  return [
    ...message.attachments.slice(0, -1),
    newPhasesAttachment,
    message.attachments[-1],
  ];
};

// Find any previous message for the build
// so we can update instead of posting a new message
export const findMessages = async (
  slack: WebClient,
  channel: string,
): Promise<Message[]> => {
  const messages = (await slack.channels.history({
    channel,
    count: 20,
  })) as ChannelHistoryResult;

  console.log('channels.history', JSON.stringify(messages, null, 2));

  return messages.messages;
};

// Fetch the message for this build
export const findMessageForBuild = async (
  slack: WebClient,
  channel: string,
  event: CodeBuildEvent,
): Promise<Message | undefined> => {
  // If the message is cached, return it
  const cachedMessage = messageCache.get([channel, buildId(event)]);
  if (cachedMessage) {
    return cachedMessage;
  }

  // If not in cache, search history for it
  return (await findMessages(slack, channel)).find(message => {
    if (message.attachments == null) {
      return false;
    }
    if (message.attachments.find(att => att.footer === buildId(event))) {
      return true;
    }
    return false;
  });
};

// Handle the event for one channel
export const handleEvent = async (
  event: CodeBuildEvent,
  slack: WebClient,
  channel: Channel,
): Promise<MessageResult | void> => {
  // State change event
  if (isCodeBuildStateEvent(event)) {
    if (event.detail['additional-information']['build-complete']) {
      const message = await findMessageForBuild(slack, channel.id, event);
      if (message) {
        return slack.chat.update({
          channel: channel.id,
          attachments: buildEventToMessage(event),
          text: '',
          ts: message.ts,
        }) as Promise<MessageResult>;
      }
    }
    return slack.chat.postMessage({
      channel: channel.id,
      attachments: buildEventToMessage(event),
      text: '',
    }) as Promise<MessageResult>;
  }
  // Phase change event
  const message = await findMessageForBuild(slack, channel.id, event);
  if (message) {
    return slack.chat.update({
      channel: channel.id,
      attachments: updateBuildMessage(message, event),
      text: '',
      ts: message.ts,
    }) as Promise<MessageResult>;
  }
};

export const handler: Handler = async (
  event: CodeBuildEvent,
  _context: Context,
  _callback: Callback | undefined,
) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

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

  console.log('messageCache before', JSON.stringify(messageCache, null, 2));

  // Get list of channel
  const result = (await slack.channels.list()) as ChannelsResult;
  const requests = result.channels.map(async channel => {
    if (projectChannels.find(c => c === channel.name)) {
      return handleEvent(event, slack, channel);
    }
  });
  Promise.all(requests).then(r => {
    console.log(JSON.stringify(r.filter(i => i != null), null, 2));
    // Add all sent messages to the cache
    r.forEach(m => {
      if (m) {
        messageCache.set([m.channel, buildId(event)], m.message);
      }
    });
    console.log('Slack Channels:', JSON.stringify(result, null, 2));
    console.log('messageCache after', JSON.stringify(messageCache, null, 2));
  });
};
