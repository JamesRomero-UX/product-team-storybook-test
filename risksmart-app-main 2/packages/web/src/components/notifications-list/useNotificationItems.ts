import { useQuery } from '@apollo/client';
import type { FeedItem } from '@knocklabs/client';
import { useKnockFeed } from '@knocklabs/react';
import type { GenericData } from '@knocklabs/types/src/common';
import { GetNotificationListDetailsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

import notifications from './notification-types';
import type {
  Lookup,
  NotificationLookupData,
} from './notification-types/types';

export type NotificationItem = {
  url: null | string;
  message: null | string;
  feedItem: FeedItem<GenericData>;
  id: null | string;
};

export const useNotificationItems = (): {
  loading: boolean;
  items: NotificationItem[];
} => {
  const { feedClient, useFeedStore } = useKnockFeed();
  const items = useFeedStore((state) => state.items);

  const variables = useMemo(
    () => ({
      issueIds: getUniqueIds(items, 'objectId').concat(
        getUniqueIds(items, 'issueId')
      ),
      riskIds: getUniqueIds(items, 'objectId'),
      controlIds: getUniqueIds(items, 'objectId'),
      actionIds: getUniqueIds(items, 'objectId').concat(
        getUniqueIds(items, 'actionId')
      ),
      documentFileIds: getUniqueIds(items, 'objectId'),
      documentIds: getUniqueIds(items, 'objectId'),
      indicatorIds: getUniqueIds(items, 'objectId'),
    }),
    [items]
  );

  const { loading: notificationListDetailsLoading, data } = useQuery(
    GetNotificationListDetailsDocument,
    {
      variables,
      skip:
        variables.actionIds.length === 0 &&
        variables.riskIds.length === 0 &&
        variables.controlIds.length === 0 &&
        variables.issueIds.length === 0 &&
        variables.documentIds.length === 0 &&
        variables.indicatorIds.length === 0 &&
        variables.documentFileIds.length === 0,
    }
  );

  const lookupData: NotificationLookupData = useMemo(() => {
    return {
      issues: createLookup(data?.issue),
      risks: createLookup(data?.risk),
      controls: createLookup(data?.control),
      actions: createLookup(data?.action),
      documentFiles: createLookup(data?.document_file),
      documents: createLookup(data?.document),
      indicators: createLookup(data?.indicator),
    };
  }, [data]);

  const newItems: NotificationItem[] = items
    .filter((item) => notifications[item.source.key])
    .map((item) => {
      const details = notifications[item.source.key](item, lookupData);

      return {
        url: details.url,
        message: details.message,
        id: details.id,
        feedItem: item,
      };
    });

  return {
    loading: feedClient.getState().loading || notificationListDetailsLoading,
    items: newItems,
  };
};

function createLookup<T extends { Id: string }>(
  data: T[] | undefined
): Lookup<T> | undefined {
  if (!data) {
    return undefined;
  }

  return data.reduce<Lookup<T>>((previous, dataItem) => {
    previous[dataItem.Id] = dataItem;

    return previous;
  }, {});
}

function onlyUnique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

function getUniqueIds(items: FeedItem<GenericData>[], key: string): string[] {
  return items
    .filter((i) => i.data && key in i.data)
    .map((i) => i.data![key] as string)
    .filter(onlyUnique);
}
