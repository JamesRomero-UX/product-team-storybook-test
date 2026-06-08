import { print } from 'graphql';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import type { GetIssueByIdQueryVariables } from '../../generated/graphql';
import { GetIssueByIdDocument } from '../../generated/graphql';
import { getHasuraBaseUrl, makeHttpRequest } from '../Shared/utils';

export class GetIssue implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Get Issue',
    name: 'getIssue',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Get an issue by Id from the RiskSmart platform.',
    defaults: {
      name: 'Get Issue',
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

        const variables: GetIssueByIdQueryVariables = {
          _eq: issueId,
        };

        const body = {
          query: print(GetIssueByIdDocument),
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
