import { useQuery } from '@apollo/client';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  GetInternalAuditReportDocumentAssessmentResultsByDocumentIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { getCounter } from '@/utils/collectionUtils';

import AssessmentResultModal from '../../../../assessments/modals/AssessmentResultModal';
import { useGetCollectionTableProps } from './internalAuditDocumentRatingConfig';

interface Props {
  parent: ObjectWithContributors;
}

const InternalAuditDocumentAssessmentResultRegister: FC<Props> = ({
  parent,
}) => {
  const { t: st } = useTranslation(['common']);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { addNotification } = useNotifications();

  const [openAssessmentResultId, setOpenAssessmentResultId] = useState<
    string | undefined
  >();

  const { data, loading } = useQuery(
    GetInternalAuditReportDocumentAssessmentResultsByDocumentIdDocument,
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
    data?.document_internal_audit_result,
    onOpenResult
  );

  return (
    <>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>
              {st('documentAssessments.internalAuditRatingSubheading')}
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
          assessmentMode={'internal_audit_report'}
        />
      )}
    </>
  );
};

export default InternalAuditDocumentAssessmentResultRegister;
