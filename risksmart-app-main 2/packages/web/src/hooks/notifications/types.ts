import type { KnockMessage } from '@risksmart-app/trpc/src/routers/frontend/notifications/types/history';

export type NotificationHistoryItem = KnockMessage & {
  [key: string]: unknown;
  /** Derived display fields */
  recipientName: string;
  recipientEmail: string;
  objectTypeLabel: string;
  deliveryStatus: string;
  engagementStatuses: string[];
  insertedAt: string;
  workflowLabel: string;
  /** Total activities in a digest message (enriched server-side) */
  totalActivities?: number;
  /** Flag indicating this item is a child activity within a digest */
  isDigestActivity?: boolean;
  /** Pre-computed deep-link URL */
  link?: string;
};

export type DateRangePreset = 'last24h' | 'last7' | 'last30' | 'last90';

export interface DateRangeState {
  preset: DateRangePreset;
  insertedAtGt?: string;
  insertedAtLt?: string;
}

export type KnockMessageStatusValue =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'undelivered'
  | 'not_sent'
  | 'delivery_attempted'
  | 'bounced';

export type KnockEngagementStatusValue =
  | 'seen'
  | 'unseen'
  | 'read'
  | 'unread'
  | 'archived'
  | 'unarchived'
  | 'interacted'
  | 'link_clicked';

export interface NotificationFilterState {
  dateRange: DateRangeState;
}
