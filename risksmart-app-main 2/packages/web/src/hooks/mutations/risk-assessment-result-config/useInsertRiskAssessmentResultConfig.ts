import { useMutation } from '@apollo/client';
import {
  GetLatestRiskAssessmentResultConfigDocument,
  InsertRiskAssessmentResultConfigDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const useInsertRiskAssessmentResultConfig = () => {
  const [mutate, { loading }] = useMutation(
    InsertRiskAssessmentResultConfigDocument,
    {
      refetchQueries: [GetLatestRiskAssessmentResultConfigDocument],
    }
  );

  return { mutate, loading };
};
