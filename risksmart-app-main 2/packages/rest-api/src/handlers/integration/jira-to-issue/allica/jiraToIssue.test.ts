import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { IssueAssessmentStatusEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest } from 'http-errors';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import {
  getHasuraClaims,
  getTenantNameFromClaims,
  getUserIdFromClaims,
} from 'src/requestHelpers';
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getConfig } from '../../utils/config';
import { getDepartmentType } from '../../utils/department';
import { getRiskSmartUserIdFromJiraUser } from '../../utils/user';
import { jiraToIssueHandler } from '../jiraToIssue';
import { handler } from './jiraToIssue';

vi.mock('@sentry/aws-serverless', () => ({
  wrapHandler: vi.fn((handler) => handler),
  init: vi.fn(),
}));

vi.mock('sst/node/api', () => ({
  ApiHandler: vi.fn((handler) => handler),
}));

vi.mock('src/errorHandler', () => ({
  errorHandler: vi.fn((handler) => handler),
}));

vi.mock('src/sentryInit', () => ({
  initSentry: vi.fn(),
}));

vi.mock('../jiraToIssue', () => ({
  jiraToIssueHandler: vi.fn(),
}));

vi.mock('src/repositories/getBackendRestApiClient', () => ({
  getBackendRestApiClient: vi.fn(),
}));

vi.mock('src/requestHelpers', () => ({
  getHasuraClaims: vi.fn(),
  getUserIdFromClaims: vi.fn(),
  getTenantNameFromClaims: vi.fn(),
}));

vi.mock('../../utils/department', () => ({
  getDepartmentType: vi.fn(),
}));

vi.mock('../../utils/config', () => ({
  getConfig: vi.fn(),
}));

vi.mock('../../utils/user', () => ({
  getRiskSmartUserIdFromJiraUser: vi.fn(),
}));

vi.mock('src/services/jira/apiClient', () => ({
  default: vi.fn(),
}));

