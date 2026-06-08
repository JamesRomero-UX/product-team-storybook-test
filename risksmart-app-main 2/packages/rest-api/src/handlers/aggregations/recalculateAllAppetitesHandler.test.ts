import type { ApolloClient } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import type { GetChildRisksQuery } from 'generated/graphql';
import { AppetiteModelEnum } from 'generated/graphql';
import type { Sdk } from 'generated/graphql2';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getChildRisks } from 'src/services/risk/riskService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import { inheritAppetite } from './models/appetiteCascading';
import { handler } from './recalculateAllAppetitesHandler';

vi.mock('src/services/aggregation/aggregationService');
vi.mock('src/services/risk/riskService');
vi.mock('src/backendGraphqlClient');
vi.mock('src/adminGraphqlClient');
vi.mock('./models/appetiteCascading');

const getChildRisksMock = vi.mocked(getChildRisks);
const inheritAppetiteMock = vi.mocked(inheritAppetite);

vi.mock('src/repositories/getRisksmartApiClient', async () => {
  const sdk: Sdk = {
    ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
    getAggregationSettingsForOrg: vi.fn(),
    getRiskByTier: vi.fn(),
  };

  return { getRisksmartApiClient: () => sdk };
});
const apiClient = getRisksmartApiClient(stub<ApolloClient<unknown>>({}));
const getRiskByTierMock = vi.mocked(apiClient.getRiskByTier);

const getAggregationSettingsForOrgMock = vi.mocked(
  apiClient.getAggregationSettingsForOrg
);

describe('recalculateAllAppetitesHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns when the org does not support aggregation', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        body: JSON.stringify({
          session_variables: {
            'x-hasura-tenant-name': 'tenant',
            'x-hasura-org-id': 'org',
            'x-hasura-user-id': 'userId',
          },
          input: {},
        }),
      }),
      stub<Context>({})
    );
    expect(result).toMatchObject({
      statusCode: 200,
      body: JSON.stringify({
        message: 'Aggregation not supported for this org',
      }),
    });
  });

  it('returns when appetite aggregation model is not supported', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [
        {
          Appetite: null,
          OrgKey: '',
        },
      ],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        body: JSON.stringify({
          session_variables: {
            'x-hasura-tenant-name': 'tenant',
            'x-hasura-org-id': 'org',
            'x-hasura-user-id': 'userId',
          },
          input: {},
        }),
      }),
      stub<Context>({})
    );
    expect(result).toMatchObject({
      statusCode: 200,
      body: JSON.stringify({
        message: 'Unsupported appetite aggregation type null',
      }),
    });
  });

  it('recalculates all appetites', async () => {
    getAggregationSettingsForOrgMock.mockResolvedValueOnce({
      aggregation_org: [
        {
          Appetite: AppetiteModelEnum.TopDownCascade,
          OrgKey: 'org',
        },
      ],
    });
    getRiskByTierMock.mockResolvedValueOnce({
      risk: [
        { Id: '1', childRisks: [] },
        { Id: '2', childRisks: [] },
        { Id: '3', childRisks: [] },
      ],
    });
    type Risk = GetChildRisksQuery['risk'][number];

    const childRisk1: Risk = {
      Id: '4',
      OrgKey: 'org',
      Tier: 2,
      ParentRiskId: '1',
      ModifiedAtTimestamp: '2021-01-01T10:00:00Z',
      ModifiedByUser: 'user',
      CreatedAtTimestamp: '2021-01-01T10:00:00Z',
      CreatedByUser: 'user',
      Title: 'title',
    };
    const childRisk2: Risk = {
      Id: '5',
      OrgKey: 'org',
      Tier: 3,
      ParentRiskId: '4',
      ModifiedAtTimestamp: '2021-01-01T10:00:00Z',
      ModifiedByUser: 'user',
      CreatedAtTimestamp: '2021-01-01T10:00:00Z',
      CreatedByUser: 'user',
      Title: 'title',
    };
    const childRisk3: Risk = {
      Id: '6',
      OrgKey: 'org',
      Tier: 2,
      ParentRiskId: '2',
      ModifiedAtTimestamp: '2021-01-01T10:00:00Z',
      ModifiedByUser: 'user',
      CreatedAtTimestamp: '2021-01-01T10:00:00Z',
      CreatedByUser: 'user',
      Title: 'title',
    };
    const childRisk4: Risk = {
      Id: '6',
      OrgKey: 'org',
      Tier: 3,
      ParentRiskId: '6',
      ModifiedAtTimestamp: '2021-01-01T10:00:00Z',
      ModifiedByUser: 'user',
      CreatedAtTimestamp: '2021-01-01T10:00:00Z',
      CreatedByUser: 'user',
      Title: 'title',
    };
    getChildRisksMock.mockResolvedValueOnce([childRisk1, childRisk2]);
    getChildRisksMock.mockResolvedValueOnce([childRisk3, childRisk4]);

    await handler(
      stub<APIGatewayProxyEventV2>({
        body: JSON.stringify({
          session_variables: {
            'x-hasura-tenant-name': 'tenant',
            'x-hasura-org-id': 'org',
            'x-hasura-user-id': 'userId',
          },
          input: {},
        }),
      }),
      stub<Context>({})
    );

    expect(inheritAppetiteMock).toHaveBeenCalledTimes(4);
    // Reminder, must inherit appetite in ascending order of tiers
    expect(inheritAppetiteMock).toHaveBeenNthCalledWith(
      1,
      undefined,
      childRisk1
    );
    expect(inheritAppetiteMock).toHaveBeenNthCalledWith(
      2,
      undefined,
      childRisk3
    );
    expect(inheritAppetiteMock).toHaveBeenNthCalledWith(
      3,
      undefined,
      childRisk2
    );
    expect(inheritAppetiteMock).toHaveBeenNthCalledWith(
      4,
      undefined,
      childRisk4
    );
  });
});
