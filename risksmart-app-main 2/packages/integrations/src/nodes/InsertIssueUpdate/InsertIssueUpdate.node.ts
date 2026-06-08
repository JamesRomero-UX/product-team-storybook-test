import { print } from 'graphql';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import type { InsertIssueUpdateMutationVariables } from '../../generated/graphql';
import { InsertIssueUpdateDocument } from '../../generated/graphql';
import { getHasuraBaseUrl, makeHttpRequest } from '../Shared/utils';

export class InsertIssueUpdate implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Insert Issue Update',
    name: 'insertIssueUpdate',
    group: ['transform'],
    icon: 'file:icon.png',
    version: 1,
    description: 'Insert an issue update from the RiskSmart platform.',
    defaults: {
      name: 'Insert Issue Update',
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
        description:
          'The unique identifier of the issue. If UUID is not supplied, a new one will be created.',
        required: true,
      },
      // Add the rest of the properties here from UpdateIssueMutationVariables
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'The title of the issue update.',
        required: false,
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'The description of the issue update.',
        required: false,
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
        const variables: InsertIssueUpdateMutationVariables = {
          ParentIssueId: this.getNodeParameter('issueId', i) as string,
          Title: this.getNodeParameter('title', i) as string,
          Description: this.getNodeParameter('description', i) as string,
          // CustomAttributeData: customAttributeData,
        };

        const body = {
          query: print(InsertIssueUpdateDocument),
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
