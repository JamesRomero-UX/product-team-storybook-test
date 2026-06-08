import type { ApolloClient } from '@apollo/client';
import {
  AccessTypeEnum,
  ContributorTypeEnum,
  ParentTypeEnum,
} from 'generated/graphql';
import type { Sdk } from 'src/repositories/getRisksmartApiClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { stub } from 'src/testing/stub';

import { hasPermission } from './roleAccessService';

vi.mock('src/repositories/getRisksmartApiClient', async () => {
  const sdk: Sdk = {
    ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
    getRoleAccess: vi.fn(),
  };

  return { getRisksmartApiClient: () => sdk };
});

const hasuraClient = stub<ApolloClient<unknown>>({});
const apiClient = getRisksmartApiClient(hasuraClient);

const getRoleAccessMock = vi.mocked(apiClient.getRoleAccess);

describe('roleAccessService', () => {
  const userId = 'user1234';
  const anotherUserId = 'anotherUser123';

  describe('hasPermission', () => {
    it('returns false if user is not an owner of the parent object and requires Owner access', async () => {
      getRoleAccessMock.mockResolvedValue({
        role_access: [
          {
            ContributorType: ContributorTypeEnum.Owner,
          },
        ],
      });

      const result = await hasPermission(hasuraClient, {
        accessType: AccessTypeEnum.Insert,
        objectType: ParentTypeEnum.Action,
        userId,
        parentObject: {
          ancestorContributors: [
            {
              UserId: anotherUserId,
              ContributorType: ContributorTypeEnum.Owner,
            },
          ],
        },
      });
      expect(result).toEqual(false);
    });

    it('returns false if user is not an owner of ALL the parent objects and requires Owner access', async () => {
      getRoleAccessMock.mockResolvedValue({
        role_access: [
          {
            ContributorType: ContributorTypeEnum.Owner,
          },
        ],
      });

      const result = await hasPermission(hasuraClient, {
        accessType: AccessTypeEnum.Insert,
        objectType: ParentTypeEnum.Action,
        userId,
        parentObject: [
          {
            ancestorContributors: [
              {
                UserId: anotherUserId,
                ContributorType: ContributorTypeEnum.Owner,
              },
            ],
          },
          {
            ancestorContributors: [
              {
                UserId: userId,
                ContributorType: ContributorTypeEnum.Owner,
              },
            ],
          },
        ],
      });
      expect(result).toEqual(false);
    });

    it('returns true if user is an owner of the parent object and requires Owner access', async () => {
      getRoleAccessMock.mockResolvedValue({
        role_access: [
          {
            ContributorType: ContributorTypeEnum.Owner,
          },
        ],
      });

      const result = await hasPermission(hasuraClient, {
        accessType: AccessTypeEnum.Insert,
        objectType: ParentTypeEnum.Action,
        userId,
        parentObject: {
          ancestorContributors: [
            {
              UserId: userId,
              ContributorType: ContributorTypeEnum.Owner,
            },
          ],
        },
      });
      expect(result).toEqual(true);
    });

    it('returns true if user is the owner of ALL the parent objects and requires Owner access', async () => {
      getRoleAccessMock.mockResolvedValue({
        role_access: [
          {
            ContributorType: ContributorTypeEnum.Owner,
          },
        ],
      });

      const result = await hasPermission(hasuraClient, {
        accessType: AccessTypeEnum.Insert,
        objectType: ParentTypeEnum.Action,
        userId,
        parentObject: [
          {
            ancestorContributors: [
              {
                UserId: userId,
                ContributorType: ContributorTypeEnum.Owner,
              },
            ],
          },
          {
            ancestorContributors: [
              {
                UserId: userId,
                ContributorType: ContributorTypeEnum.Owner,
              },
            ],
          },
        ],
      });
      expect(result).toEqual(true);
    });
  });
});
