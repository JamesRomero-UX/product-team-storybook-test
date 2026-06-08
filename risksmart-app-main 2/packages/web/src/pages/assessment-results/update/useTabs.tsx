import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';
import { useTranslation } from 'react-i18next';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { filterEmptyTabs } from '@/utils/tabUtils';

import CreateTab from '../create/AssessmentResultCreateTab';
import UpdateTab from './AssessmentResultUpdateTab';

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
  } = useHasPermissionQuery('read:document_assessment_result', assessment);
  const {
    hasPermission: canViewObligationAssessmentResults,
    loading: isLoadingObligationAssessmentResults,
  } = useHasPermissionQuery('read:obligation_assessment_result', assessment);

  const {
    hasPermission: canViewRiskAssessmentResults,
    loading: isLoadingRiskAssessmentResults,
  } = useHasPermissionQuery('read:risk_assessment_result', assessment);
  const loading =
    isLoadingDocumentAssessmentResults ||
    isLoadingObligationAssessmentResults ||
    isLoadingRiskAssessmentResults;

  const canViewAssessmentResults =
    canViewDocumentAssessmentResults ||
    canViewObligationAssessmentResults ||
    canViewRiskAssessmentResults;

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
