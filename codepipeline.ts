import { MessageAttachment, WebClient } from '@slack/client';
import {
  Channel,
  findMessageForId,
  MessageResult,
  updateOrAddAttachment,
} from './slack';

/**
 * See https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html
 */
export type CodePipelineState =
  | 'STARTED'
  | 'SUCCEEDED'
  | 'RESUMED'
  | 'FAILED'
  | 'CANCELED'
  | 'SUPERSEDED';

export type CodePipelineStageState =
  | 'STARTED'
  | 'SUCCEEDED'
  | 'RESUMED'
  | 'FAILED'
  | 'CANCELED';

export type CodePipelineActionState =
  | 'STARTED'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED';

export interface CodePipelinePiplelineEvent {
  version: string;
  id: string;
  'detail-type': 'CodePipeline Pipeline Execution State Change';
  source: 'aws.codepipeline';
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: {
    pipeline: string;
    version: number;
    state: CodePipelineState;
    'execution-id': string;
  };
}

export interface CodePipelineStageEvent {
  version: string;
  id: string;
  'detail-type': 'CodePipeline Stage Execution State Change';
  source: 'aws.codepipeline';
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: {
    pipeline: string;
    version: number;
    'execution-id': string;
    stage: string;
    state: CodePipelineStageState;
  };
}

export type CodePipelineActionCategory =
  | 'Approval'
  | 'Build'
  | 'Deploy'
  | 'Invoke'
  | 'Source'
  | 'Test';

export interface CodePipelineActionEvent {
  version: string;
  id: string;
  'detail-type': 'CodePipeline Action Execution State Change';
  source: 'aws.codepipeline';
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: {
    pipeline: string;
    version: number;
    'execution-id': string;
    stage: string;
    action: string;
    state: CodePipelineActionState;
    type: {
      owner: 'AWS' | 'Custom' | 'ThirdParty';
      category: CodePipelineActionCategory;
      provider: 'CodeDeploy';
      version: number;
    };
  };
}

export type CodePipelineEvent =
  | CodePipelinePiplelineEvent
  | CodePipelineStageEvent
  | CodePipelineActionEvent;

const stateColors: {
  [K in
    | CodePipelineState
    | CodePipelineStageState
    | CodePipelineActionState]: string
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
    | CodePipelineActionState]: string
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
  event: CodePipelinePiplelineEvent,
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
  event: CodePipelineStageEvent,
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
  event: CodePipelineActionEvent,
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
  event: CodePipelineEvent,
  slack: WebClient,
  channel: Channel,
): Promise<MessageResult | void> => {
  const message = await findMessageForId(
    slack,
    channel.id,
    event.detail['execution-id'],
  );

  switch (event['detail-type']) {
    case 'CodePipeline Pipeline Execution State Change':
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

    case 'CodePipeline Stage Execution State Change':
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

    case 'CodePipeline Action Execution State Change':
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
};
