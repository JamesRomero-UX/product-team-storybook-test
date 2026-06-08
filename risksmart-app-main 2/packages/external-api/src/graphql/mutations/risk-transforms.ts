import type { CreateRiskMutationData } from '../../clients/mutation-client.interface';
import type { InsertChildRiskInput } from '../../generated/graphql';
import {
  defaultGraphqlOwnershipFields,
  type ExistingOwnershipData,
  toGraphqlScheduleInput,
} from './shared-transforms';

export const toGraphqlRiskInput = (
  data: CreateRiskMutationData,
  existingOwnership?: ExistingOwnershipData
): InsertChildRiskInput => ({
  Title: data.title,
  Description: data.description ?? null,
  Tier: data.tier,
  ParentRiskId: data.parentRiskId ?? null,
  Treatment: data.treatment as InsertChildRiskInput['Treatment'],
  Status: data.status as InsertChildRiskInput['Status'],
  CustomAttributeData: data.customAttributeData ?? null,
  ...defaultGraphqlOwnershipFields(data.owners, existingOwnership),
  schedule: toGraphqlScheduleInput(data.schedule),
});
