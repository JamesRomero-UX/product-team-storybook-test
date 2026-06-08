import type {
  GetAssessmentByIdQuery,
  GetRiskByIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

export const useGetAssessmentContributors = (
  assessmentData: GetAssessmentByIdQuery | undefined,
  risk: GetRiskByIdQuery | undefined,
  isUpdate?: boolean
) => {
  return useMemo(() => {
    return (
      assessmentData?.assessment[0].ancestorContributors
        .filter(
          (contributor) =>
            contributor.ContributorType === 'owner' ||
            contributor.ContributorType === 'contributor'
        )
        .map((contributor) => contributor.UserId)
        .filter((contributorId) => {
          const isRiskContributor = risk?.risk[0].ancestorContributors.some(
            (riskContributor) => riskContributor.UserId === contributorId
          );

          return isUpdate ? isRiskContributor : true;
        }) ?? []
    );
  }, [assessmentData, risk, isUpdate]);
};
