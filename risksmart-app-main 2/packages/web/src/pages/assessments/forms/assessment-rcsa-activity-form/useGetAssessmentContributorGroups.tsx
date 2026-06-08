import type {
  GetAssessmentByIdQuery,
  GetRiskByIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

export const useGetAssessmentContributorGroups = (
  assessmentData: GetAssessmentByIdQuery | undefined,
  risk: GetRiskByIdQuery | undefined,
  isUpdate?: boolean
) => {
  return useMemo(() => {
    return (
      assessmentData?.assessment[0].ancestorContributors
        .filter(
          (contributor) =>
            (contributor.ContributorType === 'owner' ||
              contributor.ContributorType === 'contributor') &&
            contributor.user_group
        )
        .map((contributor) => contributor.UserGroupId)
        .filter((contributorGroupId) => {
          const isRiskContributorGroup =
            risk?.risk[0].ancestorContributors.some(
              (riskContributor) =>
                riskContributor.UserGroupId === contributorGroupId
            );

          return isUpdate ? isRiskContributorGroup : true;
        }) ?? []
    );
  }, [assessmentData, risk, isUpdate]);
};
