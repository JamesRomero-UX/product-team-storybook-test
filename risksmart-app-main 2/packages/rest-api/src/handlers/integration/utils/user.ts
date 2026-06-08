import { BadRequest } from 'http-errors';
import { getLogger } from 'src/logger';
import type { Sdk } from 'src/repositories/getRisksmartApiClient';
import type JiraApiClient from 'src/services/jira/apiClient';

const logger = getLogger();

interface GetRiskSmartUserIdFromJiraUserOptions {
  apiClient: Sdk;
  jiraApiClient: JiraApiClient;
  accountId: string;
  email?: string | null;
  fallbackUserId?: string;
}

/**
 * Retrieves the RiskSmart user ID from a Jira user.
 * @param options Options for retrieving the RiskSmart user ID from a Jira user
 * @param options.apiClient The RiskSmart API client
 * @param options.jiraApiClient The Jira API client
 * @param options.accountId The Jira account ID of the user
 * @param options.email The email address of the Jira user (optional)
 * @param options.fallbackUserId The fallback RiskSmart user ID to use if no match is found
 * @throws BadRequest if no matching RiskSmart user is found and no fallback user ID is provided
 * @throws BadRequest if the email is not found in Jira and no fallback user ID is provided
 * @returns The RiskSmart user ID
 */
export const getRiskSmartUserIdFromJiraUser = async ({
  apiClient,
  jiraApiClient,
  accountId,
  email,
  fallbackUserId,
}: GetRiskSmartUserIdFromJiraUserOptions): Promise<string> => {
  if (!email) {
    logger.info(
      'Email not present in Jira response, attempting to grab from Jira API using accountId',
      { accountId }
    );

    email = (await jiraApiClient.getUser(accountId))?.emailAddress;
  }

  if (email) {
    logger.info('Attempting to match RS user based on Jira email', { email });
    const usersResult = await apiClient.getUsers({
      where: { Email: { _ilike: email } },
    });
    if (usersResult.user.length !== 1 || !usersResult.user[0]?.Id) {
      logger.warn(
        'Unable to match Jira user to RiskSmart user, attempting to fallback to API user',
        { email, fallbackUserId }
      );
      if (fallbackUserId) {
        return fallbackUserId;
      }
      throw new BadRequest(
        'Failed to match Jira user to RiskSmart user and no fallback user ID provided'
      );
    }

    logger.info('Successfully matched user based on Jira email', {
      email,
      userId: usersResult.user[0].Id,
    });

    return usersResult.user[0].Id;
  }

  logger.info(
    'No email found for Jira user, possibly former user, attempting to fallback to API user',
    { accountId }
  );
  if (fallbackUserId) {
    return fallbackUserId;
  }
  throw new BadRequest(
    'Failed to match Jira user to RiskSmart user and no fallback user ID provided'
  );
};
