import { print } from 'graphql';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import type { UpdateIssueAssessmentMutationVariables } from '../../generated/graphql';
import {
  IssueAssessmentStatusEnum,
  UpdateIssueAssessmentDocument,
} from '../../generated/graphql';
import { getHasuraBaseUrl, makeHttpRequest } from '../Shared/utils';

export class UpdateIssueAssessment implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Update Issue Assessment',
    name: 'updateIssueAssessment',
    group: ['transform'],
    icon: 'file:icon.png',
    version: 1,
    description: 'Update an issue assessment from the RiskSmart platform.',
    defaults: {
      name: 'Update Issue Assessment',
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
        displayName: 'Issue Assessment ID (UUID)',
        name: 'issueAssessmentId',
        type: 'string',
        default: '',
        placeholder: 'Example: 146eea61-5ddf-4ac6-b6f7-8981afa168a8',
        description: 'The unique identifier of the issue assessment.',
        required: true,
      },
      // Add the rest of the properties here from InsertIssueAssessmentVariables
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: '',
        description: 'The status of the issue assessment.',
        required: true,
        options: [
          {
            name: 'Awaiting Closure',
            value: IssueAssessmentStatusEnum.Awaitingclosure,
          },
          {
            name: 'Closed',
            value: IssueAssessmentStatusEnum.Closed,
          },
          {
            name: 'Declined',
            value: IssueAssessmentStatusEnum.Declined,
          },
          {
            name: '1st Line Approval',
            value: IssueAssessmentStatusEnum.Firstlineapproval,
          },
          {
            name: 'Open',
            value: IssueAssessmentStatusEnum.Open,
          },
          {
            name: 'Pending',
            value: IssueAssessmentStatusEnum.Pending,
          },
        ],
      },
      {
        displayName: 'Timestamp',
        name: 'timestamp',
        type: 'string',
        default: '',
        description: 'The timestamp of the issue assessment.',
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
        const issueId = this.getNodeParameter('issueAssessmentId', i) as string;

        const variables: UpdateIssueAssessmentMutationVariables = {
          Id: issueId,
          OriginalTimestamp: this.getNodeParameter('timestamp', i) as string,
          Status: this.getNodeParameter(
            'status',
            i
          ) as IssueAssessmentStatusEnum,
          // Add the rest of the properties here from InsertIssueAssessmentVariables when needed in future integrations
          // This is needed as the InsertIssueAssessmentVariables are tied to the hasura action lambda
          TagTypeIds: [],
          DepartmentTypeIds: [],
          RegulationsBreachedIds: [],
          AssociatedControlIds: [],
          PoliciesBreachedIds: [],
        };

        const body = {
          query: print(UpdateIssueAssessmentDocument),
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
