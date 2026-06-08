import { BadRequest } from 'http-errors';
import frontendApiHandler from 'src/frontendApiHandler';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import {
  getHasuraClaims,
  getTenantNameFromClaims,
  getUserIdFromClaims,
} from 'src/requestHelpers';
import JiraApiClient from 'src/services/jira/apiClient';

import { getConfig } from '../../utils/config';
import { getDepartmentType } from '../../utils/department';
import { getRiskSmartUserIdFromJiraUser } from '../../utils/user';
import { jiraToIssueHandler } from '../jiraToIssue';
import {
  AllicaJiraIssueSchema,
  AllicaJiraIssueSchemaWithTransform,
} from './schema';

export const handler = frontendApiHandler(
  AllicaJiraIssueSchema,
  async (body, evt) => {
    const parseResult = AllicaJiraIssueSchemaWithTransform.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequest(parseResult.error.message);
    }

    const claims = getHasuraClaims(evt);
    const userId = getUserIdFromClaims(evt);
    const tenantName = getTenantNameFromClaims(evt);

    const client = getBackendRestApiClient({
      tenant: tenantName,
      orgKey: claims['x-hasura-org-id'],
      userId,
      userRole: claims['x-hasura-default-role'],
    });

    // Map department multi-select field names to IDs
    if (body.jiraIssueBody.fields.customfield_12656?.length) {
      const departmentTypeIds = await Promise.all(
        body.jiraIssueBody.fields.customfield_12656.map(({ value: name }) =>
          getDepartmentType(client, name, false)
        )
      );

      const foundDepartmentTypeIds = departmentTypeIds.filter(
        (id): id is string => id != null
      );

      parseResult.data.Issue.CustomAttributeData[
        '1769169141402_departmentmultiselect'
      ] = foundDepartmentTypeIds;
    }

    const secretName = 'allica-jira-config';
    const config = await getConfig(secretName);

    const jiraApiClient = new JiraApiClient(
      config.JiraBaseUrl,
      config.JiraApiToken
    );

    // Map reporter field to user in specific Allica custom field
    const reporterUserId = await getRiskSmartUserIdFromJiraUser({
      apiClient: client,
      jiraApiClient,
      accountId: body.jiraIssueBody.fields.reporter?.accountId,
      fallbackUserId: body.fallbackUserId,
    });

    parseResult.data.Issue.CustomAttributeData[
      '1770031402555_usermultiselect'
    ] = [reporterUserId];

    let ownerIds: string[] = [];

    // Only map ownerIds if the incident number is set
    if (body.jiraIssueBody.fields.customfield_10884) {
      ownerIds = await Promise.all(
        parseResult.data.Issue.OwnerAccountIds.map((accountId) =>
          getRiskSmartUserIdFromJiraUser({
            apiClient: client,
            jiraApiClient,
            accountId,
            fallbackUserId: body.fallbackUserId,
          })
        )
      );

      if (
        ownerIds.length === 1 &&
        ownerIds[0] === body.fallbackUserId &&
        body.jiraIssueBody.fields.assignee
      ) {
        // fallback to assignee as owner before final fallback
        parseResult.data.Issue.OwnerAccountIds = [
          body.jiraIssueBody.fields.assignee?.accountId,
        ];
      }
    }

    return jiraToIssueHandler({ body: parseResult.data, secretName }, evt);
  }
);
