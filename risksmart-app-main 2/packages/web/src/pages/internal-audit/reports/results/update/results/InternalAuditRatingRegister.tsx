import { useMutation } from '@apollo/client';
import Button from '@risk-smart/themed-cloudscape-components/button';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risksmart-app/components/src/table';
import type { GetInternalAuditResultsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  DeleteInternalAuditResultsDocument,
  GetAllInternalAuditReportResultsDocument,
  GetInternalAuditResultsByParentIdDocument,
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

import { useGetCollectionStatelessTableProps } from './config';
import { getInternalAuditResultTableFields } from './internalAuditRatingRegisterUtils';
import type { InternalAuditResultRegisterFields } from './types';

interface Props {
  loading: boolean;
  assessmentId: string;
  records: GetInternalAuditResultsByParentIdQuery | undefined;
  parent: ObjectWithContributors;
}

const InternalAuditRatingRegister: FC<Props> = ({
  loading,
  records,
  assessmentId,
  parent,
}) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });
  const tableProps = useGetCollectionStatelessTableProps(
    getInternalAuditResultTableFields(records, assessmentId)
  );
  const [selectedInternalAuditResults, setSelectedInternalAuditResults] =
    useState<InternalAuditResultRegisterFields[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const {
    hasPermission: canDeleteDocumentInternalAuditResult,
    loading: canDeleteDocumentInternalAuditResultLoading,
  } = useHasPermissionQuery('delete:document_internal_audit_result', parent);
  const {
    hasPermission: canDeleteObligationInternalAuditResult,
    loading: canDeleteObligationInternalAuditResultLoading,
  } = useHasPermissionQuery('delete:obligation_internal_audit_result', parent);
  const {
    hasPermission: canDeleteRiskControlledInternalAuditResult,
    loading: canDeleteRiskControlledInternalAuditResultLoading,
  } = useHasPermissionQuery(
    'delete:risk_controlled_internal_audit_result',
    parent
  );
  const {
    hasPermission: canDeleteRiskUncontrolledInternalAuditResult,
    loading: canDeleteRiskUncontrolledInternalAuditResultLoading,
  } = useHasPermissionQuery(
    'delete:risk_uncontrolled_internal_audit_result',
    parent
  );
  const {
    hasPermission: canDeleteControlTestInternalAuditResult,
    loading: canDeleteControlTestInternalAuditResultLoading,
  } = useHasPermissionQuery(
    'delete:control_test_internal_audit_result',
    parent
  );
  const isLoading =
    canDeleteDocumentInternalAuditResultLoading ||
    canDeleteObligationInternalAuditResultLoading ||
    canDeleteRiskControlledInternalAuditResultLoading ||
    canDeleteRiskUncontrolledInternalAuditResultLoading ||
    canDeleteControlTestInternalAuditResultLoading;

  const canDeleteInternalAuditResult =
    !isLoading &&
    (canDeleteDocumentInternalAuditResult ||
      canDeleteObligationInternalAuditResult ||
      canDeleteRiskControlledInternalAuditResult ||
      canDeleteRiskUncontrolledInternalAuditResult ||
      canDeleteControlTestInternalAuditResult);

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    asyncAction: async () => {
      await deleteInternalAuditResults({
        variables: {
          Ids: selectedInternalAuditResults?.map((s) => s.Id),
        },
      });
      setSelectedInternalAuditResults([]);
      setIsDeleteModalVisible(false);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const [deleteInternalAuditResults, deleteResult] = useMutation(
    DeleteInternalAuditResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_internal_audit_result');
        evictField(cache, 'document_internal_audit_result');
        evictField(cache, 'risk_controlled_internal_audit_result');
        evictField(cache, 'risk_uncontrolled_internal_audit_result');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'obligation_internal_audit_result_aggregate');
        evictField(cache, 'document_internal_audit_result_aggregate');
        evictField(cache, 'risk_controlled_internal_audit_result_aggregate');
        evictField(cache, 'risk_uncontrolled_internal_audit_result_aggregate');
      },
      refetchQueries: [
        GetInternalAuditResultsByParentIdDocument,
        GetAllInternalAuditReportResultsDocument,
      ],
    }
  );

  return (
    <>
      <Table
        {...tableProps}
        loading={loading}
        selectionType={canDeleteInternalAuditResult ? 'multi' : undefined}
        selectedItems={selectedInternalAuditResults}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedInternalAuditResults(detail.selectedItems);
        }}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  {canDeleteInternalAuditResult && (
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedInternalAuditResults.length}
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

export default InternalAuditRatingRegister;
