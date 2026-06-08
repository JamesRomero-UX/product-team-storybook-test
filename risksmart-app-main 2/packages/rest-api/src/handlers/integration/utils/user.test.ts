import { BadRequest } from 'http-errors';
import type { Sdk } from 'src/repositories/getRisksmartApiClient';
import type JiraApiClient from 'src/services/jira/apiClient';
import { mock } from 'vitest-mock-extended';

import { getRiskSmartUserIdFromJiraUser } from './user';

vi.mock('src/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe('getRiskSmartUserIdFromJiraUser', () => {
  const mockedJiraApiClient = mock<JiraApiClient>({
    updateIssue: vi.fn(),
    getIssue: vi.fn(),
    handleError: vi.fn(),
    getUser: vi.fn(),
  });

  const mockedApiClient = mock<Sdk>({
    getUsers: vi.fn(),
    insertChildRisk: vi.fn(),
    updateRisk: vi.fn(),
    insertRiskAssessmentResults: vi.fn(),
  });

  const mockAccountId = 'jira-account-id';
  const mockEmail = 'user@example.com';
  const mockFallbackUserId = 'fallback-user-id';

  const defaultOptions = {
    apiClient: mockedApiClient,
    jiraApiClient: mockedJiraApiClient,
    accountId: mockAccountId,
    email: mockEmail,
    fallbackUserId: mockFallbackUserId,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Default mocks
    vi.mocked(mockedApiClient.getUsers).mockResolvedValue({
      user: [{ Id: mockEmail }],
    });
  });

  it('should call Jira API for email if not provided', async () => {
    vi.mocked(mockedJiraApiClient.getUser).mockResolvedValue({
      emailAddress: mockEmail,
    } as never);

    await getRiskSmartUserIdFromJiraUser({
      ...defaultOptions,
      email: undefined,
    });

    expect(mockedJiraApiClient.getUser).toHaveBeenCalledWith(mockAccountId);
    expect(mockedApiClient.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { Email: { _ilike: mockEmail } },
      })
    );
  });

  it('should not call Jira API for email if already provided', async () => {
    await getRiskSmartUserIdFromJiraUser({
      ...defaultOptions,
    });

    expect(mockedJiraApiClient.getUser).not.toHaveBeenCalled();
  });

  it('should throw error if Jira API fails to find user and no fallback user ID is provided', async () => {
    vi.mocked(mockedJiraApiClient.getUser).mockResolvedValue(
      undefined as never
    );

    await expect(
      getRiskSmartUserIdFromJiraUser({
        ...defaultOptions,
        email: undefined,
        fallbackUserId: undefined,
      })
    ).rejects.toThrow(
      new BadRequest(
        'Failed to match Jira user to RiskSmart user and no fallback user ID provided'
      )
    );
  });

  it('should return user ID when email is provided and user is found', async () => {
    const mockUserId = 'found-user-id';
    vi.mocked(mockedApiClient.getUsers).mockResolvedValue({
      user: [{ Id: mockUserId }],
    });

    const result = await getRiskSmartUserIdFromJiraUser({
      ...defaultOptions,
    });

    expect(result).toBe(mockUserId);
    expect(mockedApiClient.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { Email: { _ilike: mockEmail } },
      })
    );
  });

  it('should return fallback user ID when multiple users found with same email', async () => {
    vi.mocked(mockedApiClient.getUsers).mockResolvedValue({
      user: [{ Id: 'user1' }, { Id: 'user2' }],
    });

    const result = await getRiskSmartUserIdFromJiraUser({
      ...defaultOptions,
    });

    expect(result).toBe(mockFallbackUserId);
  });

  it('should return fallback user ID when no users found with email', async () => {
    vi.mocked(mockedApiClient.getUsers).mockResolvedValue({
      user: [],
    });

    const result = await getRiskSmartUserIdFromJiraUser({
      ...defaultOptions,
    });

    expect(result).toBe(mockFallbackUserId);
  });

  it('should throw error when no users found with email and no fallback user ID', async () => {
    vi.mocked(mockedApiClient.getUsers).mockResolvedValue({
      user: [],
    });

    await expect(
      getRiskSmartUserIdFromJiraUser({
        ...defaultOptions,
        fallbackUserId: undefined,
      })
    ).rejects.toThrow(
      new BadRequest(
        'Failed to match Jira user to RiskSmart user and no fallback user ID provided'
      )
    );
  });

  it('should return fallback user ID when user found but without ID', async () => {
    vi.mocked(mockedApiClient.getUsers).mockResolvedValue({
      user: [{ Id: null }],
    });

    const result = await getRiskSmartUserIdFromJiraUser({
      ...defaultOptions,
    });

    expect(result).toBe(mockFallbackUserId);
  });

  it('should return fallback user ID when Jira API fails to find user but fallback is provided', async () => {
    vi.mocked(mockedJiraApiClient.getUser).mockResolvedValue(
      undefined as never
    );

    const result = await getRiskSmartUserIdFromJiraUser({
      ...defaultOptions,
      email: undefined,
    });

    expect(result).toBe(mockFallbackUserId);
  });

  it('should handle null email by attempting Jira API call', async () => {
    vi.mocked(mockedJiraApiClient.getUser).mockResolvedValue({
      emailAddress: mockEmail,
    } as never);

    await getRiskSmartUserIdFromJiraUser({
      ...defaultOptions,
      email: null,
    });

    expect(mockedJiraApiClient.getUser).toHaveBeenCalledWith(mockAccountId);
    expect(mockedApiClient.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { Email: { _ilike: mockEmail } },
      })
    );
  });

  it('should return fallback user ID when Jira user has no email and fallback is provided', async () => {
    vi.mocked(mockedJiraApiClient.getUser).mockResolvedValue({
      emailAddress: undefined,
    } as never);

    const result = await getRiskSmartUserIdFromJiraUser({
      ...defaultOptions,
      email: undefined,
    });

    expect(result).toBe(mockFallbackUserId);
  });

  it('should throw error when Jira user has no email and no fallback is provided', async () => {
    vi.mocked(mockedJiraApiClient.getUser).mockResolvedValue({
      emailAddress: undefined,
    } as never);

    await expect(
      getRiskSmartUserIdFromJiraUser({
        ...defaultOptions,
        email: undefined,
        fallbackUserId: undefined,
      })
    ).rejects.toThrow(
      new BadRequest(
        'Failed to match Jira user to RiskSmart user and no fallback user ID provided'
      )
    );
  });
});
