import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { InsertRiskAssessmentResultConfigDocument } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';

import { handler } from './post';

vi.mock('src/backendGraphqlClient');

const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
let hasuraMock: MockProxy<ApolloClient<NormalizedCacheObject>>;

const createValidConfig = () => ({
  likelihood: {
    ratings: [
      { title: 'Low', value: 1, color: 'dark-green' },
      { title: 'High', value: 2, color: 'dark-red' },
    ],
  },
  impact: {
    categories: [
      { name: 'Financial', color: 'blue' },
      { name: 'Operational', color: 'purple' },
    ],
    ratings: [
      { title: 'Minor', value: 1, color: 'light-green' },
      { title: 'Major', value: 2, color: 'light-red' },
    ],
    aggregation: 'average' as const,
  },
  matrix: [
    { title: 'Low', value: 1, color: 'dark-green', likelihood: 1, impact: 1 },
    { title: 'Low', value: 1, color: 'dark-green', likelihood: 1, impact: 2 },
    {
      title: 'High',
      value: 2,
      color: 'dark-red',
      likelihood: 2,
      impact: 1,
    },
    {
      title: 'High',
      value: 2,
      color: 'dark-red',
      likelihood: 2,
      impact: 2,
    },
  ],
});

const buildEvent = (config?: object) => {
  return stub<APIGatewayProxyEventV2>({
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: '',
      input: {
        Config: config ?? createValidConfig(),
      },
      session_variables: {
        'x-hasura-user-id': '1',
        'x-hasura-tenant-name': 'MultiTenant',
      },
    }),
  });
};

describe('POST risk-assessment-result-config', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
    getHasuraBackendClientForActionMock.mockReturnValue(hasuraMock);
  });

  describe('request validation', () => {
    it('should return 400 when body is missing', async () => {
      const result = await handler(
        stub<APIGatewayProxyEventV2>({}),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
    });

    it('should return 400 when config is invalid', async () => {
      const invalidConfig = {
        likelihood: {
          ratings: [], // Invalid: empty array
        },
        impact: {
          categories: [
            { name: 'Financial', color: 'blue' },
            { name: 'Operational', color: 'purple' },
          ],
          ratings: [{ title: 'Low', value: 1, color: 'green' }],
          aggregation: 'average',
        },
        matrix: [],
      };

      const result = await handler(
        buildEvent(invalidConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body!);
      expect(JSON.parse(body.message)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'At least one likelihood rating is required',
          }),
        ])
      );
    });
  });

  describe('successful insert', () => {
    it('should return 200 with created config details', async () => {
      const mockInsertResult = {
        data: {
          insert_risk_assessment_result_config_one: {
            Id: 'config-123',
            Version: 1,
            IsLatest: true,
          },
        },
      };
      hasuraMock.mutate.mockResolvedValue(mockInsertResult);

      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body!)).toEqual({
        Id: 'config-123',
        Version: 1,
        IsLatest: true,
      });
    });

    it('should call mutation with correct variables', async () => {
      const mockInsertResult = {
        data: {
          insert_risk_assessment_result_config_one: {
            Id: 'config-123',
            Version: 1,
            IsLatest: true,
          },
        },
      };
      hasuraMock.mutate.mockResolvedValue(mockInsertResult);
      const config = createValidConfig();

      await handler(buildEvent(config), stub<Context>({}));

      expect(hasuraMock.mutate).toHaveBeenCalledWith({
        mutation: InsertRiskAssessmentResultConfigDocument,
        variables: {
          object: {
            Config: config,
          },
        },
      });
    });
  });

  describe('error handling', () => {
    it('should throw error when insert returns null', async () => {
      hasuraMock.mutate.mockResolvedValue({
        data: {
          insert_risk_assessment_result_config_one: null,
        },
      });

      await expect(handler(buildEvent(), stub<Context>({}))).rejects.toThrow(
        'Failed to insert risk assessment result config'
      );
    });

    it('should throw error when insert returns undefined', async () => {
      hasuraMock.mutate.mockResolvedValue({
        data: undefined,
      });

      await expect(handler(buildEvent(), stub<Context>({}))).rejects.toThrow(
        'Failed to insert risk assessment result config'
      );
    });

    it('should propagate mutation errors', async () => {
      const mutationError = new Error('Database connection failed');
      hasuraMock.mutate.mockRejectedValue(mutationError);

      await expect(handler(buildEvent(), stub<Context>({}))).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
