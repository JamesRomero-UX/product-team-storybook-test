import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IClient,
  IssueActionsListResponse,
  IssueAssessmentResponse,
  IssueCausesListResponse,
  IssueConsequencesListResponse,
  IssueListQueryResponse,
  IssueUpdatesListResponse,
} from '../../clients/client.interface';
import type {
  IdDateTimeQueryOpts,
  SeqIdQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import { issuesService } from './issues.service';

describe('issues.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof issuesService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryRiskList: vi.fn(),
      getRiskById: vi.fn(),
      getControlById: vi.fn(),
      queryControlList: vi.fn(),
      queryActionList: vi.fn(),
      getActionById: vi.fn(),
      queryIssueList: vi.fn(),
      getIssueById: vi.fn(),
      queryDocumentList: vi.fn(),
      getDocumentById: vi.fn(),
      queryIssueCausesList: vi.fn(),
      getIssueCauseById: vi.fn(),
      queryIssueConsequencesList: vi.fn(),
      getIssueConsequenceById: vi.fn(),
      queryIssueUpdatesList: vi.fn(),
      getIssueUpdateById: vi.fn(),
      queryIssueActionsList: vi.fn(),
      queryIssueAssessment: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = issuesService(mockClient);
  });

  describe('getIssues', () => {
    const mockTrpcResponse: IssueListQueryResponse = {
      issue: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Issue 1',
          Details: 'Details 1',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 1,
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as IssueListQueryResponse['issue'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Title: 'Test Issue 2',
          Details: 'Details 2',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          SequentialId: 2,
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as IssueListQueryResponse['issue'][0],
      ],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    };

    describe('happy path', () => {
      it('should fetch and return issues without filters', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryIssueList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssues(query, mockContext);

        expect(mockClient.queryIssueList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 10,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.issue,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryIssueList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssues(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.issue,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 10,
        };

        vi.mocked(mockClient.queryIssueList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssues(query, mockContext);

        expect(mockClient.queryIssueList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: 10,
            beforeSequentialId: null,
            limit: 5,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.issue,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: null,
        };

        vi.mocked(mockClient.queryIssueList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssues(query, mockContext);

        expect(mockClient.queryIssueList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: null,
            beforeSequentialId: 20,
            limit: 5,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.issue,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty issue list', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: IssueListQueryResponse = {
          issue: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryIssueList).mockResolvedValue(emptyResponse);

        const result = await service.getIssues(query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });

      it('should handle pagination with both afterId and beforeId (afterId takes precedence)', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: 10,
        };

        vi.mocked(mockClient.queryIssueList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssues(query, mockContext);

        expect(mockClient.queryIssueList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: 10,
            beforeSequentialId: 20,
            limit: 5,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.issue,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryIssueList fails', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryIssueList).mockRejectedValue(clientError);

        await expect(service.getIssues(query, mockContext)).rejects.toThrow(
          'tRPC client error'
        );
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryIssueList).mockRejectedValue('string error');

        await expect(service.getIssues(query, mockContext)).rejects.toThrow(
          'string error'
        );
      });

      it('should throw error with detailed message on client failure', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('Database connection lost');

        vi.mocked(mockClient.queryIssueList).mockRejectedValue(clientError);

        await expect(service.getIssues(query, mockContext)).rejects.toThrow(
          'Database connection lost'
        );
      });

      it('should handle network timeout errors', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.queryIssueList).mockRejectedValue(timeoutError);

        await expect(service.getIssues(query, mockContext)).rejects.toThrow(
          'Network timeout'
        );
      });
    });
  });

  describe('getIssueById', () => {
    const mockTrpcIssue = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Issue 1',
      Details: 'Details 1',
      tags: [],
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      SequentialId: 1,
      DateOccurred: '2024-01-01T00:00:00Z',
      DateIdentified: '2024-01-01T00:00:00Z',
      RaisedAtTimestamp: '2024-01-01T00:00:00Z',
      Type: 'incident',
      IsExternalIssue: false,
      owners: [],
      contributors: [],
    } as unknown as NonNullable<
      Awaited<ReturnType<IClient['getIssueById']>>
    >['issue'];

    describe('happy path', () => {
      it('should fetch and return issue by id', async () => {
        const issueId = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          issue: mockTrpcIssue,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIssueById).mockResolvedValue(mockResponse);

        const result = await service.getIssueById(issueId, mockContext);

        expect(mockClient.getIssueById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          issueId
        );

        expect(result).toEqual({
          data: mockResponse.issue,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return issue with form_configuration when present', async () => {
        const issueId = '123e4567-e89b-12d3-a456-426614174000';

        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse = {
          issue: mockTrpcIssue,
          form_configuration: mockFormConfig,
        };
        vi.mocked(mockClient.getIssueById).mockResolvedValue(mockResponse);

        const result = await service.getIssueById(issueId, mockContext);

        expect(result).toEqual({
          data: mockResponse.issue,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when issue is not found (null response)', async () => {
        const issueId = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getIssueById).mockResolvedValue(null);

        const result = await service.getIssueById(issueId, mockContext);

        expect(result).toBeNull();
      });

      it('should handle issue with all optional fields populated', async () => {
        const issueId = '123e4567-e89b-12d3-a456-426614174000';

        const completeIssue = {
          ...mockTrpcIssue,
          Type: 'security',
          IsExternalIssue: true,
          owners: [{ UserId: 'provider|owner1' }],
          contributors: [{ UserId: 'provider|contributor1' }],
          tags: [
            {
              type: {
                Name: 'urgent',
                Description: 'Urgent issue',
              },
            },
          ],
        };

        const mockResponse = {
          issue: completeIssue,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIssueById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getIssueById(issueId, mockContext);

        expect(result).toEqual({
          data: completeIssue,
          form_configuration: null,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const issueId = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getIssueById).mockRejectedValue(clientError);

        await expect(
          service.getIssueById(issueId, mockContext)
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const issueId = '123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(mockClient.getIssueById).mockRejectedValue('string error');

        await expect(
          service.getIssueById(issueId, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error for invalid UUID format', async () => {
        const invalidIssueId = 'not-a-valid-uuid';
        const validationError = new Error('Invalid UUID format');

        vi.mocked(mockClient.getIssueById).mockRejectedValue(validationError);

        await expect(
          service.getIssueById(invalidIssueId, mockContext)
        ).rejects.toThrow('Invalid UUID format');
      });

      it('should handle authorization errors', async () => {
        const issueId = '123e4567-e89b-12d3-a456-426614174000';
        const authError = new Error('Unauthorized access');

        vi.mocked(mockClient.getIssueById).mockRejectedValue(authError);

        await expect(
          service.getIssueById(issueId, mockContext)
        ).rejects.toThrow('Unauthorized access');
      });

      it('should handle network timeout errors', async () => {
        const issueId = '123e4567-e89b-12d3-a456-426614174000';
        const timeoutError = new Error('Request timeout');

        vi.mocked(mockClient.getIssueById).mockRejectedValue(timeoutError);

        await expect(
          service.getIssueById(issueId, mockContext)
        ).rejects.toThrow('Request timeout');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getIssues');
      expect(service).toHaveProperty('getIssueById');
      expect(service).toHaveProperty('getIssueCauses');
      expect(service).toHaveProperty('getIssueCauseById');
      expect(service).toHaveProperty('getIssueConsequences');
      expect(service).toHaveProperty('getIssueConsequenceById');
      expect(service).toHaveProperty('getIssueUpdates');
      expect(service).toHaveProperty('getIssueUpdateById');
      expect(service).toHaveProperty('getIssueActions');
      expect(service).toHaveProperty('getIssueAssessment');
      expect(typeof service.getIssues).toBe('function');
      expect(typeof service.getIssueById).toBe('function');
    });

    it('should create independent service instances', () => {
      const service1 = issuesService(mockClient);
      const service2 = issuesService(mockClient);

      expect(service1).not.toBe(service2);
      expect(service1.getIssues).not.toBe(service2.getIssues);
      expect(service1.getIssueById).not.toBe(service2.getIssueById);
    });
  });

  describe('getIssueCauses', () => {
    const mockDateTimeMetadata = {
      nextId: null,
      nextDateTime: null,
      prevId: null,
      prevDateTime: null,
      hasNext: false,
      hasPrev: false,
      count: 1,
    };

    const mockTrpcResponse: IssueCausesListResponse = {
      cause: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Cause 1',
          Description: 'Description 1',
          Significance: 5,
          ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
        } as unknown as IssueCausesListResponse['cause'][0],
      ],
      pageMetadata: mockDateTimeMetadata,
    };

    describe('happy path', () => {
      it('should fetch and return causes for an issue', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryIssueCausesList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssueCauses(linkId, query, mockContext);

        expect(mockClient.queryIssueCausesList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          { ...query, linkId }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.cause,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty causes list', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const emptyResponse: IssueCausesListResponse = {
          cause: [],
          pageMetadata: { ...mockDateTimeMetadata, count: 0 },
        };

        vi.mocked(mockClient.queryIssueCausesList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getIssueCauses(linkId, query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId and afterDateTime', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: null,
          beforeDateTime: null,
          afterId: 'some-uuid',
          afterDateTime: '2024-01-01T00:00:00Z',
        };

        vi.mocked(mockClient.queryIssueCausesList).mockResolvedValue(
          mockTrpcResponse
        );

        await service.getIssueCauses(linkId, query, mockContext);

        expect(mockClient.queryIssueCausesList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          { ...query, linkId }
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryIssueCausesList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getIssueCauses(linkId, query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });
    });
  });

  describe('getIssueCauseById', () => {
    const mockTrpcCause = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Cause',
      Description: 'Description',
      Significance: 5,
      ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
    };

    describe('happy path', () => {
      it('should fetch and return cause by id', async () => {
        const ids = {
          id: '456e4567-e89b-12d3-a456-426614174001',
          causeId: '123e4567-e89b-12d3-a456-426614174000',
        };

        const mockResponse = {
          cause: mockTrpcCause,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIssueCauseById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getIssueCauseById(ids, mockContext);

        expect(mockClient.getIssueCauseById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          ids.causeId
        );

        expect(result).toEqual({
          data: mockResponse.cause,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return null when cause is not found', async () => {
        const ids = {
          id: '456e4567-e89b-12d3-a456-426614174001',
          causeId: '123e4567-e89b-12d3-a456-426614174000',
        };

        vi.mocked(mockClient.getIssueCauseById).mockResolvedValue(null);

        const result = await service.getIssueCauseById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should use empty string when causeId is missing', async () => {
        const ids = { id: '456e4567-e89b-12d3-a456-426614174001' };

        const mockResponse = {
          cause: mockTrpcCause,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIssueCauseById).mockResolvedValue(
          mockResponse as never
        );

        await service.getIssueCauseById(ids, mockContext);

        expect(mockClient.getIssueCauseById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          ''
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails', async () => {
        const ids = {
          id: '456e4567-e89b-12d3-a456-426614174001',
          causeId: '123e4567-e89b-12d3-a456-426614174000',
        };
        const clientError = new Error('Database error');

        vi.mocked(mockClient.getIssueCauseById).mockRejectedValue(clientError);

        await expect(
          service.getIssueCauseById(ids, mockContext)
        ).rejects.toThrow('Database error');
      });
    });
  });

  describe('getIssueConsequences', () => {
    const mockDateTimeMetadata = {
      nextId: null,
      nextDateTime: null,
      prevId: null,
      prevDateTime: null,
      hasNext: false,
      hasPrev: false,
      count: 1,
    };

    const mockTrpcResponse: IssueConsequencesListResponse = {
      consequence: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Consequence 1',
          Description: 'Description 1',
          CostType: 'financial',
          CostValue: 10000,
          Criticality: 7,
          Type: 'operational',
          ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
        } as unknown as IssueConsequencesListResponse['consequence'][0],
      ],
      pageMetadata: mockDateTimeMetadata,
    };

    describe('happy path', () => {
      it('should fetch and return consequences for an issue', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryIssueConsequencesList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssueConsequences(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryIssueConsequencesList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          { ...query, linkId }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.consequence,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty consequences list', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const emptyResponse: IssueConsequencesListResponse = {
          consequence: [],
          pageMetadata: { ...mockDateTimeMetadata, count: 0 },
        };

        vi.mocked(mockClient.queryIssueConsequencesList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getIssueConsequences(
          linkId,
          query,
          mockContext
        );

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryIssueConsequencesList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getIssueConsequences(linkId, query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });
    });
  });

  describe('getIssueConsequenceById', () => {
    const mockTrpcConsequence = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Consequence',
      Description: 'Description',
      CostType: 'financial',
      CostValue: 10000,
      Criticality: 7,
      Type: 'operational',
      ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
    };

    describe('happy path', () => {
      it('should fetch and return consequence by id', async () => {
        const ids = {
          id: '456e4567-e89b-12d3-a456-426614174001',
          consequenceId: '123e4567-e89b-12d3-a456-426614174000',
        };

        const mockResponse = {
          consequence: mockTrpcConsequence,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIssueConsequenceById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getIssueConsequenceById(ids, mockContext);

        expect(mockClient.getIssueConsequenceById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          ids.consequenceId
        );

        expect(result).toEqual({
          data: mockResponse.consequence,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return null when consequence is not found', async () => {
        const ids = {
          id: '456e4567-e89b-12d3-a456-426614174001',
          consequenceId: '123e4567-e89b-12d3-a456-426614174000',
        };

        vi.mocked(mockClient.getIssueConsequenceById).mockResolvedValue(null);

        const result = await service.getIssueConsequenceById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should use empty string when consequenceId is missing', async () => {
        const ids = { id: '456e4567-e89b-12d3-a456-426614174001' };

        const mockResponse = {
          consequence: mockTrpcConsequence,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIssueConsequenceById).mockResolvedValue(
          mockResponse as never
        );

        await service.getIssueConsequenceById(ids, mockContext);

        expect(mockClient.getIssueConsequenceById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          ''
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails', async () => {
        const ids = {
          id: '456e4567-e89b-12d3-a456-426614174001',
          consequenceId: '123e4567-e89b-12d3-a456-426614174000',
        };
        const clientError = new Error('Database error');

        vi.mocked(mockClient.getIssueConsequenceById).mockRejectedValue(
          clientError
        );

        await expect(
          service.getIssueConsequenceById(ids, mockContext)
        ).rejects.toThrow('Database error');
      });
    });
  });

  describe('getIssueUpdates', () => {
    const mockDateTimeMetadata = {
      nextId: null,
      nextDateTime: null,
      prevId: null,
      prevDateTime: null,
      hasNext: false,
      hasPrev: false,
      count: 1,
    };

    const mockTrpcResponse: IssueUpdatesListResponse = {
      update: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Update 1',
          Description: 'Description 1',
          ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
        } as unknown as IssueUpdatesListResponse['update'][0],
      ],
      pageMetadata: mockDateTimeMetadata,
    };

    describe('happy path', () => {
      it('should fetch and return updates for an issue', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryIssueUpdatesList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssueUpdates(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryIssueUpdatesList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          { ...query, linkId }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.update,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty updates list', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const emptyResponse: IssueUpdatesListResponse = {
          update: [],
          pageMetadata: { ...mockDateTimeMetadata, count: 0 },
        };

        vi.mocked(mockClient.queryIssueUpdatesList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getIssueUpdates(
          linkId,
          query,
          mockContext
        );

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryIssueUpdatesList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getIssueUpdates(linkId, query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });
    });
  });

  describe('getIssueUpdateById', () => {
    const mockTrpcUpdate = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Update',
      Description: 'Description',
      ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
    };

    describe('happy path', () => {
      it('should fetch and return update by id', async () => {
        const ids = {
          id: '456e4567-e89b-12d3-a456-426614174001',
          updateId: '123e4567-e89b-12d3-a456-426614174000',
        };

        const mockResponse = {
          update: mockTrpcUpdate,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIssueUpdateById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getIssueUpdateById(ids, mockContext);

        expect(mockClient.getIssueUpdateById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          ids.updateId
        );

        expect(result).toEqual({
          data: mockResponse.update,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return null when update is not found', async () => {
        const ids = {
          id: '456e4567-e89b-12d3-a456-426614174001',
          updateId: '123e4567-e89b-12d3-a456-426614174000',
        };

        vi.mocked(mockClient.getIssueUpdateById).mockResolvedValue(null);

        const result = await service.getIssueUpdateById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should use empty string when updateId is missing', async () => {
        const ids = { id: '456e4567-e89b-12d3-a456-426614174001' };

        const mockResponse = {
          update: mockTrpcUpdate,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIssueUpdateById).mockResolvedValue(
          mockResponse as never
        );

        await service.getIssueUpdateById(ids, mockContext);

        expect(mockClient.getIssueUpdateById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          ''
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails', async () => {
        const ids = {
          id: '456e4567-e89b-12d3-a456-426614174001',
          updateId: '123e4567-e89b-12d3-a456-426614174000',
        };
        const clientError = new Error('Database error');

        vi.mocked(mockClient.getIssueUpdateById).mockRejectedValue(clientError);

        await expect(
          service.getIssueUpdateById(ids, mockContext)
        ).rejects.toThrow('Database error');
      });
    });
  });

  describe('getIssueActions', () => {
    const mockSeqIdMetadata = {
      nextId: null,
      prevId: null,
      hasNext: false,
      hasPrev: false,
      count: 1,
    };

    const mockTrpcResponse: IssueActionsListResponse = {
      action: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Action 1',
          Details: 'Details 1',
          SequentialId: 1,
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
        } as unknown as IssueActionsListResponse['action'][0],
      ],
      pageMetadata: mockSeqIdMetadata,
    };

    describe('happy path', () => {
      it('should fetch and return actions for an issue', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryIssueActionsList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssueActions(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryIssueActionsList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: query.limit,
            afterSequentialId: query.afterId,
            beforeSequentialId: query.beforeId,
            linkId,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.action,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty actions list', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: IssueActionsListResponse = {
          action: [],
          pageMetadata: { ...mockSeqIdMetadata, count: 0 },
        };

        vi.mocked(mockClient.queryIssueActionsList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getIssueActions(
          linkId,
          query,
          mockContext
        );

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 10,
        };

        vi.mocked(mockClient.queryIssueActionsList).mockResolvedValue(
          mockTrpcResponse
        );

        await service.getIssueActions(linkId, query, mockContext);

        expect(mockClient.queryIssueActionsList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 5,
            afterSequentialId: 10,
            beforeSequentialId: null,
            linkId,
          }
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails', async () => {
        const linkId = '456e4567-e89b-12d3-a456-426614174001';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryIssueActionsList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getIssueActions(linkId, query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });
    });
  });

  describe('getIssueAssessment', () => {
    const mockAssessmentData = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
      IssueType: 'breach',
      Severity: 3,
      TargetCloseDate: '2024-12-31T00:00:00Z',
      ActualCloseDate: null,
      Status: 'open',
      CertifiedIndividual: 'provider|user1',
      RegulatoryBreach: true,
      RegulationsBreached: 'GDPR Article 5',
      Reportable: true,
      Rationale: 'Test rationale',
      IssueCausedByThirdParty: false,
      ThirdPartyResponsible: null,
      IssueCausedBySystemIssue: true,
      SystemResponsible: 'CRM System',
      PolicyBreach: true,
      PoliciesBreached: 'Data Protection Policy',
      PolicyOwner: 'provider|user2',
      PolicyOwnerCommentary: 'Needs review',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      Meta: null,
      CustomAttributeData: null,
      Type: 'issue_assessment',
      certifiedIndividual: null,
      policyOwner: null,
      departments: [],
    } as NonNullable<IssueAssessmentResponse>['issueAssessment'];

    const mockFormConfiguration = {
      Id: 'form-config-id',
      Configuration: {},
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user1',
      ParentType: 'issue_assessment',
      CustomAttributeSchemaId: null,
      fields_config: [],
      customAttributeSchema: null,
      createdByUser: null,
      modifiedByUser: null,
    } as NonNullable<IssueAssessmentResponse>['form_configuration'];

    describe('happy path', () => {
      it('should fetch and return assessment for an issue', async () => {
        const issueId = '456e4567-e89b-12d3-a456-426614174001';

        const mockTrpcResponse: IssueAssessmentResponse = {
          issueAssessment: mockAssessmentData,
          form_configuration: mockFormConfiguration,
        };

        vi.mocked(mockClient.queryIssueAssessment).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssueAssessment(issueId, mockContext);

        expect(mockClient.queryIssueAssessment).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          { id: issueId }
        );

        expect(result).toEqual({
          data: mockAssessmentData,
          form_configuration: mockFormConfiguration,
        });
      });

      it('should return assessment without form_configuration when not present', async () => {
        const issueId = '456e4567-e89b-12d3-a456-426614174001';

        const mockTrpcResponse: IssueAssessmentResponse = {
          issueAssessment: mockAssessmentData,
          form_configuration: null,
        };

        vi.mocked(mockClient.queryIssueAssessment).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIssueAssessment(issueId, mockContext);

        expect(result).toEqual({
          data: mockAssessmentData,
          form_configuration: null,
        });
      });

      it('should return null when assessment is not found', async () => {
        const issueId = '456e4567-e89b-12d3-a456-426614174001';

        vi.mocked(mockClient.queryIssueAssessment).mockResolvedValue(null);

        const result = await service.getIssueAssessment(issueId, mockContext);

        expect(result).toBeNull();
      });

      it('should return null when id is empty string', async () => {
        const result = await service.getIssueAssessment('', mockContext);

        expect(result).toBeNull();
        expect(mockClient.queryIssueAssessment).not.toHaveBeenCalled();
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails', async () => {
        const issueId = '456e4567-e89b-12d3-a456-426614174001';
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryIssueAssessment).mockRejectedValue(
          clientError
        );

        await expect(
          service.getIssueAssessment(issueId, mockContext)
        ).rejects.toThrow('tRPC client error');
      });
    });
  });
});
