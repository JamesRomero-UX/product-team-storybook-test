import type { AxiosInstance } from 'axios';
import axios, { HttpStatusCode } from 'axios';
import { InternalServerError } from 'http-errors';
import { getLogger } from 'src/logger';

import type { JiraIssue, JiraIssueUpdate, JiraUser } from './types';

const logger = getLogger();

export class JiraApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiToken: string) {
    this.client = axios.create({
      baseURL: `${baseUrl}/rest/api/3`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: apiToken,
      },
    });
  }

  /**
   * Handles errors from the Jira API calls
   * @param error The error object from the API call
   * @returns null if the error is a 404 Not Found, otherwise throws an InternalServerError
   * @throws InternalServerError for non-404 errors
   * @private
   */
  handleError(error: unknown): null {
    if (axios.isAxiosError(error)) {
      const detail = {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      };
      if (error.response?.status === HttpStatusCode.NotFound) {
        logger.warn('Jira object not found:', detail);

        return null;
      }
      logger.error('Error calling Jira API:', detail);
    } else {
      logger.error('Unexpected error calling Jira API:', {
        error: String(error),
      });
    }

    throw new InternalServerError('Internal server error');
  }

  /**
   * Retrieves a Jira ticket by its ID or key
   * @param issueId The ID or key of the Jira ticket to retrieve
   * {@link https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get (see docs)}
   * @returns The Jira ticket data
   */
  async getIssue(issueId: string): Promise<JiraIssue | null> {
    try {
      const response = await this.client.get(`/issue/${issueId}`);

      return response.data as JiraIssue;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Updates a Jira issue with the specified changes
   * @param issueId The ID or key of the Jira issue to update
   * @param updateData The data to update in the issue
   * {@link https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put (see docs)}
   * @returns void if successful, null if the issue was not found
   */
  async updateIssue(
    issueId: string,
    updateData: JiraIssueUpdate
  ): Promise<void | null> {
    try {
      await this.client.put(`/issue/${issueId}`, updateData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Retrieves a Jira user by their account ID
   * @param accountId The account ID of the user to retrieve
   * {@link https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-users/#api-rest-api-3-user-get (see docs)}
   * @returns The Jira user data
   */
  async getUser(accountId: string): Promise<JiraUser | null> {
    try {
      const response = await this.client.get(`/user`, {
        params: { accountId },
      });

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default JiraApiClient;
