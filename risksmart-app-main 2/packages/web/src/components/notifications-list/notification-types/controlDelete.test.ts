import type { FeedItem } from '@knocklabs/client';
import type { NotificationLookupData } from 'src/components/notifications-list/notification-types/types';

import { auditItemSearch } from '@/utils/urls';

import { stub } from '../../../testing/stub';
import { getItem } from './controlDelete';

const lookupMock = stub<NotificationLookupData>({
  controls: {
    controlId: {
      Id: 'controlId',
      Title: 'Control Title',
    },
  },
});

describe('getItem', () => {
  it('Should return the correct URL for the item', () => {
    const item = {
      data: { objectId: 'controlId' },
    } as unknown as FeedItem;

    const notification = getItem(item, lookupMock);

    const expectedUrl = auditItemSearch('controlId');
    expect(notification.url).toEqual(expectedUrl);
  });
});
