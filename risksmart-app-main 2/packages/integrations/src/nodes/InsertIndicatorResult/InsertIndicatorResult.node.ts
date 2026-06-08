import { print } from 'graphql';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import type { InsertIndicatorResultMutationVariables } from '../../generated/graphql';
import { InsertIndicatorResultDocument } from '../../generated/graphql';
import { getHasuraBaseUrl, makeHttpRequest } from '../Shared/utils';

export class InsertIndicatorResult implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Insert Indicator Result',
    name: 'insertIndicatorResult',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Insert indicator result from the RiskSmart platform.',
    defaults: {
      name: 'Insert Indicator Result',
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
        displayName: 'IndicatorId ID (UUID)',
        name: 'indicatorId',
        type: 'string',
        default: '',
        placeholder: 'Example: 146eea61-5ddf-4ac6-b6f7-8981afa168a8',
        description: 'The unique identifier of the indicator.',
        required: true,
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'The description of the indicator result.',
        required: false,
      },
      {
        displayName: 'Result Date',
        name: 'resultDate',
        type: 'string',
        default: '',
        description: 'The date the result.',
        required: true,
      },
      {
        displayName: 'Target Value Number',
        name: 'targetValueNum',
        type: 'number',
        default: null,
        description: 'The value if result is a number.',
        required: false,
      },
      {
        displayName: 'Target Value Text',
        name: 'targetValueTxt',
        type: 'string',
        default: null,
        description: 'The value if result is a string.',
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
        const variables: InsertIndicatorResultMutationVariables = {
          IndicatorId: this.getNodeParameter('indicatorId', i) as string,
          Description: this.getNodeParameter('description', i) as string,
          ResultDate: this.getNodeParameter('resultDate', i) as string,
          TargetValueNum: this.getNodeParameter('targetValueNum', i) as number,
          TargetValueTxt: this.getNodeParameter('targetValueTxt', i) as string,
        };

        const body = {
          query: print(InsertIndicatorResultDocument),
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
