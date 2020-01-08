import { MessageAttachment, WebClient } from '@slack/web-api';

import {
  Channel,
  findMessageForId,
  MessageResult,
  updateOrAddAttachment,
} from './slack';
import {
  CodeBuildStatus,
  CodeBuildEvent,
  CodeBuildStateEvent,
} from './codebuildTypes';

export const buildStatusToColor = (status: CodeBuildStatus): string => {
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
    default:
      return 'danger';
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
    default:
      return 'unknown status';
  }
};

export const projectLink = (event: CodeBuildEvent): string => {
  return `<https://${event.region}.console.aws.amazon.com/codebuild/home?region=${event.region}#/projects/${event.detail['project-name']}/view|${event.detail['project-name']}>`;
};

// Get the build ID from the Codebuild event
export const buildId = (event: CodeBuildEvent): string => {
  return event.detail['build-id'].split(':').slice(-1)[0];
};

// Convert seconds to minutes + seconds
export const timeString = (seconds: number | undefined): string => {
  const minute = 60;
  if (seconds !== undefined) {
    return `${
      seconds > minute ? `${Math.floor(seconds / minute)}m` : ''
    }${seconds % minute}s`;
  }
  return '';
};

// a commit sha has a length of 40 chars
const SHA_LENGTH = 40;

// Git revision, possibly with URL
const gitRevision = (event: CodeBuildEvent): string => {
  if (event.detail['additional-information'].source.type === 'GITHUB') {
    const sourceVersion =
      event.detail['additional-information']['source-version'];
    if (sourceVersion === undefined) {
      return 'unknown';
    }
    const githubProjectUrl = event.detail[
      'additional-information'
    ].source.location.slice(0, -'.git'.length);
    // PR
    const pr = sourceVersion.match(/^pr\/(\d+)/);
    if (pr) {
      return `<${githubProjectUrl}/pull/${pr[1]}|Pull request #${pr[1]}>`;
    }
    if (sourceVersion.length === SHA_LENGTH) {
      return `<${githubProjectUrl}/commit/${sourceVersion}|${sourceVersion}>`;
    }
    // Branch
    return `<${githubProjectUrl}/tree/${sourceVersion}|${sourceVersion}>`;
  }
  return event.detail['additional-information']['source-version'] || 'unknown';
};

export const buildPhaseAttachment = (
  event: CodeBuildEvent,
): MessageAttachment => {
  const { phases } = event.detail['additional-information'];
  if (phases) {
    return {
      fallback: `Current phase: ${phases[phases.length - 1]['phase-type']}`,
      text: phases
        .filter(
          phase =>
            phase['phase-type'] !== 'SUBMITTED' &&
            phase['phase-type'] !== 'COMPLETED',
        )
        .map(phase => {
          if (phase['duration-in-seconds'] !== undefined) {
            return `${
              phase['phase-status'] === 'SUCCEEDED'
                ? ':white_check_mark:'
                : ':x:'
            } ${phase['phase-type']} (${timeString(
              phase['duration-in-seconds'],
            )})`;
          }
          return `:building_construction: ${phase['phase-type']}`;
        })
        .join(' '),
      title: 'Build Phases',
    };
  }
  return {
    fallback: `not started yet`,
    text: '',
    title: 'Build Phases',
  };
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
    const minute = 60;
    const msInS = 1000;
    const endTime = Date.parse(event.time);
    const elapsedTime = endTime - startTime;
    const minutes = Math.floor(elapsedTime / minute / msInS);
    const seconds = Math.floor(elapsedTime / msInS - minutes * minute);

    const completeText = `<${buildUrl}|Build> of ${projectLink(
      event,
    )} ${buildStatusToText(event.detail['build-status'])} after ${
      minutes ? `${minutes} min ` : ''
    }${seconds ? `${seconds} sec` : ''}`;

    return [
      {
        color: buildStatusToColor(event.detail['build-status']),
        fallback: completeText,
        fields: [
          {
            short: false,
            title: 'Initiator',
            value:
              event.detail['additional-information'].initiator || 'unknown',
          },
          {
            short: false,
            title: 'Git revision',
            value: gitRevision(event),
          },
          ...(event.detail['additional-information'].phases || [])
            .filter(
              phase =>
                phase['phase-status'] != null &&
                phase['phase-status'] !== 'SUCCEEDED',
            )
            .map(phase => ({
              short: false,
              title: `Phase ${phase[
                'phase-type'
              ].toLowerCase()} ${buildStatusToText(
                event.detail['build-status'],
              )}`,
              value: (phase['phase-context'] || []).join('\n'),
            })),
        ],
        footer: buildId(event),
        text: completeText,
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
      color: buildStatusToColor(event.detail['build-status']),
      fallback: text,
      fields: [
        {
          short: false,
          title: 'Initiator',
          value: event.detail['additional-information'].initiator || 'unknown',
        },
        {
          short: true,
          title: 'Git revision',
          value: gitRevision(event),
        },
      ],
      footer: buildId(event),
    },
    buildPhaseAttachment(event),
  ];
};

// Handle the event for one channel
export const handleCodeBuildEvent = async (
  event: CodeBuildEvent,
  slack: WebClient,
  channel: Channel,
): Promise<MessageResult | void> => {
  // State change event
  if (event['detail-type'] === 'CodeBuild Build State Change') {
    if (event.detail['additional-information']['build-complete']) {
      const stateMessage = await findMessageForId(
        slack,
        channel.id,
        buildId(event),
      );
      if (stateMessage) {
        return slack.chat.update({
          attachments: buildEventToMessage(event),
          channel: channel.id,
          text: '',
          ts: stateMessage.ts,
        }) as Promise<MessageResult>;
      }
    }
    return slack.chat.postMessage({
      attachments: buildEventToMessage(event),
      channel: channel.id,
      text: '',
    }) as Promise<MessageResult>;
  }
  // Phase change event
  const message = await findMessageForId(slack, channel.id, buildId(event));
  if (message) {
    return slack.chat.update({
      attachments: updateOrAddAttachment(
        message.attachments,
        attachment => attachment.title === 'Build Phases',
        buildPhaseAttachment(event),
      ),
      channel: channel.id,
      text: '',
      ts: message.ts,
    }) as Promise<MessageResult>;
  }
};
