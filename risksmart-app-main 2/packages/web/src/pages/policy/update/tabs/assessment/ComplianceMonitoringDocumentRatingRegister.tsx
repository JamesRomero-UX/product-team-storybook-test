import { useQuery } from '@apollo/client';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { getCounter } from '@/utils/collectionUtils';

import AssessmentResultModal from '../../../../assessments/modals/AssessmentResultModal';
import { useGetCollectionTableProps } from './complianceMonitoringDocumentRatingConfig';

interface Props {
  parent: ObjectWithContributors;
}

const ComplianceMonitoringDocumentAssessmentResultRegister: FC<Props> = ({
  parent,
}) => {
  const { t: st } = useTranslation(['common']);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { addNotification } = useNotifications();

  const [openAssessmentResultId, setOpenAssessmentResultId] = useState<
    string | undefined
  >();

  const { data, loading } = useQuery(
    GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdDocument,
    {
      variables: {
        ParentId: parent.Id,
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
      fetchPolicy: 'no-cache',
    }
  );

  const handleAssessmentResultModalClose = () => {
    setOpenAssessmentResultId(undefined);
    setIsEditOpen(false);
  };

  const onOpenResult = (id?: string) => {
    setOpenAssessmentResultId(id);
    setIsEditOpen(true);
  };

  const tableProps = useGetCollectionTableProps(
    data?.document_second_line_result,
    onOpenResult
  );

  return (
    <>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>{st('documentAssessments.complianceRatingSubheading')}</span>
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
          data-testid={'internal-audit-document-rating-table'}
        />
      </ExpandableSection>
      {isEditOpen && (
        <AssessmentResultModal
          id={openAssessmentResultId}
          onDismiss={handleAssessmentResultModalClose}
          assessedItem={parent}
          resultType={Parent_Type_Enum.DocumentAssessmentResult}
          hideTypeSelector={true}
          i18n={st('ratings')}
          assessmentMode={'compliance_monitoring_assessment'}
        />
      )}
    </>
  );
};

export default ComplianceMonitoringDocumentAssessmentResultRegister;
