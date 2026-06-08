import { print } from 'graphql';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import type { InsertReferenceUserMutationVariables } from '../../generated/graphql';
import { InsertReferenceUserDocument } from '../../generated/graphql';
import { getHasuraBaseUrl, makeHttpRequest } from '../Shared/utils';

/**
 * Inserts a new reference user into the RiskSmart platform.
 *
 * Notes: the outcome of this function is not equivalent to provisioning a user via SCIM. Once a
 * user has been provisioned it will overwrite the existing user in the platform.
 */
export class InsertReferenceUser implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Insert Reference User',
    name: 'insertReferenceUser',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Insert a new reference user into the RiskSmart platform.',
    defaults: {
      name: 'Insert Reference User',
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
        displayName: 'Username',
        name: 'userName',
        type: 'string',
        default: '',
        placeholder: 'Example: john.doe',
        description: 'Username that will be visible to others in the platform',
        required: false,
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        placeholder: 'Example: john.doe@acme.com',
        description: 'Email address of the user',
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
        const userName = this.getNodeParameter('userName', i) as string;
        const email = this.getNodeParameter('email', i) as string;

        const variables: InsertReferenceUserMutationVariables = {
          UserName: userName,
          Email: email,
        };

        const body = {
          query: print(InsertReferenceUserDocument),
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
