import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { randomUUID } from 'crypto';
import {
  AccessTypeEnum,
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
  RiskStatusTypeEnum,
} from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { getEnv } from 'src/environment';
import { getHasuraClient } from 'src/graphqlClient';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import type { Sdk } from 'src/repositories/getRisksmartApiClient';
import {
  getHasuraClaims,
  getTenantNameFromClaims,
  getUserIdFromClaims,
} from 'src/requestHelpers';
import JiraApiClient from 'src/services/jira/apiClient';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getOrAddDepartmentType } from '../utils/department';
import { jiraToRiskHandler } from './jiraToRisk';

vi.mock('src/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));
vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}));

vi.mock('src/environment', () => ({
  getEnv: vi.fn(),
}));

vi.mock('src/backendGraphqlClient', () => ({
  getHasuraBackendClientForAction: vi.fn(),
}));

vi.mock('src/graphqlClient', () => ({
  getHasuraClient: vi.fn(),
}));

vi.mock('src/repositories/getRisksmartApiClient', () => ({
  getRisksmartApiClient: vi.fn(),
}));

vi.mock('src/repositories/getBackendRestApiClient', () => ({
  getBackendRestApiClient: vi.fn(),
}));

vi.mock('src/services/node/nodeService', () => ({
  getNode: vi.fn(),
}));

vi.mock('src/services/role-access/roleAccessService', () => ({
  checkPermission: vi.fn(),
  hasPermission: vi.fn(),
}));

vi.mock('src/session', () => ({
  getSessionData: vi.fn(),
}));

vi.mock('src/requestHelpers', () => ({
  getHasuraClaims: vi.fn(),
  getUserIdFromClaims: vi.fn(),
  getTenantNameFromClaims: vi.fn(),
}));

const mockUpdateIssue = vi.fn().mockResolvedValue({
  id: 'jira-123',
  key: 'TEST-123',
});

vi.mock('src/services/jira/apiClient', () => ({
  default: vi.fn().mockImplementation(() => ({
    updateIssue: vi.fn(),
    getIssue: vi.fn(),
    getUser: vi.fn(),
    handleError: vi.fn(),
    client: {},
  })),
}));

vi.mock('@aws-sdk/client-secrets-manager', () => {
  const SecretsManagerClient = vi.fn();
  SecretsManagerClient.prototype.send = vi.fn();

  return {
    SecretsManagerClient,
    GetSecretValueCommand: vi.fn(),
  };
});

vi.mock('../utils/department', () => ({
  getOrAddDepartmentType: vi.fn(),
}));

