import { print } from 'graphql';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import type {
  ContributorInsertInput,
  OwnerInsertInput,
  UpdateIssueMutationVariables,
} from '../../generated/graphql';
import { UpdateIssueDocument } from '../../generated/graphql';
import { getHasuraBaseUrl, makeHttpRequest } from '../Shared/utils';

export class UpdateIssue implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Update Issue',
    name: 'updateIssue',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Update an issue from the RiskSmart platform.',
    defaults: {
      name: 'Update Issue',
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
      // Add the rest of the properties here from UpdateIssueMutationVariables
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'The title of the issue.',
        required: false,
      },
      {
        displayName: 'Details',
        name: 'details',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'The details of the issue.',
        required: true,
      },
      {
        displayName: 'Date Occurred',
        name: 'dateOccurred',
        type: 'string',
        default: '',
        description: 'The date the issue occurred.',
        required: true,
      },
      {
        displayName: 'Date Identified',
        name: 'dateIdentified',
        type: 'string',
        default: '',
        description: 'The date the issue was identified.',
        required: true,
      },
      {
        displayName: 'Original Timestamp',
        name: 'OriginalTimestamp',
        type: 'string',
        default: '',
        description: 'The original timestamp of the issue.',
        required: false,
      },
      {
        displayName: 'Issue Assignee IDs',
        name: 'assignees',
        type: 'string',
        default: '',
        description: 'List of RiskSmart user IDs. Comma separated.',
        required: false,
      },
      {
        displayName: 'Assignee as issue owner',
        name: 'assigneeAsOwner',
        type: 'boolean',
        default: false,
        description: 'Assign the assignee as an issue owner.',
        required: false,
      },
      {
        displayName: 'Assignee field name',
        name: 'assigneeFieldName',
        type: 'string',
        default: '',
        description:
          'Name of the custom field to store the assignees. Must be specified if assigneeAsOwner is false.',
        required: false,
      },
      {
        displayName: 'Issue Reporter IDs',
        name: 'reporters',
        type: 'string',
        default: '',
        description: 'List of RiskSmart user IDs. Comma separated.',
        required: false,
      },
      {
        displayName: 'Reporter field name',
        name: 'reporterFieldName',
        type: 'string',
        default: '',
        description:
          'Name of the custom field to store the reporter. Must be specified if reporterAsContributor is false.',
        required: false,
      },
      {
        displayName: 'Reporter as issue contributor',
        name: 'reporterAsContributor',
        type: 'boolean',
        default: false,
        description: 'Assign the reporter as an issue contributor.',
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
        const issueId = this.getNodeParameter('issueId', i) as string;
        const title = this.getNodeParameter('title', i) as string;
        const details = this.getNodeParameter('details', i) as string;
        const dateOccurred = this.getNodeParameter('dateOccurred', i) as string;
        const dateIdentified = this.getNodeParameter(
          'dateIdentified',
          i
        ) as string;
        const originalTimestamp = this.getNodeParameter(
          'OriginalTimestamp',
          i
        ) as string;
        const assignees = this.getNodeParameter('assignees', i) as string;
        const reporters = this.getNodeParameter('reporters', i) as string;
        let owners: OwnerInsertInput[] = [];
        let contributors: ContributorInsertInput[] = [];
        const customAttributeData: { [key: string]: string } = {};

        if (this.getNodeParameter('assigneeAsOwner', i) as boolean) {
          owners =
            assignees?.split(',').map(
              (o): OwnerInsertInput => ({
                UserId: o,
              })
            ) ?? [];
        } else {
          customAttributeData[
            this.getNodeParameter('assigneeFieldName', i) as string
          ] = assignees;
        }

        if (this.getNodeParameter('reporterAsContributor', i) as boolean) {
          contributors =
            reporters?.split(',').map(
              (o): ContributorInsertInput => ({
                UserId: o,
              })
            ) ?? [];
        } else {
          customAttributeData[
            this.getNodeParameter('reporterFieldName', i) as string
          ] = reporters;
        }

        const variables: UpdateIssueMutationVariables = {
          Id: issueId,
          OriginalTimestamp: originalTimestamp,
          Title: title,
          Details: details,
          DateOccurred: dateOccurred,
          DateIdentified: dateIdentified,
          CustomAttributeData: customAttributeData,
          owners,
          contributors,
        };

        const body = {
          query: print(UpdateIssueDocument),
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
