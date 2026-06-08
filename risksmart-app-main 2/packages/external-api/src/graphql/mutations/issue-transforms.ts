import type { WithCustomAttributeData } from '../../clients/mutation-client.interface';
import type {
  InsertIssueInput,
  UpdateIssueInput,
} from '../../generated/graphql';
import type {
  CreateIssueRequest,
  UpdateIssueRequest,
} from '../../schemas/issues/issue-mutate-request.schema';
import {
  defaultGraphqlOwnershipFields,
  type ExistingOwnershipData,
} from './shared-transforms';

export const toGraphqlCreateIssueInput = (
  data: WithCustomAttributeData<CreateIssueRequest & { type: string }>
): InsertIssueInput => ({
  Title: data.title,
  Details: data.description ?? null,
  DateIdentified: data.dateIdentified,
  DateOccurred: data.dateOccurred,
  ImpactsCustomer: data.impactsCustomer ?? null,
  IsExternalIssue: data.isExternalIssue ?? null,
  Type: data.type,
  CustomAttributeData: data.customAttributeData ?? null,
  ...defaultGraphqlOwnershipFields(data.owners),
});

export const toGraphqlUpdateIssueInput = (
  data: WithCustomAttributeData<UpdateIssueRequest>,
  existingOwnership?: ExistingOwnershipData
): Omit<UpdateIssueInput, 'Id' | 'OriginalTimestamp'> => ({
  Title: data.title,
  Details: data.description ?? null,
  DateIdentified: data.dateIdentified,
  DateOccurred: data.dateOccurred,
  ImpactsCustomer: data.impactsCustomer ?? null,
  IsExternalIssue: data.isExternalIssue ?? null,
  CustomAttributeData: data.customAttributeData ?? null,
  ...defaultGraphqlOwnershipFields(data.owners, existingOwnership),
});
