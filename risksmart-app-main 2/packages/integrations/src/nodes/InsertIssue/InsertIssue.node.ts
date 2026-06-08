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
  InsertIssueMutationVariables,
  OwnerInsertInput,
} from '../../generated/graphql';
import { InsertIssueDocument } from '../../generated/graphql';
import { getHasuraBaseUrl, makeHttpRequest } from '../Shared/utils';

export class InsertIssue implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RiskSmart Insert Issue',
    name: 'insertIssue',
    icon: 'file:icon.png',
    group: ['transform'],
    version: 1,
    description: 'Insert an issue from the RiskSmart platform.',
    defaults: {
      name: 'Insert Issue',
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
        required: false,
      },
      {
        displayName: 'Date Occurred',
        name: 'dateOccurred',
        type: 'string',
        default: '',
        description: 'The date the issue occurred.',
        required: false,
      },
      {
        displayName: 'Date Identified',
        name: 'dateIdentified',
        type: 'string',
        default: '',
        description: 'The date the issue was identified.',
        required: false,
      },
      {
        displayName: 'Jira Reference',
        name: 'jiraReference',
        type: 'string',
        default: '',
        description: 'The href back to the jira issue',
        required: true,
      },
      {
        displayName: 'RiskSmart Jira reference custom field name',
        name: 'jiraReferenceCustomFieldName',
        type: 'string',
        default: '',
        description: 'The custom field name.',
        required: true,
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
        const jiraUrl = this.getNodeParameter('jiraReference', i) as string;

        const customAttributeData = {
          [this.getNodeParameter('jiraReferenceCustomFieldName', i) as string]:
            jiraUrl,
        };

        const jiraId = jiraUrl.match(/\w+-\d+$/)?.[0];

        if (!jiraId) {
          throw new Error('Invalid Jira ID');
        }

        const meta = {
          jira: jiraId,
        };

        const assignees = this.getNodeParameter('assignees', i) as string;
        const reporters = this.getNodeParameter('reporters', i) as string;
        let owners: OwnerInsertInput[] = [];
        let contributors: ContributorInsertInput[] = [];

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

        const variables: InsertIssueMutationVariables = {
          object: {
            Type: 'issue',
            Title: this.getNodeParameter('title', i) as string,
            Details: this.getNodeParameter('details', i) as string,
            DateOccurred: this.getNodeParameter('dateOccurred', i) as string,
            DateIdentified: this.getNodeParameter(
              'dateIdentified',
              i
            ) as string,
            CustomAttributeData: customAttributeData,
            TagTypeIds: [],
            DepartmentTypeIds: [],
            OwnerUserIds: owners
              .map((owner) => owner.UserId)
              .filter((id): id is string => Boolean(id)),
            OwnerGroupIds: [],
            ContributorUserIds: contributors
              .map((contributor) => contributor.UserId)
              .filter((id): id is string => Boolean(id)),
            ContributorGroupIds: [],
            Meta: meta,
          },
        };

        const body = {
          query: print(InsertIssueDocument),
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
