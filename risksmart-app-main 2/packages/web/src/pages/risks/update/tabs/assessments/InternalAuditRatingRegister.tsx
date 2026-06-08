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
import { useGetInternalAuditReportRiskAssessmentResultsByRiskId } from 'src/hooks/queries';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { getCounter } from '@/utils/collectionUtils';

import AssessmentResultModal from '../../../../assessments/modals/AssessmentResultModal';
import { useGetCollectionTableProps } from './internalAuditRatingConfig';

interface Props {
  risk: ObjectWithContributors;
}

const InternalAuditRatingRegister: FC<Props> = ({ risk }) => {
  useI18NSummaryHelpContent('assessments.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'ratings' });

  const { data, loading } =
    useGetInternalAuditReportRiskAssessmentResultsByRiskId({
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
    data?.risk_controlled_internal_audit_result.map((item) => ({
      ...item,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
    })) ?? [];
  const uncontrolledRatings =
    data?.risk_uncontrolled_internal_audit_result.map((item) => ({
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
            <span>{st('internalAuditRatingSubheading')}</span>
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
          data-testid={'internal-audit-rating-table'}
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
          assessmentMode={'internal_audit_report'}
        />
      )}
    </>
  );
};
export default InternalAuditRatingRegister;
