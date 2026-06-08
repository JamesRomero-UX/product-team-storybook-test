import { useMutation } from '@apollo/client';
import {
  GetLatestRiskAssessmentResultConfigDocument,
  UpdateRiskAssessmentResultConfigDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const useUpdateRiskAssessmentResultConfig = () => {
  const [mutate, { loading }] = useMutation(
    UpdateRiskAssessmentResultConfigDocument,
    {
      refetchQueries: [GetLatestRiskAssessmentResultConfigDocument],
    }
  );

  return { mutate, loading };
};
