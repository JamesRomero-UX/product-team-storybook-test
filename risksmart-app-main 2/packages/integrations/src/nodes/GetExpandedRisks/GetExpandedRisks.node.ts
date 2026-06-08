import { print } from 'graphql';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { GetExpandedRisksDocument } from '../../generated/graphql';
import { getHasuraBaseUrl, makePaginatedHttpRequest } from '../Shared/utils';

export class GetExpandedRisks implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Get Risks (Expanded)',
    name: 'getExpandedRisks',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description:
      'Get risks from the RiskSmart platform, including controls, actions and indicators.',
    defaults: {
      name: 'Get Expanded Risks',
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'riskSmartAuthApi',
        required: true,
      },
    ],
    properties: [],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const returnData: IDataObject[] = [];
    const baseURL = getHasuraBaseUrl();

    try {
      const body = {
        query: print(GetExpandedRisksDocument),
      };

      const responseData = await makePaginatedHttpRequest(this, body, baseURL);

      returnData.push(responseData);
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ error: error.message });
      }
      throw error;
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
