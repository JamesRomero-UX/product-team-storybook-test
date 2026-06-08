import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { getIntegrationApiBaseUrl, makeHttpRequest } from '../Shared/utils';

export class JiraIntegrationV2 implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Jira Integration (V2)',
    name: 'JiraIntegrationV2',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Trigger the Jira integration lambda function.',
    defaults: {
      name: 'Jira Integration (V2)',
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'riskSmartAuthApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Integration path',
        name: 'integrationPath',
        type: 'string',
        default: 'Example: skyscanner-jira-to-risk',
        description: 'The path to be appended to the integration API base URL',
        required: true,
      },
      {
        displayName: 'Jira issue body',
        name: 'jiraIssueBody',
        type: 'json',
        default: '',
        description:
          'The JSON of the Jira issue to create or update - usually the body of a Jira webhook call',
        required: true,
      },
      {
        displayName: 'RiskSmart Parent risk ID',
        name: 'parentRiskId',
        type: 'string',
        default: '',
        description:
          "The ID of the tier 2 parent risk  in the customer's platform to add created risks underneath",
        required: true,
      },
      {
        displayName: 'RiskSmart risks form custom attribute for Jira link',
        name: 'jiraLinkCustomAttribute',
        type: 'string',
        default: '',
        description:
          'The key of the RiskSmart risk form custom attribute to populate with a link to the Jira issue',
      },
      {
        displayName: 'RiskSmart risks form custom attribute for risk summary',
        name: 'riskSummaryCustomAttribute',
        type: 'string',
        default: '',
        description:
          'The key of the RiskSmart risk form custom attribute to populate with the risk summary',
      },
      {
        displayName: 'Fallback user ID',
        name: 'fallbackUserId',
        type: 'string',
        default: '',
        description:
          'The RiskSmart user ID to use as a fallback if the Jira user cannot be matched to a RiskSmart user. This is useful if the Jira user has left the company and no longer exists in RiskSmart. If this is not provided, the integration will fail if the user cannot be found.',
      },
      {
        displayName: 'Update RS reference in Jira',
        name: 'setRefInJira',
        type: 'boolean',
        default: true,
        description: 'Whether to update the RS reference in Jira',
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];
    const length = items.length as unknown as number;
    let responseData;

    for (let i = 0; i < length; i++) {
      try {
        const integrationPath = this.getNodeParameter(
          'integrationPath',
          i
        ) as string;
        const jiraIssueBody = this.getNodeParameter(
          'jiraIssueBody',
          i
        ) as string;
        const parentRiskId = this.getNodeParameter('parentRiskId', i) as string;
        const jiraLinkCustomAttribute = this.getNodeParameter(
          'jiraLinkCustomAttribute',
          i
        ) as string | undefined;
        const riskSummaryCustomAttribute = this.getNodeParameter(
          'riskSummaryCustomAttribute',
          i
        ) as string | undefined;
        const fallbackUserId = this.getNodeParameter('fallbackUserId', i) as
          | string
          | undefined;
        const setRefInJira = this.getNodeParameter(
          'setRefInJira',
          i,
          true
        ) as boolean;

        const body = {
          jiraIssueBody,
          parentRiskId,
          jiraLinkCustomAttribute,
          riskSummaryCustomAttribute,
          fallbackUserId,
          setRefInJira,
        };

        const url = getIntegrationApiBaseUrl(integrationPath);

        this.logger.info('Making request to integration API', {
          url,
        });

        responseData = await makeHttpRequest(this, body, url);

        if (Array.isArray(responseData)) {
          returnData.push(...(responseData as IDataObject[]));
        } else {
          returnData.push(responseData as IDataObject);
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ error: error.message });
          continue;
        }
        throw error;
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
