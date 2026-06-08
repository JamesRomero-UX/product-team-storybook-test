import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  InsertChildActionMutation,
  InsertChildRiskInput,
  InsertIssueInput,
  InsertIssueMutation,
  InsertRiskMutation,
  UpdateActionMutation,
  UpdateIssueInput,
} from '../generated/graphql';
import type { GraphqlClient, GraphqlClientConfig } from '../graphql/client';
import type { CreateActionRequest } from '../schemas/actions/action-mutate-request.schema';
import type { CreateIssueRequest } from '../schemas/issues/issue-mutate-request.schema';
import type { GraphqlMutationClientConfig } from './graphql-mutation-client.adapter';
import {
  createGraphqlMutationClient,
  createMutationClientFromGraphql,
} from './graphql-mutation-client.adapter';
import type {
  CreateRiskMutationData,
  MutationContext,
} from './mutation-client.interface';

const mockMutate = vi.fn();
let capturedConfig: GraphqlClientConfig | undefined;

vi.mock('../graphql/client', () => ({
  createGraphqlClient: vi
    .fn()
    .mockImplementation((config: GraphqlClientConfig) => {
      capturedConfig = config;

      return { mutate: mockMutate } satisfies GraphqlClient;
    }),
}));

const mockConfig: GraphqlMutationClientConfig = {
  hasuraEndpoint: 'https://hasura.example.com/v1/graphql',
  hasuraAdminSecret: 'admin-secret-123',
  userId: 'user-abc',
  roleName: 'org_user',
};

const mockCtx: MutationContext = {
  orgId: 'org-123',
  tenantId: 'tenant-456',
};

const mockCreateRiskRequest: CreateRiskMutationData = {
  title: 'Test Risk',
  description: 'A test risk',
  tier: 1,
  treatment: RiskTreatmentType.Treat,
  status: RiskStatusType.Active,
  owners: ['provider|user-1'],
};

const successMutationResult = {
  data: {
    insertChildRisk: { Id: 'risk-id-1' },
  } as InsertRiskMutation,
  errors: undefined,
};

describe('createGraphqlMutationClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedConfig = undefined;
  });

  it('should create a graphql client with correct endpoint and static headers', () => {
    createGraphqlMutationClient(mockConfig);

    expect(capturedConfig).toEqual({
      endpoint: 'https://hasura.example.com/v1/graphql',
      defaultHeaders: {
        'x-hasura-admin-secret': 'admin-secret-123',
        'x-hasura-user-id': 'user-abc',
        'x-hasura-role': 'org_user',
      },
    });
  });
});

