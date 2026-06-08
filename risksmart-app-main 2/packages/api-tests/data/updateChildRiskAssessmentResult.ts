import type { UpdateChildRiskAssessmentResultMutationVariables } from '../generated/graphql';

const updateChildRiskAssessmentResult: UpdateChildRiskAssessmentResultMutationVariables =
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Id: null as any as string,
    Rating: 3,
    Rationale: 'This is a rationale',
    TestDate: '2021-09-01',
  };

export const buildUpdateChildRiskAssessmentResult = (
  overrides: Partial<UpdateChildRiskAssessmentResultMutationVariables> = {}
): UpdateChildRiskAssessmentResultMutationVariables => {
  return {
    ...updateChildRiskAssessmentResult,
    ...overrides,
  };
};
