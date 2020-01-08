import { MessageAttachment, WebClient } from '@slack/web-api';
import {
  CodePipelineState,
  CodePipelineStageState,
  CodePipelineActionState,
  CodePipelineCloudWatchStageEvent,
  CodePipelineCloudWatchActionEvent,
  CodePipelineCloudWatchEvent,
  CodePipelineCloudWatchPipelineEvent,
} from 'aws-lambda';

import {
  Channel,
  findMessageForId,
  MessageResult,
  updateOrAddAttachment,
} from './slack';

const stateColors: {
  [K in
    | CodePipelineState
    | CodePipelineStageState
    | CodePipelineActionState]: string;
} = {
  CANCELED: 'danger',
  FAILED: 'danger',
  RESUMED: '#439FE0',
  STARTED: '#439FE0',
  SUCCEEDED: 'good',
  SUPERSEDED: 'warning',
};

const stateText: {
  [K in
    | CodePipelineState
    | CodePipelineStageState
    | CodePipelineActionState]: string;
} = {
  CANCELED: ':no_entry: cancelled',
  FAILED: ':x: failed',
  RESUMED: ':building_construction: resumed',
  STARTED: ':building_construction: started',
  SUCCEEDED: ':white_check_mark: succeeded',
  SUPERSEDED: ':x: superseded',
};

// Create Pipeline attachment
export const pipelineAttachment = (
  event: CodePipelineCloudWatchPipelineEvent,
): MessageAttachment => {
  return {
    color: stateColors[event.detail.state],
    fallback: `Pipeline ${event.detail.pipeline} ${event.detail.state}`,
    footer: event.detail['execution-id'],
    text: stateText[event.detail.state],
    title: `Pipeline ${event.detail.pipeline}`,
  };
};

// Create Stage attachment
export const stageAttachment = (
  event: CodePipelineCloudWatchStageEvent,
): MessageAttachment => {
  return {
    color: stateColors[event.detail.state],
    fallback: `Stage ${event.detail.stage} ${event.detail.state}`,
    text: stateText[event.detail.state],
    title: `Stage ${event.detail.stage}`,
  };
};

// Create Action attachment
export const actionAttachment = (
  event: CodePipelineCloudWatchActionEvent,
): MessageAttachment => {
  return {
    color: stateColors[event.detail.state],
    fallback: `Stage ${event.detail.stage} ${event.detail.state}`,
    text: `${stateText[event.detail.state]} (${event.detail.action})`,
    title: `Stage ${event.detail.stage}`,
  };
};

// Event handler
export const handleCodePipelineEvent = async (
  event: CodePipelineCloudWatchEvent,
  slack: WebClient,
  channel: Channel,
): Promise<MessageResult | void> => {
  const message = await findMessageForId(
    slack,
    channel.id,
    event.detail['execution-id'],
  );

  switch (event['detail-type']) {
    case 'CodePipeline Pipeline Execution State Change': {
      const pAttachment = pipelineAttachment(event);
      if (message) {
        return slack.chat.update({
          attachments: updateOrAddAttachment(
            message.attachments,
            a => a.title === pAttachment.title,
            pAttachment,
          ),
          channel: channel.id,
          text: '',
          ts: message.ts,
        }) as Promise<MessageResult>;
      }
      return slack.chat.postMessage({
        attachments: [pipelineAttachment(event)],
        channel: channel.id,
        text: '',
      }) as Promise<MessageResult>;
    }
    case 'CodePipeline Stage Execution State Change': {
      const sAttachment = stageAttachment(event);
      if (message) {
        return slack.chat.update({
          attachments: updateOrAddAttachment(
            message.attachments,
            a => a.title === sAttachment.title,
            sAttachment,
          ),
          channel: channel.id,
          text: '',
          ts: message.ts,
        }) as Promise<MessageResult>;
      }
      return undefined;
    }
    case 'CodePipeline Action Execution State Change': {
      const aAttachment = actionAttachment(event);
      if (message) {
        return slack.chat.update({
          attachments: updateOrAddAttachment(
            message.attachments,
            a => a.title === aAttachment.title,
            aAttachment,
          ),
          channel: channel.id,
          text: '',
          ts: message.ts,
        }) as Promise<MessageResult>;
      }
      return undefined;
    }
    default:
  }
};
