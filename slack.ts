import { WebAPICallResult, MessageAttachment } from '@slack/client';

// Response includes extra fields not part of the request
export type MessageAttachmentResponse = MessageAttachment & {
  id: number;
  ts: number;
};

export type Channel = {
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
};

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

export type MessageReaction = {
  name: string;
  count: number;
  users: string[];
};

export type Message = {
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
};

export type ChannelHistoryResult = WebAPICallResult & {
  latest: string;
  messages: Message[];
  has_more: boolean;
};

export type Bot = {
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
};

export type BotResult = WebAPICallResult & {
  bot: Bot;
};

export type User = {
  name: string;
  id: string;
  email?: string;
  image_24?: string;
  image_32?: string;
  image_48?: string;
  image_72?: string;
  image_192?: string;
};

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
