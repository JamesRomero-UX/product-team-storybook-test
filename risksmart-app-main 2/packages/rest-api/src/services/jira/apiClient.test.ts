import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { JiraApiClient } from './apiClient';
import type { JiraIssue, JiraIssueUpdate, JiraUser } from './types';

// Mock axios
vi.mock('axios');

describe('JiraApiClient', () => {
  const mockBaseUrl = 'https://jira.example.com';
  const mockApiToken = 'Bearer mock-token';
  let jiraClient: JiraApiClient;

  // Mock for axios.create
  const mockAxiosInstance = {
    get: vi.fn(),
    put: vi.fn(),
  };

  beforeEach(() => {
    // Setup axios mock
    vi.mocked(axios.create).mockReturnValue(
      mockAxiosInstance as unknown as AxiosInstance
    );

    // Create a new client instance for each test
    jiraClient = new JiraApiClient(mockBaseUrl, mockApiToken);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: `${mockBaseUrl}/rest/api/3`,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: mockApiToken,
        },
      });
    });
  });

  describe('getIssue', () => {
    const mockIssueId = 'ISSUE-123';
    const mockIssueData: JiraIssue = {
      id: '123',
      key: 'ISSUE-123',
      self: 'https://jira.example.com/rest/api/3/issue/123',
      fields: {
        summary: 'Test issue',
        issuetype: {
          id: '10001',
          name: 'Bug',
        },
        status: {
          id: '3',
          name: 'In Progress',
        },
      },
    };

    it('should return issue data when API call is successful', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockIssueData });
      const result = await jiraClient.getIssue(mockIssueId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `/issue/${mockIssueId}`
      );
      expect(result).toEqual(mockIssueData);
    });

    it('should throw an internal server error when an error occurs', async () => {
      const error = new Error('Unexpected error');
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(jiraClient.getIssue(mockIssueId)).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should return null when issue is not found (404)', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: 'not found',
          statusText: 'Not Found',
          headers: {},
          config: {},
        },
        name: 'AxiosError',
        message: 'Request failed with status code 404',
        toJSON: () => ({}),
      };
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);
      mockAxiosInstance.get.mockRejectedValueOnce(axiosError);

      const result = await jiraClient.getIssue(mockIssueId);

      expect(result).toBeNull();
    });
  });

  describe('updateIssue', () => {
    const mockIssueId = 'ISSUE-123';
    const mockUpdateData: JiraIssueUpdate = {
      fields: {
        summary: 'Updated summary',
      },
    };

    it('should return undefined data when API call is successful', async () => {
      mockAxiosInstance.put.mockResolvedValueOnce({});
      const result = await jiraClient.updateIssue(mockIssueId, mockUpdateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `/issue/${mockIssueId}`,
        mockUpdateData
      );
      expect(result).toBeUndefined();
    });

    it('should throw an internal server error when an error occurs', async () => {
      const error = new Error('Unexpected error');
      mockAxiosInstance.put.mockRejectedValueOnce(error);

      await expect(
        jiraClient.updateIssue(mockIssueId, mockUpdateData)
      ).rejects.toThrow('Internal server error');
    });

    it('should return null when issue is not found (404)', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: 'not found',
          statusText: 'Not Found',
          headers: {},
          config: {},
        },
        name: 'AxiosError',
        message: 'Request failed with status code 404',
        toJSON: () => ({}),
      };
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);
      mockAxiosInstance.put.mockRejectedValueOnce(axiosError);

      const result = await jiraClient.updateIssue(mockIssueId, mockUpdateData);

      expect(result).toBeNull();
    });
  });

  describe('getUser', () => {
    const mockUserId = 'USER-123';
    const mockUserData: JiraUser = {
      self: 'https://jira.example.com/rest/api/3/user/USER-123',
      accountId: 'USER-123',
      accountType: 'atlassian',
      active: true,
      displayName: 'Test User',
      emailAddress: 'test.user@example.com',
    };

    it('should return user data when API call is successful', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockUserData });
      const result = await jiraClient.getUser(mockUserId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/user`, {
        params: { accountId: mockUserId },
      });
      expect(result).toEqual(mockUserData);
    });

    it('should throw an internal server error when an error occurs', async () => {
      const error = new Error('Unexpected error');
      mockAxiosInstance.get.mockRejectedValueOnce(error);
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(false);

      await expect(jiraClient.getUser(mockUserId)).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should return null when user is not found (404)', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: 'not found',
          statusText: 'Not Found',
          headers: {},
          config: {},
        },
        name: 'AxiosError',
        message: 'Request failed with status code 404',
        toJSON: () => ({}),
      };
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);
      mockAxiosInstance.get.mockRejectedValueOnce(axiosError);

      const result = await jiraClient.getUser(mockUserId);

      expect(result).toBeNull();
    });
  });
});
