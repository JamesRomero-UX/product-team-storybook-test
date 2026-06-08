import type { ApolloClient } from '@apollo/client';
import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { ThirdPartyResponse } from 'generated/graphql';
import { ThirdPartyResponseStatusEnum } from 'generated/graphql';
import { isNotificationsEnabled } from 'src/services/orgUtilities';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import type { Sdk } from '../../../generated/graphql2';
import { getRisksmartApiClient } from '../../repositories/getRisksmartApiClient';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { handler } from './thirdPartyResponseSubmittedNotifier';
import { sendNotifications } from './utilities';

vi.mock('src/graphqlClient');
vi.mock('src/repositories/getRisksmartApiClient');
vi.mock('src/services/orgUtilities');
vi.mock('./utilities');

const sendNotificationsMock = vi.mocked(sendNotifications);
const isNotificationsEnabledMock = vi.mocked(isNotificationsEnabled);

vi.mock('sst/node/config', () => {
  return {
    Config: {
      KNOCK_SECRET_KEY: 'mock-knock-secret-key',
    },
  };
});

vi.mock('src/repositories/getRisksmartApiClient', async () => {
  const sdk: Sdk = {
    ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
    getThirdPartyResponsesWithParents: vi.fn(),
  };

  return { getRisksmartApiClient: () => sdk };
});
const apiClientMock = getRisksmartApiClient(stub<ApolloClient<unknown>>({}));
const getThirdPartyResponsesWithParentsMock = vi.mocked(
  apiClientMock.getThirdPartyResponsesWithParents
);

describe('thirdPartyResponseSubmittedNotifier', () => {
  describe('handler', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should ignore non-update events', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<ThirdPartyResponse, 'third_party_response'>
          >
        >({
          'detail-type': 'DataChanged',
          detail: {
            event: {
              op: 'INSERT',
              data: {
                new: { Status: ThirdPartyResponseStatusEnum.AwaitingReview },
              },
            },
            table: { name: 'third_party_response' },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(sendNotificationsMock).not.toHaveBeenCalled();
    });

    it('should ignore events for incorrect tables', async () => {
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<ThirdPartyResponse, 'third_party_response'>
          >
        >({
          'detail-type': 'DataChanged',
          detail: {
            event: {
              op: 'UPDATE',
              data: {
                new: { Status: ThirdPartyResponseStatusEnum.AwaitingReview },
              },
            },
            // @ts-ignore
            table: { name: 'other_table' },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );

      expect(sendNotificationsMock).not.toHaveBeenCalled();
    });

    it.each([
      {
        oldStatus: ThirdPartyResponseStatusEnum.NotStarted,
        newStatus: ThirdPartyResponseStatusEnum.Completed,
      },
      {
        oldStatus: ThirdPartyResponseStatusEnum.InProgress,
        newStatus: ThirdPartyResponseStatusEnum.Rejected,
      },
      {
        oldStatus: ThirdPartyResponseStatusEnum.Recalled,
        newStatus: ThirdPartyResponseStatusEnum.AwaitingReview,
      },
    ])(
      'should ignore events with non-matching statuses',
      async ({ oldStatus, newStatus }) => {
        await handler(
          stub<
            EventBridgeEvent<
              string,
              DataChangeEvent<ThirdPartyResponse, 'third_party_response'>
            >
          >({
            'detail-type': 'DataChanged',
            detail: {
              event: {
                op: 'UPDATE',
                data: {
                  new: { Status: newStatus },
                  old: { Status: oldStatus },
                },
              },
              table: { name: 'third_party_response' },
            },
          }),
          stub<Context>({}),
          vi.fn()
        );

        expect(sendNotificationsMock).not.toHaveBeenCalled();
      }
    );

    it.each([
      {
        oldStatus: ThirdPartyResponseStatusEnum.NotStarted,
        newStatus: ThirdPartyResponseStatusEnum.AwaitingReview,
      },
      {
        oldStatus: ThirdPartyResponseStatusEnum.InProgress,
        newStatus: ThirdPartyResponseStatusEnum.AwaitingReview,
      },
    ])(
      'should process valid events and send notifications',
      async ({ oldStatus, newStatus }) => {
        isNotificationsEnabledMock.mockResolvedValue(true);
        getThirdPartyResponsesWithParentsMock.mockResolvedValue({
          third_party_response: [
            {
              Id: 'response-id',
              ModifiedAtTimestamp: 'timestamp',
              ModifiedByUser: 'user',
              Status: newStatus,
              QuestionnaireTemplateVersionId: '',
              ParentId: '',
              ResponseData: '',
              CreatedAtTimestamp: '',
              CreatedByUser: '',
            },
          ],
        });

        await handler(
          stub<
            EventBridgeEvent<
              string,
              DataChangeEvent<ThirdPartyResponse, 'third_party_response'>
            >
          >({
            'detail-type': 'DataChanged',
            detail: {
              event: {
                op: 'UPDATE',
                data: {
                  old: { Status: oldStatus },
                  new: {
                    Status: newStatus,
                    Id: 'response-id',
                    ModifiedAtTimestamp: 'timestamp',
                    OrgKey: 'org-key',
                    ModifiedByUser: 'user',
                  },
                },
              },
              table: { name: 'third_party_response' },
            },
          }),
          stub<Context>({}),
          vi.fn()
        );

        expect(sendNotificationsMock).toHaveBeenCalled();
      }
    );
  });
});
