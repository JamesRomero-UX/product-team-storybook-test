import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { getIntegrationApiBaseUrl, makeHttpGetRequest } from '../Shared/utils';

export class GetAsosData implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart ASOS Query Data Integration',
    name: 'GetAsosData',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Trigger the ASOS query data integration lambda function.',
    defaults: {
      name: 'Get ASOS Query Data Integration',
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

    try {
      const url = getIntegrationApiBaseUrl('asos-data');

      this.logger.info('Making request to integration API', {
        url,
      });

      const responseData = await makeHttpGetRequest(this, url);

      if (Array.isArray(responseData)) {
        returnData.push(...(responseData as IDataObject[]));
      } else {
        returnData.push(responseData as IDataObject);
      }
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ error: error.message });
      } else {
        throw error;
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
