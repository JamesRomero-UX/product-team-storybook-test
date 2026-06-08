import type { FeedItem } from '@knocklabs/client';
import type { GetNotificationListDetailsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

export type GetItem = (
  feedItem: FeedItem,
  lookupData: NotificationLookupData
) => Item;

type Item = { message: null | string; url: null | string; id: null | string };

export type NotificationLookupData = {
  issues: IssueLookUp | undefined;
  actions: ActionLookUp | undefined;
  documentFiles: DocumentFileLookUp | undefined;
  risks: RiskLookUp | undefined;
  controls: ControlLookUp | undefined;
  documents: DocumentLookUp | undefined;
  indicators: IndicatorLookUp | undefined;
};

export type Lookup<T> = {
  [id: string]: T;
};
type IssueLookUp = Lookup<GetNotificationListDetailsQuery['issue'][0]>;
type ActionLookUp = Lookup<GetNotificationListDetailsQuery['action'][0]>;
type RiskLookUp = Lookup<GetNotificationListDetailsQuery['risk'][0]>;
type DocumentLookUp = Lookup<GetNotificationListDetailsQuery['document'][0]>;
type ControlLookUp = Lookup<GetNotificationListDetailsQuery['control'][0]>;
type DocumentFileLookUp = Lookup<
  GetNotificationListDetailsQuery['document_file'][0]
>;
type IndicatorLookUp = Lookup<GetNotificationListDetailsQuery['indicator'][0]>;

export type NotificationGetItem = {
  [notificationKey: string]: GetItem;
};
