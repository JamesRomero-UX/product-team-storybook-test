import type { FeedItem } from '@knocklabs/client';
import type { NotificationLookupData } from 'src/components/notifications-list/notification-types/types';

import { auditItemSearch } from '@/utils/urls';

import { stub } from '../../../testing/stub';
import { getItem } from './actionDelete';

const lookupMock = stub<NotificationLookupData>({
  actions: {
    actionId: {
      Id: 'actionId',
      Title: 'Action Title',
    },
  },
});

describe('getItem', () => {
  it('Should return the correct URL for the item', () => {
    const item = {
      data: { objectId: 'actionId' },
    } as unknown as FeedItem;

    const notification = getItem(item, lookupMock);

    const expectedUrl = auditItemSearch('actionId');
    expect(notification.url).toEqual(expectedUrl);
  });
});
