import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { NetworkStatus } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { UpdateRiskAssessmentResultConfigDocument } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';

import { handler } from './put';

vi.mock('src/backendGraphqlClient');

const TEST_ID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_TIMESTAMP = '2024-01-01T00:00:00Z';

const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
let hasuraMock: MockProxy<ApolloClient<NormalizedCacheObject>>;

const createValidConfig = () => ({
  likelihood: {
    ratings: [
      {
        title: 'Low',
        value: 1,
        color: 'dark-green',
        description: 'Low likelihood',
      },
      {
        title: 'High',
        value: 2,
        color: 'dark-red',
        description: 'High likelihood',
      },
    ],
  },
  impact: {
    categories: [
      { name: 'Financial', color: 'blue' },
      { name: 'Operational', color: 'purple' },
    ],
    ratings: [
      {
        title: 'Minor',
        value: 1,
        color: 'light-green',
        description: 'Minor impact',
      },
      {
        title: 'Major',
        value: 2,
        color: 'light-red',
        description: 'Major impact',
      },
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

const buildEvent = (
  config?: object,
  options?: { id?: string; timestamp?: string }
) =>
  stub<APIGatewayProxyEventV2>({
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: '',
      input: {
        Id: options?.id ?? TEST_ID,
        Config: config ?? createValidConfig(),
        OriginalTimestamp: options?.timestamp ?? TEST_TIMESTAMP,
      },
      session_variables: {
        'x-hasura-user-id': '1',
        'x-hasura-tenant-name': 'MultiTenant',
      },
    }),
  });

const mockQueryWithConfig = (
  config: object,
  options?: { isLatest?: boolean; timestamp?: string }
) => {
  hasuraMock.query.mockResolvedValue({
    data: {
      risk_assessment_result_config_by_pk: {
        Id: TEST_ID,
        Version: 1,
        Config: config,
        IsLatest: options?.isLatest ?? true,
        ModifiedAtTimestamp: options?.timestamp ?? TEST_TIMESTAMP,
      },
    },
    loading: false,
    networkStatus: NetworkStatus.ready,
  });
};

const mockSuccessfulMutation = () => {
  hasuraMock.mutate.mockResolvedValue({
    data: {
      update_risk_assessment_result_config_by_pk: {
        Id: TEST_ID,
        Version: 1,
        IsLatest: true,
      },
    },
  });
};

describe('PUT risk-assessment-result-config', () => {
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

    it('should return 400 when Id is invalid', async () => {
      const result = await handler(
        stub<APIGatewayProxyEventV2>({
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: '',
            input: {
              Id: 'not-a-uuid',
              Config: createValidConfig(),
              OriginalTimestamp: '2024-01-01T00:00:00Z',
            },
            session_variables: {
              'x-hasura-user-id': '1',
              'x-hasura-tenant-name': 'MultiTenant',
            },
          }),
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
    });

    it('should return 400 when config is invalid', async () => {
      const invalidConfig = {
        likelihood: { ratings: [] },
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
    });
  });

  describe('business rule validation', () => {
    it('should return 404 when current config not found', async () => {
      hasuraMock.query.mockResolvedValue({
        data: { risk_assessment_result_config_by_pk: null },
        loading: false,
        networkStatus: NetworkStatus.ready,
      });

      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(404);
    });

    it('should return 400 when trying to update non-latest version', async () => {
      mockQueryWithConfig(createValidConfig(), { isLatest: false });

      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body!);
      expect(body.message).toEqual(
        'Only the latest version of risk assessment result configuration can be updated'
      );
    });

    it('should return 409 when current config has been modified since last view (optimistic locking)', async () => {
      mockQueryWithConfig(createValidConfig(), {
        timestamp: '2024-01-02T00:00:00Z',
      });

      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(409);
    });
  });

  describe('validate changes against current config', () => {
    it('should reject changes to likelihood rating values', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        likelihood: {
          ratings: [
            { title: 'Low', value: 3, color: 'dark-green' }, // Changed value from 1 to 3
            { title: 'High', value: 2, color: 'dark-red' },
          ],
        },
        matrix: [
          {
            title: 'Low',
            value: 1,
            color: 'dark-green',
            likelihood: 3, // Updated to match new likelihood value
            impact: 1,
          },
          {
            title: 'Low',
            value: 1,
            color: 'dark-green',
            likelihood: 3, // Updated to match new likelihood value
            impact: 2,
          },
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
      };

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body!);
      expect(body.message).toContain('Likelihood values cannot be changed');
    });

    it('should reject changes to impact rating values', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        impact: {
          ...existingConfig.impact,
          ratings: [
            { title: 'Minor', value: 5, color: 'light-green' }, // Changed value from 1 to 5
            { title: 'Major', value: 2, color: 'light-red' },
          ],
        },
        matrix: [
          {
            title: 'Low',
            value: 1,
            color: 'dark-green',
            likelihood: 1,
            impact: 5, // Updated to match new impact value
          },
          {
            title: 'Low',
            value: 1,
            color: 'dark-green',
            likelihood: 1,
            impact: 2,
          },
          {
            title: 'High',
            value: 2,
            color: 'dark-red',
            likelihood: 2,
            impact: 5, // Updated to match new impact value
          },
          {
            title: 'High',
            value: 2,
            color: 'dark-red',
            likelihood: 2,
            impact: 2,
          },
        ],
      };

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body!);
      expect(body.message).toContain('Impact values cannot be changed');
    });

    it('should reject adding impact categories', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        impact: {
          ...existingConfig.impact,
          categories: [
            ...existingConfig.impact.categories,
            { name: 'Reputational', color: 'orange' }, // Added category
          ],
        },
      };

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body!);
      expect(body.message).toContain(
        'Impact categories cannot be added or removed'
      );
    });

    it('should reject removing impact categories', async () => {
      const existingConfig = {
        ...createValidConfig(),
        impact: {
          ...createValidConfig().impact,
          categories: [
            { name: 'Financial', color: 'blue' },
            { name: 'Operational', color: 'purple' },
            { name: 'Reputational', color: 'orange' },
          ],
        },
      };
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        impact: {
          ...existingConfig.impact,
          categories: [
            { name: 'Financial', color: 'blue' },
            { name: 'Operational', color: 'purple' },
          ], // Removed one category
        },
      };

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body!);
      expect(body.message).toContain(
        'Impact categories cannot be added or removed'
      );
    });

    it('should reject changes to aggregation method', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        impact: {
          ...existingConfig.impact,
          aggregation: 'maximum' as const, // Changed aggregation
        },
      };

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body!);
      expect(body.message).toContain('aggregation method cannot be changed');
    });

    it('should reject changes to matrix entry values', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        matrix: [
          {
            title: 'Low',
            value: 10, // Changed value
            color: 'dark-green',
            likelihood: 1,
            impact: 1,
          },
          {
            title: 'Low',
            value: 10, // Changed value
            color: 'dark-green',
            likelihood: 1,
            impact: 2,
          },
          existingConfig.matrix[2],
          existingConfig.matrix[3],
        ],
      };

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body!);
      expect(body.message).toContain('Matrix cell values cannot be changed');
    });

    it('should reject changes to matrix likelihood/impact pairs', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      // Swap the pairs between the two matrix entries (maintaining valid config structure)
      const modifiedConfig = {
        ...existingConfig,
        matrix: [
          {
            title: 'Low',
            value: 1,
            color: 'dark-green',
            likelihood: 2, // Swapped from second entry
            impact: 1,
          },
          {
            title: 'Low',
            value: 1,
            color: 'dark-green',
            likelihood: 2, // Swapped from second entry
            impact: 2,
          },
          {
            title: 'High',
            value: 2,
            color: 'dark-red',
            likelihood: 1, // Swapped from first entry
            impact: 1,
          },
          {
            title: 'High',
            value: 2,
            color: 'dark-red',
            likelihood: 1, // Swapped from first entry
            impact: 2,
          },
        ],
      };

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body!);
      expect(body.message).toContain('Matrix cell values cannot be changed');
    });

    it('should reject adding new ratings', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        likelihood: {
          ratings: [
            ...existingConfig.likelihood.ratings,
            { title: 'New', value: 3, color: 'yellow' }, // Added rating
          ],
        },
      };

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
    });
  });

  describe('successful update', () => {
    it('should allow updating titles', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        likelihood: {
          ratings: [
            { title: 'Very Low', value: 1, color: 'dark-green' }, // Changed title
            { title: 'Very High', value: 2, color: 'dark-red' }, // Changed title
          ],
        },
      };

      mockSuccessfulMutation();

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body!)).toEqual({
        Id: TEST_ID,
        Version: 1,
        IsLatest: true,
      });
    });

    it('should allow updating descriptions', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        likelihood: {
          ratings: [
            {
              title: 'Low',
              value: 1,
              color: 'dark-green',
              description: 'New description',
            },
            {
              title: 'High',
              value: 2,
              color: 'dark-red',
              description: 'New description',
            },
          ],
        },
      };

      mockSuccessfulMutation();

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
    });

    it('should allow updating colors', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        likelihood: {
          ratings: [
            { title: 'Low', value: 1, color: 'green' }, // Changed color
            { title: 'High', value: 2, color: 'red' }, // Changed color
          ],
        },
        impact: {
          ...existingConfig.impact,
          categories: [
            { name: 'Financial', color: 'purple' }, // Changed color
            { name: 'Operational', color: 'teal' }, // Changed color
          ],
        },
      };

      mockSuccessfulMutation();

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
    });

    it('should allow updating category names', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        impact: {
          ...existingConfig.impact,
          categories: [
            { name: 'Financial Impact', color: 'blue' }, // Changed name
            { name: 'Ops Impact', color: 'purple' }, // Changed name
          ],
        },
      };

      mockSuccessfulMutation();

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
    });

    it('should allow reordering ratings (same values)', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        likelihood: {
          ratings: [
            existingConfig.likelihood.ratings[1], // Swapped order
            existingConfig.likelihood.ratings[0],
          ],
        },
      };

      mockSuccessfulMutation();

      const result = await handler(
        buildEvent(modifiedConfig),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
    });

    it('should call mutation with correct variables', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);

      const modifiedConfig = {
        ...existingConfig,
        likelihood: {
          ratings: [
            { title: 'Updated Low', value: 1, color: 'dark-green' },
            { title: 'Updated High', value: 2, color: 'dark-red' },
          ],
        },
      };

      mockSuccessfulMutation();

      await handler(buildEvent(modifiedConfig), stub<Context>({}));

      expect(hasuraMock.mutate).toHaveBeenCalledWith({
        mutation: UpdateRiskAssessmentResultConfigDocument,
        variables: {
          Id: TEST_ID,
          Config: modifiedConfig,
        },
      });
    });
  });

  describe('error handling', () => {
    it('should throw error when update returns null', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);
      hasuraMock.mutate.mockResolvedValue({
        data: {
          update_risk_assessment_result_config_by_pk: null,
        },
      });

      await expect(handler(buildEvent(), stub<Context>({}))).rejects.toThrow(
        'Failed to update risk assessment result configuration'
      );
    });

    it('should throw error when update returns undefined', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);
      hasuraMock.mutate.mockResolvedValue({
        data: undefined,
      });

      await expect(handler(buildEvent(), stub<Context>({}))).rejects.toThrow(
        'Failed to update risk assessment result configuration'
      );
    });

    it('should propagate query errors', async () => {
      const queryError = new Error('Database connection failed');
      hasuraMock.query.mockRejectedValue(queryError);

      await expect(handler(buildEvent(), stub<Context>({}))).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should propagate mutation errors', async () => {
      const existingConfig = createValidConfig();
      mockQueryWithConfig(existingConfig);
      const mutationError = new Error('Constraint violation');
      hasuraMock.mutate.mockRejectedValue(mutationError);

      await expect(handler(buildEvent(), stub<Context>({}))).rejects.toThrow(
        'Constraint violation'
      );
    });
  });
});
