import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import Table from '@risksmart-app/components/src/table';
import {
  Parent_Type_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { useGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId } from 'src/hooks/queries';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { getCounter } from '@/utils/collectionUtils';

import AssessmentResultModal from '../../../../assessments/modals/AssessmentResultModal';
import { useGetCollectionTableProps } from './complianceRatingConfig';

interface Props {
  risk: ObjectWithContributors;
}

const ComplianceRatingRegister: FC<Props> = ({ risk }) => {
  useI18NSummaryHelpContent('assessments.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'ratings' });

  const { data, loading } =
    useGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId({
      queryArgs: { riskId: risk.Id },
    });

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [openAssessmentResultId, setOpenAssessmentResultId] = useState<
    string | undefined
  >();

  const handleAssessmentResultModalClose = () => {
    setOpenAssessmentResultId(undefined);
    setIsEditOpen(false);
  };

  const onOpenResult = (id: string) => {
    setOpenAssessmentResultId(id);
    setIsEditOpen(true);
  };

  const controlledRatings =
    data?.risk_controlled_second_line_result.map((item) => ({
      ...item,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
    })) ?? [];
  const uncontrolledRatings =
    data?.risk_uncontrolled_second_line_result.map((item) => ({
      ...item,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
    })) ?? [];

  const tableProps = useGetCollectionTableProps(risk.Id, onOpenResult, [
    ...controlledRatings,
    ...uncontrolledRatings,
  ]);

  return (
    <>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>{st('complianceRatingSubheading')}</span>
            <span className={'text-grey font-normal'}>
              {getCounter(tableProps.totalItemsCount ?? 0, loading)}
            </span>
          </div>
        }
        defaultExpanded={false}
      >
        <Table
          {...tableProps}
          loading={loading}
          variant={'embedded'}
          data-testid={'compliance-assessment-rating-table'}
        />
      </ExpandableSection>
      {isEditOpen && (
        <AssessmentResultModal
          id={openAssessmentResultId}
          onDismiss={handleAssessmentResultModalClose}
          assessedItem={risk}
          resultType={Parent_Type_Enum.RiskAssessmentResult}
          hideTypeSelector={true}
          i18n={t('ratings')}
          assessmentMode={'compliance_monitoring_assessment'}
        />
      )}
    </>
  );
};
export default ComplianceRatingRegister;
