import { z } from 'zod';

export const listBatchInputSchema = z.object({
  insertedAtGt: z.string().datetime().optional(),
  insertedAtLt: z.string().datetime().optional(),
  cursor: z.string().max(1024).nullish(),
  objectId: z.string().uuid().optional(),
});

export type ListBatchInput = z.infer<typeof listBatchInputSchema>;

export interface KnockChannel {
  id: string;
  key: string;
  name: string;
  type: string;
}

export interface KnockRecipient {
  id: string;
  name?: string;
  email?: string;
  collection?: string;
}

export interface KnockMessage {
  id: string;
  channel_id: string;
  /** Channel object returned inline by the Knock messages API */
  channel?: KnockChannel;
  recipient: string | KnockRecipient;
  workflow: string;
  tenant: string | null;
  status: string;
  engagement_statuses: string[];
  inserted_at: string;
  updated_at: string;
  seen_at: string | null;
  read_at: string | null;
  interacted_at: string | null;
  archived_at: string | null;
  source?: {
    key: string;
    version_id: string;
  };
  data: Record<string, unknown> | null;
  /** Enriched server-side: resolved email address for the recipient */
  recipientEmail?: string;
  /** Enriched server-side: resolved display name (e.g. group name) */
  recipientName?: string;
  /** Enriched server-side: human-readable channel name */
  channelName?: string;
  /** Enriched server-side: total activities in a digest message */
  totalActivities?: number;
}

export interface KnockActivity {
  id: string;
  data: Record<string, unknown> | null;
  actor: {
    id: string;
    email?: string;
    name?: string;
  } | null;
  recipient: string | KnockRecipient;
  inserted_at: string;
  updated_at: string;
}

export interface KnockActivityListResponse {
  items: KnockActivity[];
  page_info: PageInfo;
}

export const digestActivitiesInputSchema = z.object({
  messageId: z.string().min(1).max(256),
});

export interface PageInfo {
  after: string | null;
  before: string | null;
  page_size: number;
  total_count?: number;
}

export interface KnockMessageListResponse {
  items: KnockMessage[];
  page_info: PageInfo;
}

export interface KnockMessageBatchResponse {
  items: KnockMessage[];
  nextCursor: string | null;
}
