import { MessageAttachment, WebAPICallResult, WebClient } from '@slack/client';
import { messageCache } from '.';

// Response includes extra fields not part of the request
export type MessageAttachmentResponse = MessageAttachment & {
  id: number;
  ts: number;
};

export interface Channel {
  id: string;
  name: string;
  is_channel: boolean;
  created: number;
  creator: string;
  is_archived: boolean;
  is_general: boolean;
  name_normalized: string;
  is_shared: boolean;
  is_org_shared: boolean;
  is_member: boolean;
  is_private: boolean;
  is_mpim: boolean;
  last_read: string;
  latest: {
    text: string;
    username: string;
    bot_id: string;
    attachments: MessageAttachmentResponse[];
    type: string;
    subtype: string;
    ts: string;
  };
  unread_count: number;
  unread_count_display: number;
  members: string[];
  topic: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose: {
    value: string;
    creator: string;
    last_set: number;
  };
  previous_names: string[];
}

export type ChannelResult = WebAPICallResult & {
  channel: Channel;
};

export type ChannelsResult = WebAPICallResult & {
  channels: Channel[];
};

export type MessageSubTypes =
  | 'bot_message'
  | 'channel_archive'
  | 'channel_join'
  | 'channel_leave'
  | 'channel_leave'
  | 'channel_purpose'
  | 'channel_topic'
  | 'channel_unarchive'
  | 'file_comment'
  | 'file_mention'
  | 'file_share'
  | 'group_archive'
  | 'group_join'
  | 'group_leave'
  | 'group_name'
  | 'group_purpose'
  | 'group_topic'
  | 'group_unarchive'
  | 'me_message'
  | 'message_changed'
  | 'message_deleted'
  | 'message_replied'
  | 'pinned_item'
  | 'reply_broadcast'
  | 'thread_broadcast'
  | 'unpinned_item';

export interface MessageReaction {
  name: string;
  count: number;
  users: string[];
}

export interface Message {
  type: string;
  ts: string;
  subtype?: MessageSubTypes;
  text?: string;
  username?: string;
  bot_id?: string;
  attachments?: MessageAttachmentResponse[];
  is_starred?: true;
  pinned_to?: string[];
  reactions?: MessageReaction[];
}

export type ChannelHistoryResult = WebAPICallResult & {
  latest: string;
  messages: Message[];
  has_more: boolean;
};

export interface Bot {
  id: string;
  deleted: boolean;
  name: string;
  updated: number;
  app_id: string;
  icons: {
    image_36: string;
    image_48: string;
    image_72: string;
  };
}

export type BotResult = WebAPICallResult & {
  bot: Bot;
};

export interface User {
  name: string;
  id: string;
  email?: string;
  image_24?: string;
  image_32?: string;
  image_48?: string;
  image_72?: string;
  image_192?: string;
}

export type UserResult = WebAPICallResult & {
  user: User;
  team: {
    id: string;
  };
};

export type MessageResult = WebAPICallResult & {
  channel: string;
  ts: string;
  message: Message & { ts: undefined };
};

// Update an attachment, or if it doesn't exist, add it
export const updateOrAddAttachment = (
  attachments: MessageAttachment[] | undefined,
  callback: (attachment: MessageAttachment) => boolean,
  newAttachment: MessageAttachment,
) => {
  if (attachments === undefined) {
    return [newAttachment];
  }

  const index = attachments.findIndex(callback);
  if (index === -1) {
    return [...attachments, newAttachment];
  }
  return [
    ...attachments.slice(0, index),
    newAttachment,
    ...attachments.slice(index + 1),
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

  return messages.messages;
};

// Fetch the message for this build
export const findMessageForId = async (
  slack: WebClient,
  channel: string,
  id: string,
): Promise<Message | undefined> => {
  // If the message is cached, return it
  const cachedMessage = messageCache.get([channel, id].join(':'));
  if (cachedMessage) {
    console.log('found cached message', cachedMessage);
    return cachedMessage;
  }

  // If not in cache, search history for it
  return (await findMessages(slack, channel)).find(message => {
    if (message.attachments == null) {
      return false;
    }
    if (message.attachments.find(att => att.footer === id)) {
      return true;
    }
    return false;
  });
};