describe('jiraToRisk handlerCallback', () => {
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
  const parentRiskId = '123e4567-e89b-12d3-a456-426614174001';
  const ownerId = '123e4567-e89b-12d3-a456-426614174002';
  const contributorId = '123e4567-e89b-12d3-a456-426614174003';
  const ownerAccountId = '123e4567-e89b-12d3-a456-426614174004';
  const contributorAccountId = '123e4567-e89b-12d3-a456-426614174005';
  const ownerEmail = 'owner@example.com';
  const contributorEmail = 'contributor@example.com';

  // Mock Apollo client
  const hasuraClient = mock<ApolloClient<NormalizedCacheObject>>();

  // Mock API client
  const apiClient = mock<Sdk>({
    getUsers: vi.fn(),
    insertChildRisk: vi.fn(),
    updateRisk: vi.fn(),
    insertRiskAssessmentResults: vi.fn(),
    getRiskById: vi.fn(),
  });

  const mockedJiraApiClient = mock<JiraApiClient>({
    updateIssue: mockUpdateIssue,
    getIssue: vi.fn(),
    handleError: vi.fn(),
  });

  // Mock request body
  const mockBody = {
    action: { name: 'jiraToRisk' },
    input: {
      Issue: {
        Title: 'Test Risk',
        Description: 'This is a test risk',
        Summary: 'Test risk summary',
        Status: RiskStatusTypeEnum.Active,
        Key: 'TEST-123',
        OwnerAccountId: ownerAccountId,
        OwnerEmail: ownerEmail,
        ContributorAccountId: contributorAccountId,
        ContributorEmail: contributorEmail,
        Impact: 5,
        Likelihood: 3,
        Rating: 4,
        DepartmentNames: [],
      },
      ParentRiskId: parentRiskId,
      RSUrlCustomFieldKey: 'customfield_10045',
      CustomerConfigSecretId: 'customer-secret-id',
      JiraLinkCustomAttribute: '123_link',
      RiskSummaryCustomAttribute: '456_text',
      SetRefInJira: true,
    },
    event: stub<APIGatewayProxyEventV2>({
      headers: {
        authorization: 'Bearer test-token',
      },
    }),
    session_variables: {
      'x-hasura-user-id': 'test-user-id',
      'x-hasura-role': 'user',
      'x-hasura-org-id': 'org123',
      'x-hasura-tenant-name': 'tenant1',
    },
  };

  // Mock parent node from getNode
  const mockParentNode = {
    Id: parentRiskId,
    ObjectType: ParentTypeEnum.Risk,
    ancestorContributors: [],
  };

  const mockDate = new Date(Date.UTC(2025, 7, 28, 0, 0, 0));

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mocks
    vi.mocked(randomUUID).mockReturnValue(mockUUID);
    vi.mocked(getHasuraClient).mockResolvedValue(hasuraClient);
    vi.mocked(getBackendRestApiClient).mockReturnValue(apiClient);
    vi.mocked(JiraApiClient).mockReturnValue(mockedJiraApiClient);
    vi.mocked(getEnv).mockReturnValue('https://app.risksmart.link');
    vi.useFakeTimers({
      toFake: ['Date'],
    }).setSystemTime(mockDate);

    // Setup getUsers mock response
    vi.mocked(apiClient.getUsers).mockImplementation(async (params) => {
      const email = params?.where?.Email?._ilike;
      if (email === ownerEmail) {
        return { user: [{ Id: ownerId }] };
      } else if (email === contributorEmail) {
        return { user: [{ Id: contributorId }] };
      }

      return { user: [] };
    });

    // Setup insertChildRisk mock response
    vi.mocked(apiClient.insertChildRisk).mockResolvedValue({
      insert_risk_one: {
        Id: mockUUID,
      },
    });

    // Setup updateRisk mock response
    vi.mocked(apiClient.updateRisk).mockResolvedValue({
      update_risk_by_pk: {
        Id: mockUUID,
      },
    } as never);

    // Setup insertRiskAssessmentResults mock response
    vi.mocked(apiClient.insertRiskAssessmentResults).mockResolvedValue({
      insert_risk_assessment_result: {
        affected_rows: 1,
      },
    });

    // Setup getNode mock response
    vi.mocked(getNode).mockImplementation(async (_, id) => {
      if (id === parentRiskId) {
        return mockParentNode;
      }

      return null;
    });

    // Setup hasPermission mock response
    vi.mocked(hasPermission).mockResolvedValue(true);

    // Setup getHasuraClaims mock response
    vi.mocked(getHasuraClaims).mockReturnValue({
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user', 'admin'],
      'x-hasura-user-id': 'test-user-id',
      'x-hasura-org-id': 'org123',
      'x-hasura-tenant-name': 'tenant1',
    });

    // Setup getUserIdFromClaims mock response
    vi.mocked(getUserIdFromClaims).mockReturnValue('test-user-id');

    // Setup getTenantNameFromClaims mock response
    vi.mocked(getTenantNameFromClaims).mockReturnValue('tenant1');

    // Mock secrets manager config response
    // @ts-ignore
    vi.mocked(SecretsManagerClient.prototype.send).mockResolvedValue({
      SecretString: JSON.stringify({
        JiraBaseUrl: 'https://jira.example.com',
        JiraApiToken: 'test-token',
      }),
    });
  });

  it('should successfully create a risk from Jira issue', async () => {
    const result = await jiraToRiskHandler(
      { body: mockBody.input, secretName: 'test-secret-name' },
      mockBody.event
    );

    // Verify user lookups
    expect(apiClient.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { Email: { _ilike: ownerEmail } },
      })
    );
    expect(apiClient.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { Email: { _ilike: contributorEmail } },
      })
    );

    // Verify parent node lookup
    expect(getNode).toHaveBeenCalledWith(hasuraClient, parentRiskId);

    // Verify permission check
    expect(hasPermission).toHaveBeenCalledWith(hasuraClient, {
      userId: 'test-user-id',
      parentObject: mockParentNode,
      objectType: ParentTypeEnum.Risk,
      accessType: AccessTypeEnum.Insert,
    });

    // Verify risk creation
    expect(apiClient.insertChildRisk).toHaveBeenCalledWith({
      Id: mockUUID,
      ParentRiskId: parentRiskId,
      Title: 'Test Risk',
      Tier: 3, // Hardcoded for Jira risks
      Status: RiskStatusTypeEnum.Active,
      Description: 'This is a test risk',
      Treatment: undefined,
      CustomAttributeData: {
        '123_link': 'https://jira.example.com/browse/TEST-123',
        '456_text': 'Test risk summary',
      },
      Owners: [{ UserId: ownerId }],
      OwnerIds: [ownerId],
      Contributors: [{ UserId: contributorId }],
      ContributorIds: [contributorId],
      OwnerGroups: [],
      OwnerGroupIds: [],
      ContributorGroups: [],
      ContributorGroupIds: [],
      Tags: [],
      TagTypeIds: [],
      Departments: [],
      DepartmentTypeIds: [],
      schedule: { Id: mockUUID },
    });

    expect(apiClient.insertRiskAssessmentResults).toHaveBeenCalledWith({
      results: {
        Id: mockUUID,
        TestDate: new Date().toISOString(),
        Impact: 5,
        Likelihood: 3,
        ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
        Rating: 4,
        parents: {
          data: [
            {
              ParentId: mockUUID,
              ParentType: ParentTypeEnum.Risk,
              ResultType: ParentTypeEnum.RiskAssessmentResult,
            },
          ],
        },
      },
    });

    // Verify result
    expect(JSON.parse(result.body)).toEqual({
      Id: mockUUID,
    });
    expect(result.statusCode).toBe(200);
  });

  it('should create a risk without a contributor when no contributor email is provided', async () => {
    const bodyWithoutContributor = {
      ...mockBody,
      input: {
        ...mockBody.input,
        Issue: {
          ...mockBody.input.Issue,
          ContributorEmail: undefined,
          ContributorAccountId: undefined,
        },
      },
    };

    const result = await jiraToRiskHandler(
      { body: bodyWithoutContributor.input, secretName: 'test-secret-name' },
      bodyWithoutContributor.event
    );

    expect(apiClient.insertChildRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        Contributors: [],
      })
    );

    expect(result.statusCode).toBe(200);
  });

  it('should create a risk with fallback user ID when owner email does not match a user', async () => {
    vi.mocked(apiClient.getUsers).mockResolvedValueOnce({ user: [] });

    const result = await jiraToRiskHandler(
      {
        body: { ...mockBody.input, FallbackUserId: 'fallback-user-id' },
        secretName: 'test-secret-name',
      },
      mockBody.event
    );

    expect(apiClient.insertChildRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        Owners: [{ UserId: 'fallback-user-id' }],
      })
    );

    expect(result.statusCode).toBe(200);
  });

  it('should create a risk with fallback user ID when owner is former Jira user', async () => {
    // We infer lack of email as a former user - this means we don't attempt to look up the user
    // in RiskSmart
    vi.mocked(mockedJiraApiClient.getUser).mockResolvedValueOnce({
      self: '',
      accountId: '123',
      accountType: 'atlassian',
      active: false,
      displayName: 'Former user',
    });

    const result = await jiraToRiskHandler(
      {
        body: {
          ...mockBody.input,
          Issue: { ...mockBody.input.Issue, OwnerEmail: undefined },
          FallbackUserId: 'fallback-user-id',
        },
        secretName: 'test-secret-name',
      },
      mockBody.event
    );

    expect(apiClient.insertChildRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        Owners: [{ UserId: 'fallback-user-id' }],
      })
    );

    expect(result.statusCode).toBe(200);
  });

  it('should throw an error when owner email does not match a user and no fallback user ID is provided', async () => {
    vi.mocked(apiClient.getUsers).mockResolvedValueOnce({ user: [] });

    await expect(
      jiraToRiskHandler(
        { body: mockBody.input, secretName: 'test-secret-name' },
        mockBody.event
      )
    ).rejects.toThrow(
      new BadRequest(
        'Failed to match Jira user to RiskSmart user and no fallback user ID provided'
      )
    );
  });

  it('should throw an error when parent risk is not found', async () => {
    vi.mocked(getNode).mockResolvedValue(null);

    await expect(
      jiraToRiskHandler(
        { body: mockBody.input, secretName: 'test-secret-name' },
        mockBody.event
      )
    ).rejects.toThrow(new Forbidden('Access to parent denied'));
  });

  it('should throw an error when parent type is invalid', async () => {
    vi.mocked(getNode).mockResolvedValue({
      ...mockParentNode,
      ObjectType: ParentTypeEnum.Document,
    });

    await expect(
      jiraToRiskHandler(
        { body: mockBody.input, secretName: 'test-secret-name' },
        mockBody.event
      )
    ).rejects.toThrow(new Forbidden('Invalid parent type'));
  });

  it('should throw an error when permission is denied', async () => {
    vi.mocked(hasPermission).mockResolvedValue(false);

    await expect(
      jiraToRiskHandler(
        { body: mockBody.input, secretName: 'test-secret-name' },
        mockBody.event
      )
    ).rejects.toThrow(new Forbidden('Access to parent denied'));
  });

  it('should throw an error when owner email does not match a user', async () => {
    vi.mocked(apiClient.getUsers).mockResolvedValueOnce({ user: [] });

    await expect(
      jiraToRiskHandler(
        { body: mockBody.input, secretName: 'test-secret-name' },
        mockBody.event
      )
    ).rejects.toThrow(
      new BadRequest(
        'Failed to match Jira user to RiskSmart user and no fallback user ID provided'
      )
    );
  });

  it('should throw an error when RSUrl is invalid', async () => {
    const bodyWithRSUrl = {
      ...mockBody,
      input: {
        ...mockBody.input,
        Issue: {
          ...mockBody.input.Issue,
          RSUrl: 'invalid-risk-id',
        },
      },
    };

    await expect(
      jiraToRiskHandler(
        { body: bodyWithRSUrl.input, secretName: 'test-secret-name' },
        bodyWithRSUrl.event
      )
    ).rejects.toThrow(new BadRequest('Invalid RS reference'));
  });

  it('should throw an error when risk insertion fails', async () => {
    vi.mocked(apiClient.insertChildRisk).mockResolvedValue({
      insert_risk_one: null,
    });

    await expect(
      jiraToRiskHandler(
        { body: mockBody.input, secretName: 'test-secret-name' },
        mockBody.event
      )
    ).rejects.toThrow(new Error('Missing risk id'));
  });

  it('should extract GUID and update existing risk when RSUrl is provided', async () => {
    const existingRiskId = 'existing-risk-id';
    const bodyWithRSUrl = {
      ...mockBody,
      input: {
        ...mockBody.input,
        Issue: {
          ...mockBody.input.Issue,
          RSUrl: `https://app.risksmart.link/risks/${existingRiskId}`,
        },
      },
    };

    // Setup mock to return a valid existing risk node
    const existingRiskNode = {
      Id: existingRiskId,
      ObjectType: ParentTypeEnum.Risk,
      ancestorContributors: [],
    };

    vi.mocked(getNode).mockImplementation(async (_, id) => {
      if (id === parentRiskId) {
        return mockParentNode;
      } else if (id === existingRiskId) {
        return existingRiskNode;
      }

      return null;
    });

    // Mock getRiskById to return the existing risk
    vi.mocked(apiClient.getRiskById).mockResolvedValue({
      risk: [
        {
          Id: existingRiskId,
          ParentRiskId: parentRiskId,
          Title: 'Existing Risk',
          Tier: 3,
        },
      ],
    });

    const result = await jiraToRiskHandler(
      { body: bodyWithRSUrl.input, secretName: 'test-secret-name' },
      bodyWithRSUrl.event
    );

    // Verify updateRisk was called instead of insertChildRisk
    expect(apiClient.updateRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        Id: existingRiskId,
        Title: 'Test Risk',
        Description: 'This is a test risk',
        Status: RiskStatusTypeEnum.Active,
        Owners: [{ UserId: ownerId, ParentId: existingRiskId }],
        Contributors: [{ UserId: contributorId, ParentId: existingRiskId }],
      })
    );

    // Verify the result
    expect(JSON.parse(result.body)).toEqual({
      Id: existingRiskId,
    });
    expect(result.statusCode).toBe(200);

    expect(mockedJiraApiClient.updateIssue).not.toHaveBeenCalled();
  });

  it('should create a new risk and update Jira issue when RSRef is not provided', async () => {
    const result = await jiraToRiskHandler(
      { body: mockBody.input, secretName: 'test-secret-name' },
      mockBody.event
    );

    // Verify insertChildRisk was called
    expect(apiClient.insertChildRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        Id: mockUUID,
        ParentRiskId: parentRiskId,
        Title: 'Test Risk',
        Description: 'This is a test risk',
        Status: RiskStatusTypeEnum.Active,
      })
    );

    // Verify the result
    expect(JSON.parse(result.body)).toEqual({
      Id: mockUUID,
    });
    expect(result.statusCode).toBe(200);

    expect(mockedJiraApiClient.updateIssue).toHaveBeenCalledWith(
      'TEST-123',
      expect.objectContaining({
        fields: {
          customfield_10045: `https://app.risksmart.link/risks/${mockUUID}`,
        },
      })
    );

    // Verify that getEnv was called to get the WEB_APP_URL
    expect(getEnv).toHaveBeenCalledWith('WEB_APP_URL');
  });

  it('should handle error when Jira API update fails', async () => {
    mockedJiraApiClient.updateIssue.mockRejectedValue(
      new Error('Jira API error')
    );

    await expect(
      jiraToRiskHandler(
        { body: mockBody.input, secretName: 'test-secret-name' },
        mockBody.event
      )
    ).rejects.toThrow('Jira API error');

    // Verify that insertChildRisk was still called (risk was created)
    expect(apiClient.insertChildRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        Id: mockUUID,
        ParentRiskId: parentRiskId,
      })
    );
  });

  it('should add department type IDs to risk when department names are provided', async () => {
    const departmentNames = ['Finance', 'IT'];
    const bodyWithDepartments = {
      ...mockBody,
      input: {
        ...mockBody.input,
        Issue: {
          ...mockBody.input.Issue,
          DepartmentNames: departmentNames,
        },
      },
    };

    vi.mocked(getOrAddDepartmentType).mockImplementation(async (_, name) => {
      if (name === 'Finance') {
        return 'dept-finance';
      }
      if (name === 'IT') {
        return 'dept-it';
      }
      throw new Error(`Unknown department: ${name}`);
    });

    await jiraToRiskHandler(
      { body: bodyWithDepartments.input, secretName: 'test-secret-name' },
      bodyWithDepartments.event
    );

    // Verify that the risk was created with the correct department type IDs
    expect(apiClient.insertChildRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        Departments: [
          { DepartmentTypeId: 'dept-finance' },
          { DepartmentTypeId: 'dept-it' },
        ],
      })
    );
  });

  it('should return 202 when OwnerAccountId is undefined', async () => {
    const bodyWithoutOwnerAccountId = {
      ...mockBody.input,
      Issue: {
        ...mockBody.input.Issue,
        OwnerAccountId: undefined,
        OwnerEmail: ownerEmail,
      },
    };

    const result = await jiraToRiskHandler(
      { body: bodyWithoutOwnerAccountId, secretName: 'test-secret-name' },
      mockBody.event
    );

    // Verify that no risk creation was attempted
    expect(apiClient.insertChildRisk).not.toHaveBeenCalled();
    expect(apiClient.updateRisk).not.toHaveBeenCalled();

    // Verify the 202 response
    expect(result.statusCode).toBe(202);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Request accepted - insufficient data for risk processing',
      status: 'deferred',
    });
  });

  it('should preserve existing ParentRiskId when updating an existing risk that has a parent', async () => {
    const existingRiskId = 'existing-risk-id';
    const existingParentRiskId = 'existing-parent-risk-id';
    const bodyWithRSUrl = {
      ...mockBody.input,
      Issue: {
        ...mockBody.input.Issue,
        RSUrl: `https://app.risksmart.link/risks/${existingRiskId}`,
      },
      ParentRiskId: 'different-parent-risk-id', // This should NOT override the existing parent
    };

    // Setup mock to return a valid existing risk node
    const existingRiskNode = {
      Id: existingRiskId,
      ObjectType: ParentTypeEnum.Risk,
      ancestorContributors: [],
    };

    // Mock getRiskById to return existing risk with a ParentRiskId
    vi.mocked(apiClient.getRiskById).mockResolvedValue({
      risk: [
        {
          Id: existingRiskId,
          ParentRiskId: existingParentRiskId,
          Title: 'Existing Risk',
          Tier: 3,
        },
      ],
    });

    vi.mocked(getNode).mockImplementation(async (_, id) => {
      if (id === parentRiskId) {
        return mockParentNode;
      } else if (id === 'different-parent-risk-id') {
        return {
          Id: 'different-parent-risk-id',
          ObjectType: ParentTypeEnum.Risk,
          ancestorContributors: [],
        };
      } else if (id === existingRiskId) {
        return existingRiskNode;
      }

      return null;
    });

    const result = await jiraToRiskHandler(
      { body: bodyWithRSUrl, secretName: 'test-secret-name' },
      mockBody.event
    );

    // Verify updateRisk was called with the EXISTING ParentRiskId, not the new one
    expect(apiClient.updateRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        Id: existingRiskId,
        ParentRiskId: existingParentRiskId, // Should preserve existing parent
        Title: 'Test Risk',
      })
    );

    expect(result.statusCode).toBe(200);
  });

  it('should use provided ParentRiskId when updating an existing risk that has no parent', async () => {
    const existingRiskId = 'existing-risk-id';
    const bodyWithRSUrl = {
      ...mockBody.input,
      Issue: {
        ...mockBody.input.Issue,
        RSUrl: `https://app.risksmart.link/risks/${existingRiskId}`,
      },
      ParentRiskId: parentRiskId,
    };

    // Setup mock to return a valid existing risk node
    const existingRiskNode = {
      Id: existingRiskId,
      ObjectType: ParentTypeEnum.Risk,
      ancestorContributors: [],
    };

    // Mock getRiskById to return existing risk with NO ParentRiskId
    vi.mocked(apiClient.getRiskById).mockResolvedValue({
      risk: [
        {
          Id: existingRiskId,
          ParentRiskId: null, // No existing parent
          Title: 'Existing Risk',
          Tier: 3,
        },
      ],
    });

    vi.mocked(getNode).mockImplementation(async (_, id) => {
      if (id === parentRiskId) {
        return mockParentNode;
      } else if (id === existingRiskId) {
        return existingRiskNode;
      }

      return null;
    });

    const result = await jiraToRiskHandler(
      { body: bodyWithRSUrl, secretName: 'test-secret-name' },
      mockBody.event
    );

    // Verify updateRisk was called with the PROVIDED ParentRiskId (fallback)
    expect(apiClient.updateRisk).toHaveBeenCalledWith(
      expect.objectContaining({
        Id: existingRiskId,
        ParentRiskId: parentRiskId, // Should use the provided parent as fallback
        Title: 'Test Risk',
      })
    );

    expect(result.statusCode).toBe(200);
  });
});