describe('allica jiraToIssue handler', () => {
  const validInput = {
    jiraLinkCustomAttribute: '123_link',
    setRefInJira: true,
    fallbackUserId: 'fallback-user-id',
    jiraIssueBody: {
      key: 'TEST-123',
      fields: {
        created: 1735430400000, // 2024-12-29T00:00:00.000Z
        reporter: {
          accountId: 'reporter-account-id',
        },
        assignee: {
          accountId: 'assignee-account-id',
          displayName: 'Assignee User',
        },
        summary: 'Test Issue Summary',
        description: 'Risk event description',
        customfield_12181: { value: 'Product A' },
        customfield_10884: 'INC-001',
        customfield_12656: [{ value: 'Business Unit 1' }],
        customfield_12578: '2025-12-24T00:00:00.000Z', // Date occurred - incidents
        customfield_12579: '2025-12-25T00:00:00.000Z', // Date identified
        customfield_16130: [
          {
            accountId: 'owner-account-id',
          },
        ],
        customfield_10050: [{ accountId: 'participant-account-id' }], // Request participants
        // Required fields when incident management ref is set
        customfield_11191: {
          value: 'Risk Category L1',
          child: { value: 'Risk Category L2' },
        },
        customfield_12658: { value: 'Basel Category' },
        customfield_12584: 'Root cause and resolution text',
        customfield_12586: { value: 'Low' },
        customfield_12587: { value: 'Medium' },
        customfield_12588: { value: 'High' },
        customfield_12589: { value: 'Low' },
        customfield_12590: { value: 'Medium' },
        customfield_12244: {
          value: 'Primary Root Cause L1',
          child: { value: 'Primary Root Cause L2' },
        }, // Incident Failure Categorisation (required)
      },
    },
  };

  const mockEvent = stub<APIGatewayProxyEventV2>({
    body: JSON.stringify(validInput),
    headers: {
      authorization: 'Bearer test-token',
    },
  });

  const mockHandlerResponse = {
    statusCode: 200,
    body: JSON.stringify({ Id: 'created-issue-id' }),
  };

  const mockContext = {} as Context;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(jiraToIssueHandler).mockResolvedValue(mockHandlerResponse);
    // Default mock for API client
    vi.mocked(getBackendRestApiClient).mockReturnValue({} as never);
    // Default mocks for request helpers
    vi.mocked(getHasuraClaims).mockReturnValue({
      'x-hasura-org-id': 'test-org-id',
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': 'test-user-id',
      'x-hasura-tenant-name': 'test-tenant',
    });
    vi.mocked(getUserIdFromClaims).mockReturnValue('test-user-id');
    vi.mocked(getTenantNameFromClaims).mockReturnValue('test-tenant');
    // Default mock for department type mapping
    vi.mocked(getDepartmentType).mockImplementation(async (_, name) => {
      return `dept-id-${name.toLowerCase().replace(/\s+/g, '-')}`;
    });
    // Default mock for getConfig
    vi.mocked(getConfig).mockResolvedValue({
      JiraBaseUrl: 'https://jira.example.com',
      JiraApiToken: 'test-token',
    });
    // Default mock for getRiskSmartUserIdFromJiraUser
    vi.mocked(getRiskSmartUserIdFromJiraUser).mockImplementation(
      async ({ accountId, fallbackUserId }) => {
        if (accountId === 'reporter-account-id') {
          return 'risksmart-reporter-id';
        }
        if (accountId === 'owner-account-id') {
          return 'risksmart-owner-id';
        }

        return fallbackUserId ?? 'unknown-user-id';
      }
    );
  });

  it('should call jiraToIssueHandler with transformed body and correct secret name', async () => {
    const result = await handler(mockEvent, mockContext);

    expect(jiraToIssueHandler).toHaveBeenCalledWith(
      {
        body: {
          Issue: {
            Key: 'TEST-123',
            Title: 'Test Issue Summary',
            Description: '', // Uses customfield_12577 for incidents which is not set
            ImpactsCustomer: false,
            IsExternalIssue: false,
            AssessmentStatus: IssueAssessmentStatusEnum.Closed,
            DateOccurred: '2025-12-24T00:00:00.000Z',
            DateIdentified: '2025-12-25T00:00:00.000Z',
            OwnerAccountIds: ['owner-account-id'],
            ContributorAccountIds: ['participant-account-id'],
            RSUrl: undefined,
            CustomAttributeData: {
              '1717577326708_select': 'Product A',
              '1719574400477_text': 'INC-001',
              '1717577717300_select': 'Basel Category',
              '1717670549930_select': 'Risk Category L1',
              '1717670568472_select': 'Risk Category L1 - Risk Category L2',
              '1769169141402_departmentmultiselect': [
                'dept-id-business-unit-1',
              ],
              '1717577438882_select': undefined, // Risk business partner not set for incidents
              '1770031402555_usermultiselect': ['risksmart-reporter-id'],
            },
            IssueAssessmentCustomAttributeData: {
              '1756991891738_textarea': 'Root cause and resolution text',
              '1717671009400_select': 'Low',
              '1717671039637_select': 'Medium',
              '1717671113073_select': 'Low',
              '1717671147751_select': 'Medium',
              '1717671072969_select': 'High',
              '1757601406913_select': 'No',
              '1756997076801_select': 'Primary Root Cause L1',
              '1756997372431_select':
                'Primary Root Cause L1-Primary Root Cause L2',
            },
          },
          IssueTypeOverride: ParentTypeEnum.IssueRiskEvent,
          IssueAssessmentTypeOverride: 'material-impact',
          FallbackUserId: 'fallback-user-id',
        },
        secretName: 'allica-jira-config',
      },
      mockEvent
    );

    expect(result).toEqual(mockHandlerResponse);
  });

  it('should use allica-jira-config as secret name', async () => {
    await handler(mockEvent, mockContext);

    expect(jiraToIssueHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        secretName: 'allica-jira-config',
      }),
      expect.anything()
    );
  });

  it('should throw BadRequest when schema validation fails', async () => {
    const invalidEvent = stub<APIGatewayProxyEventV2>({
      body: JSON.stringify({
        jiraIssueBody: {
          key: '', // Invalid: empty key
          fields: {},
        },
      }),
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await expect(handler(invalidEvent, mockContext)).rejects.toThrow(
      BadRequest
    );
    expect(jiraToIssueHandler).not.toHaveBeenCalled();
  });

  it('should throw BadRequest when body is empty', async () => {
    const emptyBodyEvent = stub<APIGatewayProxyEventV2>({
      body: '{}',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await expect(handler(emptyBodyEvent, mockContext)).rejects.toThrow(
      BadRequest
    );
    expect(jiraToIssueHandler).not.toHaveBeenCalled();
  });

  it('should throw BadRequest when required fields are missing', async () => {
    const missingFieldsEvent = stub<APIGatewayProxyEventV2>({
      body: JSON.stringify({
        jiraIssueBody: {
          key: 'TEST-123',
          fields: {
            summary: 'Test',
            // Missing required fields
          },
        },
      }),
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await expect(handler(missingFieldsEvent, mockContext)).rejects.toThrow(
      BadRequest
    );
    expect(jiraToIssueHandler).not.toHaveBeenCalled();
  });

  it('should handle when setRefInJira is not provided', async () => {
    const inputWithoutSetRefInJira = {
      ...validInput,
      setRefInJira: undefined,
    };

    const eventWithoutSetRefInJira = stub<APIGatewayProxyEventV2>({
      body: JSON.stringify(inputWithoutSetRefInJira),
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await handler(eventWithoutSetRefInJira, mockContext);

    expect(jiraToIssueHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        secretName: 'allica-jira-config',
      }),
      expect.anything()
    );
  });

  it('should pass through optional fallbackUserId', async () => {
    const inputWithFallback = {
      ...validInput,
      fallbackUserId: 'custom-fallback-user',
    };

    const eventWithFallback = stub<APIGatewayProxyEventV2>({
      body: JSON.stringify(inputWithFallback),
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await handler(eventWithFallback, mockContext);

    expect(jiraToIssueHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          FallbackUserId: 'custom-fallback-user',
        }),
      }),
      expect.anything()
    );
  });

  it('should return the response from jiraToIssueHandler', async () => {
    const customResponse = {
      statusCode: 202,
      body: JSON.stringify({ message: 'Deferred', status: 'deferred' }),
    };
    vi.mocked(jiraToIssueHandler).mockResolvedValue(customResponse);

    const result = await handler(mockEvent, mockContext);

    expect(result).toEqual(customResponse);
  });

  it('should propagate errors from jiraToIssueHandler', async () => {
    const error = new Error('Handler error');
    vi.mocked(jiraToIssueHandler).mockRejectedValue(error);

    await expect(handler(mockEvent, mockContext)).rejects.toThrow(
      'Handler error'
    );
  });

  it('should handle null body gracefully', async () => {
    const nullBodyEvent = stub<APIGatewayProxyEventV2>({
      body: '',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await expect(handler(nullBodyEvent, mockContext)).rejects.toThrow(
      BadRequest
    );
    expect(jiraToIssueHandler).not.toHaveBeenCalled();
  });

  it('should handle empty string body gracefully', async () => {
    const emptyStringBodyEvent = stub<APIGatewayProxyEventV2>({
      body: '',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await expect(handler(emptyStringBodyEvent, mockContext)).rejects.toThrow(
      BadRequest
    );
    expect(jiraToIssueHandler).not.toHaveBeenCalled();
  });

  describe('department name to ID mapping', () => {
    it('should map department names to IDs when customfield_12656 is provided', async () => {
      vi.mocked(getDepartmentType).mockResolvedValue('dept-id-1');

      await handler(mockEvent, mockContext);

      expect(getDepartmentType).toHaveBeenCalledWith(
        expect.anything(),
        'Business Unit 1',
        false
      );
      expect(jiraToIssueHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            Issue: expect.objectContaining({
              CustomAttributeData: expect.objectContaining({
                '1769169141402_departmentmultiselect': ['dept-id-1'],
              }),
            }),
          }),
        }),
        expect.anything()
      );
    });

    it('should map multiple department names to IDs', async () => {
      const inputWithMultipleDepartments = {
        ...validInput,
        jiraIssueBody: {
          ...validInput.jiraIssueBody,
          fields: {
            ...validInput.jiraIssueBody.fields,
            customfield_12656: [
              { value: 'Finance' },
              { value: 'IT' },
              { value: 'Operations' },
            ],
          },
        },
      };

      const eventWithMultipleDepartments = stub<APIGatewayProxyEventV2>({
        body: JSON.stringify(inputWithMultipleDepartments),
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      vi.mocked(getDepartmentType).mockImplementation(async (_, name) => {
        const deptMap: Record<string, string> = {
          Finance: 'dept-finance',
          IT: 'dept-it',
          Operations: 'dept-operations',
        };

        return deptMap[name] ?? `dept-${name}`;
      });

      await handler(eventWithMultipleDepartments, mockContext);

      expect(getDepartmentType).toHaveBeenCalledTimes(3);
      expect(getDepartmentType).toHaveBeenCalledWith(
        expect.anything(),
        'Finance',
        false
      );
      expect(getDepartmentType).toHaveBeenCalledWith(
        expect.anything(),
        'IT',
        false
      );
      expect(getDepartmentType).toHaveBeenCalledWith(
        expect.anything(),
        'Operations',
        false
      );
      expect(jiraToIssueHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            Issue: expect.objectContaining({
              CustomAttributeData: expect.objectContaining({
                '1769169141402_departmentmultiselect': [
                  'dept-finance',
                  'dept-it',
                  'dept-operations',
                ],
              }),
            }),
          }),
        }),
        expect.anything()
      );
    });

    it('should not call getOrAddDepartmentType when customfield_12656 is null', async () => {
      const inputWithoutDepartments = {
        ...validInput,
        jiraIssueBody: {
          ...validInput.jiraIssueBody,
          fields: {
            ...validInput.jiraIssueBody.fields,
            customfield_10884: null, // Not an incident (so departments not required)
            customfield_12656: null,
            customfield_10632: '2025-12-24T00:00:00.000Z', // Date occurred for risk events
            assignee: {
              accountId: 'assignee-account-id',
              displayName: 'Assignee User',
            },
          },
        },
      };

      const eventWithoutDepartments = stub<APIGatewayProxyEventV2>({
        body: JSON.stringify(inputWithoutDepartments),
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      await handler(eventWithoutDepartments, mockContext);

      expect(getDepartmentType).not.toHaveBeenCalled();
    });

    it('should filter out null results when departments are not found', async () => {
      const inputWithMultipleDepartments = {
        ...validInput,
        jiraIssueBody: {
          ...validInput.jiraIssueBody,
          fields: {
            ...validInput.jiraIssueBody.fields,
            customfield_12656: [
              { value: 'Finance' },
              { value: 'Unknown Dept' },
              { value: 'Operations' },
            ],
          },
        },
      };

      const eventWithMultipleDepartments = stub<APIGatewayProxyEventV2>({
        body: JSON.stringify(inputWithMultipleDepartments),
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      vi.mocked(getDepartmentType).mockImplementation(async (_, name) => {
        if (name === 'Unknown Dept') {
          return null;
        }

        return `dept-${name.toLowerCase()}`;
      });

      await handler(eventWithMultipleDepartments, mockContext);

      expect(jiraToIssueHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            Issue: expect.objectContaining({
              CustomAttributeData: expect.objectContaining({
                '1769169141402_departmentmultiselect': [
                  'dept-finance',
                  'dept-operations',
                ],
              }),
            }),
          }),
        }),
        expect.anything()
      );
    });

    it('should propagate errors from getDepartmentType', async () => {
      vi.mocked(getDepartmentType).mockRejectedValue(
        new Error('Failed to retrieve department')
      );

      await expect(handler(mockEvent, mockContext)).rejects.toThrow(
        'Failed to retrieve department'
      );
    });
  });
});
