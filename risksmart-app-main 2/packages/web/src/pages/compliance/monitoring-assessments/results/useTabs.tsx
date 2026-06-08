import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';
import { useTranslation } from 'react-i18next';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { filterEmptyTabs } from '@/utils/tabUtils';

import CreateTab from './create/SecondLineResultCreateTab';
import UpdateTab from './update/SecondLineResultUpdateTab';

export const useTabs = (
  assessment: ObjectWithContributors | undefined = undefined,
  resultMode: 'add' | 'update',
  showAssessmentSelector: boolean,
  navigateToResults: boolean
) => {
  const { t } = useTranslation('common');

  const {
    hasPermission: canViewDocumentAssessmentResults,
    loading: isLoadingDocumentAssessmentResults,
  } = useHasPermissionQuery('read:document_second_line_result', assessment);
  const {
    hasPermission: canViewObligationAssessmentResults,
    loading: isLoadingObligationAssessmentResults,
  } = useHasPermissionQuery('read:obligation_second_line_result', assessment);

  const {
    hasPermission: canViewRiskControlledAssessmentResults,
    loading: isLoadingRiskControlledAssessmentResults,
  } = useHasPermissionQuery(
    'read:risk_controlled_second_line_result',
    assessment
  );
  const {
    hasPermission: canViewRiskUncontrolledAssessmentResults,
    loading: isLoadingRiskUncontrolledAssessmentResults,
  } = useHasPermissionQuery(
    'read:risk_uncontrolled_second_line_result',
    assessment
  );
  const loading =
    isLoadingDocumentAssessmentResults ||
    isLoadingObligationAssessmentResults ||
    isLoadingRiskControlledAssessmentResults ||
    isLoadingRiskUncontrolledAssessmentResults;

  const canViewAssessmentResults =
    canViewDocumentAssessmentResults ||
    canViewObligationAssessmentResults ||
    canViewRiskControlledAssessmentResults ||
    canViewRiskUncontrolledAssessmentResults;

  const tabs: TabsProps.Tab[] = [];

  if (!loading && canViewAssessmentResults) {
    tabs.push({
      label: t('details'),
      id: 'details',
      content:
        resultMode === 'add' ? (
          <CreateTab assessment={assessment} />
        ) : (
          assessment && (
            <UpdateTab
              assessment={assessment}
              showAssessmentSelector={showAssessmentSelector}
              navigateToResults={navigateToResults}
            />
          )
        ),
    });
  }

  return filterEmptyTabs(tabs);
};
