// Stub for @knocklabs/react — production reads notification feed via Knock.
// Storybook stub returns an empty feed; setItems is a no-op.
import type { ReactNode } from 'react';

const feed = {
  items: [],
  pageInfo: { before: '', after: '', page_size: 0 },
  metadata: { total_count: 0, unread_count: 0, unseen_count: 0 },
};

const useFeedStoreState = {
  ...feed,
  loading: false,
  setItems: () => {},
  fetch: () => {},
  fetchNextPage: () => {},
  markAllAsRead: () => {},
  markAllAsSeen: () => {},
  markAsRead: () => {},
  markAsUnread: () => {},
};

export const KnockFeedProvider = ({ children }: { children: ReactNode }) => children as any;
export const KnockProvider = ({ children }: { children: ReactNode }) => children as any;

export const useKnockFeed = () => ({
  feedClient: {
    on: () => {},
    off: () => {},
    fetch: () => {},
    markAllAsRead: () => {},
    markAllAsSeen: () => {},
    store: { useStore: () => useFeedStoreState },
  },
  useFeedStore: <T,>(selector?: (s: typeof useFeedStoreState) => T) =>
    (selector ? selector(useFeedStoreState) : useFeedStoreState) as any,
  colorMode: 'light',
  defaultAvatar: undefined,
});

export const useKnockClient = () => ({
  user: { id: 'storybook' },
  feeds: { initialize: () => {} },
});

export const NotificationFeed = () => null;
export const NotificationFeedPopover = () => null;
export const NotificationIconButton = () => null;
export const KnockI18nProvider = ({ children }: { children: ReactNode }) => children as any;

export default { KnockFeedProvider, useKnockFeed };
