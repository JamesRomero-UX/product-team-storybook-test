import type { WithCustomAttributeData } from '../../clients/mutation-client.interface';
import type {
  InsertIndicatorResultMutationVariables,
  UpdateIndicatorResultMutationVariables,
} from '../../generated/graphql';
import type {
  CreateIndicatorResultRequest,
  UpdateIndicatorResultRequest,
} from '../../schemas/indicators/indicator-result-mutate-request.schema';

export function toGraphqlCreateIndicatorResultInput(
  input: WithCustomAttributeData<CreateIndicatorResultRequest>,
  indicatorId: string
): InsertIndicatorResultMutationVariables {
  return {
    IndicatorId: indicatorId,
    ResultDate: input.resultDate,
    Description: input.description ?? null,
    TargetValueNum: input.targetValueNum ?? null,
    TargetValueTxt: input.targetValueTxt ?? null,
    CustomAttributeData: input.customAttributeData ?? null,
  };
}

export function toGraphqlUpdateIndicatorResultInput(
  input: WithCustomAttributeData<UpdateIndicatorResultRequest>,
  resultId: string
): UpdateIndicatorResultMutationVariables {
  return {
    id: resultId,
    ResultDate: input.resultDate,
    Description: input.description ?? null,
    TargetValueNum: input.targetValueNum ?? null,
    TargetValueTxt: input.targetValueTxt ?? null,
    CustomAttributeData: input.customAttributeData ?? null,
  };
}
