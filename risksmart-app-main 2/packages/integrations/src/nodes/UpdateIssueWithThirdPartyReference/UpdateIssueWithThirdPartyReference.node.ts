import { print } from 'graphql';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import type { UpdateIssueWithReferenceMutationVariables } from '../../generated/graphql';
import { UpdateIssueWithReferenceDocument } from '../../generated/graphql';
import { getHasuraBaseUrl, makeHttpRequest } from '../Shared/utils';

export class UpdateIssueWithThirdPartyReference implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Update Issue With Third Party Reference',
    name: 'updateIssueWithThirdPartyReference',
    group: ['transform'],
    icon: 'file:icon.png',
    version: 1,
    description: 'Update an issue with a third party reference.',
    defaults: {
      name: 'RiskSmart Update Issue With Third Party Reference',
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
        displayName: 'Issue ID (UUID)',
        name: 'issueId',
        type: 'string',
        default: '',
        placeholder: 'Example: 146eea61-5ddf-4ac6-b6f7-8981afa168a8',
        description: 'The unique identifier of the issue.',
        required: true,
      },
      {
        displayName: 'Source',
        name: 'source',
        type: 'string',
        default: 'jira',
        description: 'Third party source e.g. Jira, ServiceNow',
        required: true,
      },
      {
        displayName: 'Reference ID',
        name: 'referenceId',
        type: 'string',
        default: '',
        description: 'Third party ID',
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];
    const length = items.length as unknown as number;
    let responseData;

    const baseURL = getHasuraBaseUrl();

    for (let i = 0; i < length; i++) {
      try {
        const issueId = this.getNodeParameter('issueId', i) as string;
        const source = this.getNodeParameter('source', i) as string;
        const referenceId = this.getNodeParameter('referenceId', i) as string;

        const variables: UpdateIssueWithReferenceMutationVariables = {
          Id: issueId,
          Meta: {
            [source]: referenceId,
          },
        };

        const body = {
          query: print(UpdateIssueWithReferenceDocument),
          variables,
        };

        responseData = await makeHttpRequest(this, body, baseURL);

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
