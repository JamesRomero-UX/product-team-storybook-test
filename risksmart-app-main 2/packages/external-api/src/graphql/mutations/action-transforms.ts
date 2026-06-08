import type { WithCustomAttributeData } from '../../clients/mutation-client.interface';
import type {
  ActionStatusEnum,
  InsertChildActionMutationVariables,
  UpdateActionMutationVariables,
} from '../../generated/graphql';
import type {
  CreateActionRequest,
  UpdateActionRequest,
} from '../../schemas/actions/action-mutate-request.schema';
import {
  defaultGraphqlOwnershipFields,
  type ExistingOwnershipData,
} from './shared-transforms';

export const toGraphqlCreateActionInput = (
  data: WithCustomAttributeData<CreateActionRequest>
): InsertChildActionMutationVariables => ({
  Title: data.title,
  Status: data.status as unknown as ActionStatusEnum,
  DateRaised: data.dateRaised,
  DateDue: data.dateDue,
  Description: data.description ?? null,
  Priority: data.priority,
  ClosedDate: data.closedDate ?? null,
  ParentId: data.parentId ?? null,
  CustomAttributeData: data.customAttributeData ?? null,
  ...defaultGraphqlOwnershipFields(data.owners),
});

export const toGraphqlUpdateActionInput = (
  data: WithCustomAttributeData<UpdateActionRequest>,
  existingOwnership?: ExistingOwnershipData
): Omit<UpdateActionMutationVariables, 'Id' | 'OriginalTimestamp'> => ({
  Title: data.title,
  Status: data.status as unknown as ActionStatusEnum,
  DateRaised: data.dateRaised,
  DateDue: data.dateDue,
  Description: data.description ?? null,
  Priority: data.priority,
  ClosedDate: data.closedDate ?? null,
  CustomAttributeData: data.customAttributeData ?? null,
  ...defaultGraphqlOwnershipFields(data.owners, existingOwnership),
});
