import { useQuery } from '@apollo/client';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  GetInternalAuditReportObligationAssessmentResultsByObligationIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import AssessmentResultModal from 'src/pages/assessments/modals/AssessmentResultModal';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './internalAuditObligationRatingConfig';

interface Props {
  parent: ObjectWithContributors;
}

const InternalAuditObligationRatingRegister: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('obligationsAssessments.tabHelp');
  const { t } = useTranslation(['common']);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { addNotification } = useNotifications();

  const [openAssessmentResultId, setOpenAssessmentResultId] = useState<
    string | undefined
  >();

  const { data, loading } = useQuery(
    GetInternalAuditReportObligationAssessmentResultsByObligationIdDocument,
    {
      variables: {
        ObligationId: parent.Id,
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );

  const handleAssessmentResultModalClose = () => {
    setOpenAssessmentResultId(undefined);
    setIsEditOpen(false);
  };

  const onOpenResult = (id: string) => {
    setOpenAssessmentResultId(id);
    setIsEditOpen(true);
  };

  const tableProps = useGetCollectionTableProps(
    data?.obligation_internal_audit_result,
    onOpenResult
  );

  return (
    <>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>
              {t('obligationsAssessments.internalAuditRatingSubheading')}
            </span>
            <span className={'text-grey font-normal'}>
              {getCounter(tableProps.totalItemsCount ?? 0, loading)}
            </span>
          </div>
        }
        defaultExpanded={true}
      >
        <Table
          {...tableProps}
          resizableColumns={true}
          variant={'embedded'}
          loading={loading}
          loadingText={t('obligationsAssessments.loading_message') ?? ''}
        />
      </ExpandableSection>
      {isEditOpen && (
        <AssessmentResultModal
          id={openAssessmentResultId}
          onDismiss={handleAssessmentResultModalClose}
          assessedItem={parent}
          resultType={Parent_Type_Enum.ObligationAssessmentResult}
          hideTypeSelector={true}
          i18n={t('ratings')}
          assessmentMode={'internal_audit_report'}
        />
      )}
    </>
  );
};

export default InternalAuditObligationRatingRegister;
