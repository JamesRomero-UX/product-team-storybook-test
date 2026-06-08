import { useMutation } from '@apollo/client';
import Button from '@risk-smart/themed-cloudscape-components/button';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risksmart-app/components/src/table';
import type { GetAssessmentResultsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  DeleteAssessmentResultsDocument,
  GetAllAssessmentResultsDocument,
  GetAssessmentResultsByParentIdDocument,
  GetDocumentAssessmentResultsByParentIdDocument,
  GetObligationAssessmentResultsByObligationIdDocument,
  GetRiskAssessmentResultsByControlTypeDocument,
  GetRiskAssessmentResultsByRiskIdDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import TabHeader from 'src/components/tab-header';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import { getAssessmentResultTableFields } from './assessmentRatingRegisterUtils';
import { useGetCollectionStatelessTableProps } from './config';
import type { AssessmentResultRegisterFields } from './types';

interface Props {
  loading: boolean;
  assessmentId: string;
  records: GetAssessmentResultsByParentIdQuery | undefined;
  parent: ObjectWithContributors;
}

const AssessmentRatingRegister: FC<Props> = ({
  loading,
  records,
  assessmentId,
  parent,
}) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });
  const tableProps = useGetCollectionStatelessTableProps(
    getAssessmentResultTableFields(records, assessmentId)
  );
  const [selectedAssessmentResults, setSelectedAssessmentResults] = useState<
    AssessmentResultRegisterFields[]
  >([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const {
    hasPermission: canDeleteDocumentAssessmentResult,
    loading: canDeleteDocumentAssessmentResultLoading,
  } = useHasPermissionQuery('delete:document_assessment_result', parent);
  const {
    hasPermission: canDeleteObligationAssessmentResult,
    loading: canDeleteObligationAssessmentResultLoading,
  } = useHasPermissionQuery('delete:obligation_assessment_result', parent);
  const {
    hasPermission: canDeleteRiskAssessmentResult,
    loading: canDeleteRiskAssessmentResultLoading,
  } = useHasPermissionQuery('delete:risk_assessment_result', parent);

  const isLoading =
    canDeleteDocumentAssessmentResultLoading ||
    canDeleteObligationAssessmentResultLoading ||
    canDeleteRiskAssessmentResultLoading;
  const canDeleteAssessmentResult =
    !isLoading &&
    (canDeleteDocumentAssessmentResult ||
      canDeleteObligationAssessmentResult ||
      canDeleteRiskAssessmentResult);

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    asyncAction: async () => {
      await deleteAssessmentResults({
        variables: {
          Ids: selectedAssessmentResults?.map((s) => s.Id),
        },
      });
      setSelectedAssessmentResults([]);
      setIsDeleteModalVisible(false);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const [deleteAssessmentResults, deleteResult] = useMutation(
    DeleteAssessmentResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_assessment_result');
        evictField(cache, 'document_assessment_result');
        evictField(cache, 'risk_assessment_result');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'obligation_assessment_result_aggregate');
        evictField(cache, 'document_assessment_result_aggregate');
        evictField(cache, 'risk_assessment_result_aggregate');
      },
      refetchQueries: [
        GetAssessmentResultsByParentIdDocument,
        GetDocumentAssessmentResultsByParentIdDocument,
        GetAllAssessmentResultsDocument,
        GetObligationAssessmentResultsByObligationIdDocument,
        GetRiskAssessmentResultsByControlTypeDocument,
        GetRiskAssessmentResultsByRiskIdDocument,
      ],
    }
  );

  return (
    <>
      <Table
        {...tableProps}
        loading={loading}
        selectionType={canDeleteAssessmentResult ? 'multi' : undefined}
        selectedItems={selectedAssessmentResults}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedAssessmentResults(detail.selectedItems);
        }}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  {canDeleteAssessmentResult && (
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedAssessmentResults.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete_button')}
                    </Button>
                  )}
                </SpaceBetween>
              }
            ></TabHeader>
          </SpaceBetween>
        }
        resizableColumns={true}
        variant={'embedded'}
        columnDefinitions={tableProps.columnDefinitions}
        items={tableProps.items}
        loadingText={t('loading_message')}
        sortingDisabled={false}
      />
      <DeleteModal
        isVisible={isDeleteModalVisible}
        loading={deleteResult.loading}
        header={t('delete_button')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {t('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default AssessmentRatingRegister;
