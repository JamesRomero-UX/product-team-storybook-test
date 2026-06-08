import { print } from 'graphql';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import type { GetUserSearchQueryVariables } from '../../generated/graphql';
import { GetUserSearchDocument } from '../../generated/graphql';
import { getHasuraBaseUrl, makeHttpRequest } from '../Shared/utils';

export class GetUser implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Get User',
    name: 'GetUser',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Get an user by Id or Email from the RiskSmart platform.',
    defaults: {
      name: 'Get User',
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
        displayName: 'Lookup type',
        name: 'lookupType',
        type: 'options',
        options: [
          {
            name: 'By Email',
            value: 'emailType',
          },
          {
            name: 'By Id',
            value: 'idType',
          },
        ],
        default: 'idType', // The initially selected option
        description: 'Look to make',
      },
      {
        displayName: 'User ID (UUID)',
        name: 'userId',
        type: 'string',
        default: '',
        placeholder: 'Example: 146eea61-5ddf-4ac6-b6f7-8981afa168a8',
        description: 'The unique identifier of the user.',
        required: false,
        displayOptions: {
          show: {
            lookupType: ['idType'],
          },
        },
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        placeholder: 'Example: user@user.com',
        description: 'The email of the user..',
        required: false,
        displayOptions: {
          show: {
            lookupType: ['emailType'],
          },
        },
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
        const lookupType = this.getNodeParameter('lookupType', i) as string;
        let lookupKey;

        switch (lookupType) {
          case 'idType':
            lookupKey = this.getNodeParameter('userId', i) as string;

            break;
          case 'emailType':
            lookupKey = this.getNodeParameter('email', i) as string;

            break;
          default:
            throw new Error('Invalid lookup type');
        }

        const variables: GetUserSearchQueryVariables = {
          email: lookupKey,
          id: lookupKey,
        };

        const body = {
          query: print(GetUserSearchDocument),
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
