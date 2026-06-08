import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { IssueAssessmentStatusEnum, ParentTypeEnum } from 'generated/graphql2';
import { BadRequest, Unauthorized } from 'http-errors';
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
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getDepartmentType } from '../utils/department';
import { jiraToIssueHandler } from './jiraToIssue';

vi.mock('@sentry/aws-serverless', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}));

vi.mock('src/environment', () => ({
  getEnv: vi.fn(),
}));

vi.mock('src/graphqlClient', () => ({
  getHasuraClient: vi.fn(),
}));

vi.mock('src/repositories/getBackendRestApiClient', () => ({
  getBackendRestApiClient: vi.fn(),
}));

vi.mock('src/services/node/nodeService', () => ({
  getNode: vi.fn(),
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
  getDepartmentType: vi.fn(),
}));

describe('jiraToIssue handler', () => {
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockAssessmentUUID = '123e4567-e89b-12d3-a456-426614174006';
  const ownerId = '123e4567-e89b-12d3-a456-426614174002';
  const contributorId = '123e4567-e89b-12d3-a456-426614174003';
  const ownerAccountId = '123e4567-e89b-12d3-a456-426614174004';
  const contributorAccountId = '123e4567-e89b-12d3-a456-426614174005';
  const ownerEmail = 'owner@example.com';
  const contributorEmail = 'contributor@example.com';
  const departmentTypeId = 'dept-finance';

  // Mock Apollo client
  const hasuraClient = mock<ApolloClient<NormalizedCacheObject>>();

  // Mock API client
  const apiClient = mock<Sdk>({
    getUsers: vi.fn(),
    insertIssueWithoutParent: vi.fn(),
    insertIssueAssessment: vi.fn(),
    updateIssue: vi.fn(),
    getIssueDetailsById: vi.fn(),
  });

  const mockedJiraApiClient = mock<JiraApiClient>({
    updateIssue: mockUpdateIssue,
    getIssue: vi.fn(),
    getUser: vi.fn(),
    handleError: vi.fn(),
  });

  const mockedDepartmentUtils = vi.mocked(getDepartmentType);

  // Mock request body
  const mockBody = {
    Issue: {
      Title: 'Test Issue',
      Description: 'This is a test issue',
      Key: 'TEST-123',
      DepartmentName: 'Finance',
      ImpactsCustomer: true,
      IsExternalIssue: false,
      AssessmentStatus: IssueAssessmentStatusEnum.Closed,
      DateOccurred: '2025-12-24T00:00:00.000Z',
      DateIdentified: '2025-12-24T00:00:00.000Z',
      OwnerAccountIds: [ownerAccountId],
      ContributorAccountIds: [contributorAccountId],
      CustomAttributeData: {},
      IssueAssessmentCustomAttributeData: {
        '1756991891738_textarea': 'Root cause analysis text',
        '1717671009400_select': 'Low',
        '1717671039637_select': 'Medium',
        '1717671113073_select': 'High',
        '1717671147751_select': 'Low',
        '1717671072969_select': 'Medium',
        '1757601406913_select': 'No',
      },
    },
    RSUrlCustomFieldKey: 'customfield_10045',
    JiraLinkCustomAttribute: '123_link',
    SetRefInJira: true,
  };

  const mockEvent = stub<APIGatewayProxyEventV2>({
    headers: {
      authorization: 'Bearer test-token',
    },
  });

  const mockDate = new Date(Date.UTC(2025, 11, 24, 0, 0, 0));

  beforeEach(() => {
    vi.resetAllMocks();

    let uuidCallCount = 0;
    vi.mocked(randomUUID).mockImplementation(() => {
      uuidCallCount++;
      if (uuidCallCount === 1) {
        return mockUUID as `${string}-${string}-${string}-${string}-${string}`;
      }
      if (uuidCallCount === 2) {
        return mockAssessmentUUID as `${string}-${string}-${string}-${string}-${string}`;
      }

      return `uuid-${uuidCallCount}` as `${string}-${string}-${string}-${string}-${string}`;
    });

    vi.mocked(getHasuraClient).mockReturnValue(hasuraClient);
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

    // Mock Jira API to return user emails
    vi.mocked(mockedJiraApiClient.getUser).mockImplementation(
      async (accountId: string) => {
        if (accountId === ownerAccountId) {
          return {
            self: '',
            accountId: ownerAccountId,
            accountType: 'atlassian',
            active: true,
            displayName: 'Owner User',
            emailAddress: ownerEmail,
          };
        } else if (accountId === contributorAccountId) {
          return {
            self: '',
            accountId: contributorAccountId,
            accountType: 'atlassian',
            active: true,
            displayName: 'Contributor User',
            emailAddress: contributorEmail,
          };
        }

        return null;
      }
    );

    // Setup insertIssueWithoutParent mock response
    vi.mocked(apiClient.insertIssueWithoutParent).mockResolvedValue({
      insert_issue: {
        affected_rows: 1,
      },
    });

    // Setup insertIssueAssessment mock response
    vi.mocked(apiClient.insertIssueAssessment).mockResolvedValue({
      insert_issue_assessment_one: {
        ParentIssueId: mockUUID,
      },
    });

    // Setup updateIssue mock response
    vi.mocked(apiClient.updateIssue).mockResolvedValue({
      update_issue_by_pk: {
        Id: mockUUID,
      },
    } as never);

    // Setup getDepartmentType mock response
    vi.mocked(mockedDepartmentUtils).mockResolvedValue(departmentTypeId);

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

  it('should throw Unauthorized when authorization header is missing', async () => {
    const eventWithoutAuth = stub<APIGatewayProxyEventV2>({
      headers: {},
    });

    await expect(
      jiraToIssueHandler(
        { body: mockBody, secretName: 'test-secret-name' },
        eventWithoutAuth
      )
    ).rejects.toThrow(
      new Unauthorized('Invalid authorization credentials in request')
    );
  });

  it('should successfully create an issue from Jira issue', async () => {
    const result = await jiraToIssueHandler(
      { body: mockBody, secretName: 'test-secret-name' },
      mockEvent
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

    // Verify department lookup
    expect(mockedDepartmentUtils).toHaveBeenCalledWith(apiClient, 'Finance');

    // Verify issue creation
    expect(apiClient.insertIssueWithoutParent).toHaveBeenCalledWith({
      Id: mockUUID,
      Title: 'Test Issue',
      Details: 'This is a test issue',
      ImpactsCustomer: true,
      IsExternalIssue: false,
      DateOccurred: '2025-12-24T00:00:00.000Z',
      DateIdentified: '2025-12-24T00:00:00.000Z',
      Type: ParentTypeEnum.Issue,
      CustomAttributeData: {
        '123_link': 'https://jira.example.com/browse/TEST-123',
      },
      Meta: {
        JiraIssueKey: 'TEST-123',
      },
      Departments: [{ DepartmentTypeId: departmentTypeId }],
      DepartmentTypeIds: [departmentTypeId],
      owners: [{ UserId: ownerId, ParentId: mockUUID }],
      ownerIds: [ownerId],
      contributors: [{ UserId: contributorId, ParentId: mockUUID }],
      contributorIds: [contributorId],
      Tags: [],
      contributorGroups: [],
      ownerGroups: [],
    });

    // Verify issue assessment creation with custom attribute data
    expect(apiClient.insertIssueAssessment).toHaveBeenCalledWith({
      Id: mockAssessmentUUID,
      ParentIssueId: mockUUID,
      IssueType: undefined,
      Tags: [],
      Departments: [],
      Type: ParentTypeEnum.IssueAssessmentRiskEvent,
      Status: IssueAssessmentStatusEnum.Closed,
      ParentIds: [],
      TagTypeIds: [],
      parents: [],
      CustomAttributeData: {
        '1756991891738_textarea': 'Root cause analysis text',
        '1717671009400_select': 'Low',
        '1717671039637_select': 'Medium',
        '1717671113073_select': 'High',
        '1717671147751_select': 'Low',
        '1717671072969_select': 'Medium',
        '1757601406913_select': 'No',
      },
    });

    // Verify result
    expect(JSON.parse(result.body)).toEqual({
      Id: mockUUID,
    });
    expect(result.statusCode).toBe(200);
  });

  it('should create an issue without a contributor when no contributor is provided', async () => {
    const bodyWithoutContributor = {
      ...mockBody,
      Issue: {
        ...mockBody.Issue,
        ContributorAccountIds: [],
      },
    };

    const result = await jiraToIssueHandler(
      { body: bodyWithoutContributor, secretName: 'test-secret-name' },
      mockEvent
    );

    expect(apiClient.insertIssueWithoutParent).toHaveBeenCalledWith(
      expect.objectContaining({
        contributors: [],
        contributorIds: [],
      })
    );

    expect(result.statusCode).toBe(200);
  });

  it('should create issue assessment without CustomAttributeData when empty object provided', async () => {
    const bodyWithEmptyAssessmentData = {
      ...mockBody,
      Issue: {
        ...mockBody.Issue,
        IssueAssessmentCustomAttributeData: {},
      },
    };

    await jiraToIssueHandler(
      { body: bodyWithEmptyAssessmentData, secretName: 'test-secret-name' },
      mockEvent
    );

    expect(apiClient.insertIssueAssessment).toHaveBeenCalledWith(
      expect.objectContaining({
        Id: mockAssessmentUUID,
        ParentIssueId: mockUUID,
        CustomAttributeData: {},
      })
    );
  });

  it('should create an issue with fallback user ID when owner account does not match a user', async () => {
    vi.mocked(apiClient.getUsers).mockResolvedValueOnce({ user: [] });

    const result = await jiraToIssueHandler(
      {
        body: { ...mockBody, FallbackUserId: 'fallback-user-id' },
        secretName: 'test-secret-name',
      },
      mockEvent
    );

    expect(apiClient.insertIssueWithoutParent).toHaveBeenCalledWith(
      expect.objectContaining({
        owners: [{ UserId: 'fallback-user-id', ParentId: mockUUID }],
        ownerIds: ['fallback-user-id'],
      })
    );

    expect(result.statusCode).toBe(200);
  });

  it('should create an issue with fallback user ID when owner is a former Jira user', async () => {
    vi.mocked(mockedJiraApiClient.getUser).mockResolvedValueOnce({
      self: '',
      accountId: '123',
      accountType: 'atlassian',
      active: false,
      displayName: 'Former user',
    });

    const result = await jiraToIssueHandler(
      {
        body: {
          ...mockBody,
          FallbackUserId: 'fallback-user-id',
        },
        secretName: 'test-secret-name',
      },
      mockEvent
    );

    expect(apiClient.insertIssueWithoutParent).toHaveBeenCalledWith(
      expect.objectContaining({
        owners: [{ UserId: 'fallback-user-id', ParentId: mockUUID }],
        ownerIds: ['fallback-user-id'],
      })
    );

    expect(result.statusCode).toBe(200);
  });

  it('should return 202 when OwnerAccountIds is empty', async () => {
    const bodyWithoutOwner = {
      ...mockBody,
      Issue: {
        ...mockBody.Issue,
        OwnerAccountIds: [],
      },
    };

    const result = await jiraToIssueHandler(
      { body: bodyWithoutOwner, secretName: 'test-secret-name' },
      mockEvent
    );

    // Verify that no issue creation was attempted
    expect(apiClient.insertIssueWithoutParent).not.toHaveBeenCalled();
    expect(apiClient.updateIssue).not.toHaveBeenCalled();

    // Verify the 202 response
    expect(result.statusCode).toBe(202);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Request accepted - insufficient data for issue processing',
      status: 'deferred',
    });
  });

  it('should update Jira issue with RiskSmart URL when SetRefInJira is true', async () => {
    const result = await jiraToIssueHandler(
      { body: mockBody, secretName: 'test-secret-name' },
      mockEvent
    );

    expect(mockedJiraApiClient.updateIssue).toHaveBeenCalledWith('TEST-123', {
      fields: {
        customfield_10045: `https://app.risksmart.link/issues/${mockUUID}`,
      },
    });

    expect(getEnv).toHaveBeenCalledWith('WEB_APP_URL');
    expect(result.statusCode).toBe(200);
  });

  it('should not update Jira issue when SetRefInJira is false', async () => {
    const bodyWithoutSetRef = {
      ...mockBody,
      SetRefInJira: false,
    };

    const result = await jiraToIssueHandler(
      { body: bodyWithoutSetRef, secretName: 'test-secret-name' },
      mockEvent
    );

    expect(mockedJiraApiClient.updateIssue).not.toHaveBeenCalled();
    expect(result.statusCode).toBe(200);
  });

  it('should throw BadRequest when Jira update returns null (404)', async () => {
    mockedJiraApiClient.updateIssue.mockResolvedValueOnce(null);

    await expect(
      jiraToIssueHandler(
        { body: mockBody, secretName: 'test-secret-name' },
        mockEvent
      )
    ).rejects.toThrow(
      new BadRequest(
        'Failed to update Jira issue: ticket not found or permission issue.'
      )
    );

    // Verify that the issue was still created
    expect(apiClient.insertIssueWithoutParent).toHaveBeenCalled();
  });

  it('should extract GUID and update existing issue when RSUrl is provided', async () => {
    const existingIssueId = 'existing-issue-id';
    const bodyWithRSUrl = {
      ...mockBody,
      Issue: {
        ...mockBody.Issue,
        RSUrl: `https://app.risksmart.link/issues/${existingIssueId}`,
      },
    };

    // Setup mock to return a valid existing issue node
    const existingIssueNode = {
      Id: existingIssueId,
      ObjectType: ParentTypeEnum.IssueRiskEvent,
      ancestorContributors: [],
    };

    vi.mocked(getNode).mockResolvedValue(existingIssueNode);

    // Mock getIssueDetailsById to return the existing issue
    vi.mocked(apiClient.getIssueDetailsById).mockResolvedValue({
      issue_by_pk: {
        Id: existingIssueId,
        Title: 'Existing Issue',
        ModifiedAtTimestamp: '2025-12-23T00:00:00.000Z',
        tags: [{ TagTypeId: 'tag-1' }],
        contributorGroups: [{ UserGroupId: 'group-1' }],
        ownerGroups: [{ UserGroupId: 'group-2' }],
      },
    } as never);

    const result = await jiraToIssueHandler(
      { body: bodyWithRSUrl, secretName: 'test-secret-name' },
      mockEvent
    );

    // Verify updateIssue was called instead of insertIssueWithoutParent
    expect(apiClient.updateIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        Id: existingIssueId,
        Title: 'Test Issue',
        Details: 'This is a test issue',
        OriginalTimestamp: '2025-12-23T00:00:00.000Z',
      })
    );

    // Verify insertIssueWithoutParent was NOT called
    expect(apiClient.insertIssueWithoutParent).not.toHaveBeenCalled();

    // Verify the result
    expect(JSON.parse(result.body)).toEqual({
      Id: existingIssueId,
    });
    expect(result.statusCode).toBe(200);

    // Verify Jira is not updated during an update operation
    expect(mockedJiraApiClient.updateIssue).not.toHaveBeenCalled();
  });

  it('should throw BadRequest when RSUrl is invalid', async () => {
    const bodyWithInvalidRSUrl = {
      ...mockBody,
      Issue: {
        ...mockBody.Issue,
        RSUrl: 'invalid-issue-id',
      },
    };

    await expect(
      jiraToIssueHandler(
        { body: bodyWithInvalidRSUrl, secretName: 'test-secret-name' },
        mockEvent
      )
    ).rejects.toThrow(new BadRequest('Invalid RS reference'));
  });

  it('should throw BadRequest when existing issue node is not found', async () => {
    const existingIssueId = 'non-existent-issue-id';
    const bodyWithRSUrl = {
      ...mockBody,
      Issue: {
        ...mockBody.Issue,
        RSUrl: `https://app.risksmart.link/issues/${existingIssueId}`,
      },
    };

    vi.mocked(getNode).mockResolvedValue(null);

    await expect(
      jiraToIssueHandler(
        { body: bodyWithRSUrl, secretName: 'test-secret-name' },
        mockEvent
      )
    ).rejects.toThrow(new BadRequest('Invalid RS reference'));
  });

  it('should throw BadRequest when existing node has invalid object type', async () => {
    const existingIssueId = 'existing-id-wrong-type';
    const bodyWithRSUrl = {
      ...mockBody,
      Issue: {
        ...mockBody.Issue,
        RSUrl: `https://app.risksmart.link/issues/${existingIssueId}`,
      },
    };

    vi.mocked(getNode).mockResolvedValue({
      Id: existingIssueId,
      ObjectType: ParentTypeEnum.Document,
      ancestorContributors: [],
    });

    await expect(
      jiraToIssueHandler(
        { body: bodyWithRSUrl, secretName: 'test-secret-name' },
        mockEvent
      )
    ).rejects.toThrow(new BadRequest('Invalid RS reference'));
  });

  it('should handle Issue object type in addition to IssueRiskEvent', async () => {
    const existingIssueId = 'existing-issue-id';
    const bodyWithRSUrl = {
      ...mockBody,
      Issue: {
        ...mockBody.Issue,
        RSUrl: `https://app.risksmart.link/issues/${existingIssueId}`,
      },
    };

    vi.mocked(getNode).mockResolvedValue({
      Id: existingIssueId,
      ObjectType: ParentTypeEnum.Issue,
      ancestorContributors: [],
    });

    vi.mocked(apiClient.getIssueDetailsById).mockResolvedValue({
      issue_by_pk: {
        Id: existingIssueId,
        Title: 'Existing Issue',
        ModifiedAtTimestamp: '2025-12-23T00:00:00.000Z',
        tags: [],
        contributorGroups: [],
        ownerGroups: [],
      },
    } as never);

    const result = await jiraToIssueHandler(
      { body: bodyWithRSUrl, secretName: 'test-secret-name' },
      mockEvent
    );

    expect(apiClient.updateIssue).toHaveBeenCalled();
    expect(result.statusCode).toBe(200);
  });

  it('should handle null department type ID', async () => {
    vi.mocked(mockedDepartmentUtils).mockResolvedValue(null);

    const result = await jiraToIssueHandler(
      { body: mockBody, secretName: 'test-secret-name' },
      mockEvent
    );

    expect(apiClient.insertIssueWithoutParent).toHaveBeenCalledWith(
      expect.objectContaining({
        Departments: [],
        DepartmentTypeIds: [],
      })
    );

    expect(result.statusCode).toBe(200);
  });
});
