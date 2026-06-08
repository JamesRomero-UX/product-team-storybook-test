import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';

import type { WithCustomAttributeData } from '../../clients/mutation-client.interface';
import type {
  InsertChildIndicatorInput,
  UpdateChildIndicatorInput,
} from '../../generated/graphql';
import type {
  CreateIndicatorRequest,
  UpdateIndicatorRequest,
} from '../../schemas/indicators/indicator-mutate-request.schema';
import {
  defaultGraphqlOwnershipFields,
  type ExistingOwnershipData,
  toGraphqlScheduleInput,
} from './shared-transforms';

const toBaseGraphqlIndicatorFields = (
  input: WithCustomAttributeData<
    CreateIndicatorRequest | (UpdateIndicatorRequest & { type: IndicatorType })
  >,
  existingOwnership?: ExistingOwnershipData
) => ({
  Title: input.title,
  Description: input.description ?? null,
  Type: input.type as unknown as InsertChildIndicatorInput['Type'],
  Unit: input.type === IndicatorType.Number ? (input.unit ?? null) : null,
  TargetValueTxt:
    input.type === IndicatorType.Text ? input.targetValue : null,
  UpperToleranceNum:
    input.type === IndicatorType.Number
      ? (input.upperTolerance ?? null)
      : null,
  LowerToleranceNum:
    input.type === IndicatorType.Number
      ? (input.lowerTolerance ?? null)
      : null,
  UpperAppetiteNum:
    input.type === IndicatorType.Number
      ? (input.upperAppetite ?? null)
      : null,
  LowerAppetiteNum:
    input.type === IndicatorType.Number
      ? (input.lowerAppetite ?? null)
      : null,
  CustomAttributeData: input.customAttributeData ?? null,
  ...defaultGraphqlOwnershipFields(input.owners, existingOwnership),
  schedule: toGraphqlScheduleInput(input.schedule),
});

export const toGraphqlCreateIndicatorInput = (
  input: WithCustomAttributeData<CreateIndicatorRequest>
): InsertChildIndicatorInput => ({
  ...toBaseGraphqlIndicatorFields(input),
  ParentId: input.parentId,
});

export const toGraphqlUpdateIndicatorInput = (
  input: WithCustomAttributeData<
    UpdateIndicatorRequest & { type: IndicatorType }
  >,
  existingOwnership?: ExistingOwnershipData
): Omit<UpdateChildIndicatorInput, 'Id'> =>
  toBaseGraphqlIndicatorFields(input, existingOwnership);