describe('createMutationClientFromGraphql', () => {
  let mockGraphqlClient: GraphqlClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGraphqlClient = { mutate: mockMutate };
  });

  describe('insertIndicatorResult', () => {
    it('should call mutate with transformed GraphQL variables and context headers', async () => {
      mockMutate.mockResolvedValue({
        data: { insert_indicator_result_one: { Id: 'result-id-1' } },
        errors: undefined,
      });

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.insertIndicatorResult(
        {
          indicatorId: 'indicator-id-1',
          resultDate: '2024-01-15T10:30:00.000Z',
          description: 'Q1 result',
          targetValueNum: 42.5,
          targetValueTxt: null,
        },
        mockCtx
      );

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        {
          IndicatorId: 'indicator-id-1',
          ResultDate: '2024-01-15T10:30:00.000Z',
          Description: 'Q1 result',
          TargetValueNum: 42.5,
          TargetValueTxt: null,
          CustomAttributeData: null,
        },
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });
  });

  describe('updateIndicatorResult', () => {
    it('should call mutate with transformed GraphQL variables and context headers', async () => {
      mockMutate.mockResolvedValue({
        data: {
          update_indicator_result: { returning: [{ Id: 'result-id-1' }] },
        },
        errors: undefined,
      });

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.updateIndicatorResult(
        {
          resultId: 'result-id-1',
          resultDate: '2024-02-15T10:30:00.000Z',
          description: 'Updated',
          targetValueNum: 50,
          targetValueTxt: null,
        },
        mockCtx
      );

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        {
          id: 'result-id-1',
          ResultDate: '2024-02-15T10:30:00.000Z',
          Description: 'Updated',
          TargetValueNum: 50,
          TargetValueTxt: null,
          CustomAttributeData: null,
        },
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });
  });

  describe('deleteIndicatorResult', () => {
    it('should call mutate with ids and context headers', async () => {
      mockMutate.mockResolvedValue({
        data: { delete_indicator_result: { affected_rows: 1 } },
        errors: undefined,
      });

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.deleteIndicatorResult({ ids: ['result-id-1'] }, mockCtx);

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        { ids: ['result-id-1'] },
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });
  });

  describe('insertRisk', () => {
    it('should call mutate with transformed GraphQL variables and context headers', async () => {
      mockMutate.mockResolvedValue(successMutationResult);

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.insertRisk(mockCreateRiskRequest, mockCtx);

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        {
          object: expect.objectContaining({
            Title: 'Test Risk',
            Description: 'A test risk',
            Tier: 1,
            ParentRiskId: null,
            Treatment: 'treat',
            Status: 'active',
            OwnerUserIds: ['provider|user-1'],
            OwnerGroupIds: [],
            ContributorUserIds: [],
            ContributorGroupIds: [],
            TagTypeIds: [],
            DepartmentTypeIds: [],
          }) as InsertChildRiskInput,
        },
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });

    it('should return data and errors from mutation result on success', async () => {
      mockMutate.mockResolvedValue(successMutationResult);

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      const result = await client.insertRisk(mockCreateRiskRequest, mockCtx);

      expect(result).toEqual({
        data: { insertChildRisk: { Id: 'risk-id-1' } },
        errors: undefined,
      });
    });

    it('should return errors from a failed mutation', async () => {
      const graphqlErrors = [{ message: 'Validation failed' }];
      mockMutate.mockResolvedValue({
        data: null,
        errors: graphqlErrors,
      });

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      const result = await client.insertRisk(mockCreateRiskRequest, mockCtx);

      expect(result).toEqual({
        data: null,
        errors: graphqlErrors,
      });
    });

    it('should propagate errors thrown by the graphql client', async () => {
      mockMutate.mockRejectedValue(new Error('Network failure'));

      const client = createMutationClientFromGraphql(mockGraphqlClient);

      await expect(
        client.insertRisk(mockCreateRiskRequest, mockCtx)
      ).rejects.toThrow('Network failure');
    });

    it('should pass different context headers for different calls', async () => {
      mockMutate.mockResolvedValue(successMutationResult);

      const secondCtx: MutationContext = {
        orgId: 'org-999',
        tenantId: 'tenant-888',
      };

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.insertRisk(mockCreateRiskRequest, mockCtx);
      await client.insertRisk(mockCreateRiskRequest, secondCtx);

      expect(mockMutate).toHaveBeenCalledTimes(2);

      expect(mockMutate.mock.calls[0]![2]).toEqual({
        'x-hasura-org-id': 'org-123',
        'x-tenant-name': 'tenant-456',
      });
      expect(mockMutate.mock.calls[1]![2]).toEqual({
        'x-hasura-org-id': 'org-999',
        'x-tenant-name': 'tenant-888',
      });
    });
  });

  describe('insertIssue', () => {
    const mockCreateIssueRequest: CreateIssueRequest & { type: string } = {
      title: 'Test Issue',
      description: 'A test issue',
      dateIdentified: '2024-01-15T00:00:00Z',
      dateOccurred: '2024-01-10T00:00:00Z',
      impactsCustomer: true,
      isExternalIssue: false,
      owners: ['provider|user-1'],
      type: 'issue',
    };

    const issueSuccessResult = {
      data: {
        insertChildIssue: { Id: 'issue-id-1', SequentialId: 1 },
      } as InsertIssueMutation,
      errors: undefined,
    };

    it('should call mutate with transformed GraphQL variables and context headers', async () => {
      mockMutate.mockResolvedValue(issueSuccessResult);

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.insertIssue(mockCreateIssueRequest, mockCtx);

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        {
          object: expect.objectContaining({
            Title: 'Test Issue',
            Details: 'A test issue',
            DateIdentified: '2024-01-15T00:00:00Z',
            DateOccurred: '2024-01-10T00:00:00Z',
            ImpactsCustomer: true,
            IsExternalIssue: false,
            Type: 'issue',
            OwnerUserIds: ['provider|user-1'],
            OwnerGroupIds: [],
            ContributorUserIds: [],
            ContributorGroupIds: [],
            TagTypeIds: [],
            DepartmentTypeIds: [],
          }) as InsertIssueInput,
        },
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });

    it('should return data and errors from mutation result', async () => {
      mockMutate.mockResolvedValue(issueSuccessResult);

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      const result = await client.insertIssue(mockCreateIssueRequest, mockCtx);

      expect(result).toEqual(issueSuccessResult);
    });
  });

  describe('updateIssue', () => {
    it('should call mutate with transformed variables including Id and OriginalTimestamp', async () => {
      mockMutate.mockResolvedValue({
        data: { updateIssueApi: { affected_rows: 1 } },
        errors: undefined,
      });

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.updateIssue(
        {
          title: 'Updated Issue',
          description: 'Updated desc',
          dateIdentified: '2024-02-15T00:00:00Z',
          dateOccurred: '2024-02-10T00:00:00Z',
          owners: ['provider|user-2'],
          id: 'issue-id-1',
          originalTimestamp: '2024-01-01T00:00:00Z',
        },
        mockCtx
      );

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        {
          object: expect.objectContaining({
            Title: 'Updated Issue',
            Id: 'issue-id-1',
            OriginalTimestamp: '2024-01-01T00:00:00Z',
          }) as UpdateIssueInput,
        },
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });
  });

  describe('deleteIssue', () => {
    it('should call mutate with Ids variable', async () => {
      mockMutate.mockResolvedValue({
        data: { deleteIssuesById: { affected_rows: 1 } },
        errors: undefined,
      });

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.deleteIssue({ ids: ['issue-id-1'] }, mockCtx);

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        { ids: ['issue-id-1'] },
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });
  });

  describe('insertAction', () => {
    const mockCreateActionRequest: CreateActionRequest = {
      title: 'Test Action',
      status: ActionStatus.Open,
      dateRaised: '2024-01-10T00:00:00Z',
      dateDue: '2024-03-10T00:00:00Z',
      description: 'A test action',
      priority: 2,
      closedDate: null,
      owners: ['provider|user-1'],
      parentId: null,
    };

    it('should call mutate with transformed GraphQL variables and context headers', async () => {
      mockMutate.mockResolvedValue({
        data: {
          insertChildAction: { Id: 'action-id-1' },
        } as InsertChildActionMutation,
        errors: undefined,
      });

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.insertAction(mockCreateActionRequest, mockCtx);

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        expect.objectContaining({
          Title: 'Test Action',
          Status: ActionStatus.Open,
          DateRaised: '2024-01-10T00:00:00Z',
          DateDue: '2024-03-10T00:00:00Z',
          Description: 'A test action',
          Priority: 2,
          ClosedDate: null,
          ParentId: null,
          OwnerUserIds: ['provider|user-1'],
          OwnerGroupIds: [],
          ContributorUserIds: [],
          ContributorGroupIds: [],
        }),
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });

    it('should return result from mutation', async () => {
      const successResult = {
        data: {
          insertChildAction: { Id: 'action-id-1' },
        } as InsertChildActionMutation,
        errors: undefined,
      };
      mockMutate.mockResolvedValue(successResult);

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      const result = await client.insertAction(
        mockCreateActionRequest,
        mockCtx
      );

      expect(result).toEqual(successResult);
    });
  });

  describe('updateAction', () => {
    it('should call mutate with Id and OriginalTimestamp merged into variables', async () => {
      mockMutate.mockResolvedValue({
        data: {
          updateChildAction: { affected_rows: 1, change_request_id: null },
        } as UpdateActionMutation,
        errors: undefined,
      });

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.updateAction(
        {
          title: 'Updated Action',
          status: ActionStatus.Pending,
          dateRaised: '2024-02-10T00:00:00Z',
          dateDue: '2024-04-10T00:00:00Z',
          description: null,
          priority: 1,
          closedDate: null,
          owners: ['provider|user-2'],
          id: 'action-id-1',
          originalTimestamp: '2024-01-01T00:00:00Z',
        },
        mockCtx
      );

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        expect.objectContaining({
          Title: 'Updated Action',
          Id: 'action-id-1',
          OriginalTimestamp: '2024-01-01T00:00:00Z',
        }),
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });
  });

  describe('deleteActions', () => {
    it('should call mutate with ids and context headers', async () => {
      mockMutate.mockResolvedValue({
        data: { deleteActionsById: { affected_rows: 1 } },
        errors: undefined,
      });

      const client = createMutationClientFromGraphql(mockGraphqlClient);
      await client.deleteActions({ ids: ['action-id-1'] }, mockCtx);

      expect(mockMutate).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        { ids: ['action-id-1'] },
        {
          'x-hasura-org-id': 'org-123',
          'x-tenant-name': 'tenant-456',
        }
      );
    });
  });
});
