import { useMutation } from '@apollo/client';
import Button from '@risk-smart/themed-cloudscape-components/button';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risksmart-app/components/src/table';
import type { GetSecondLineResultsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  DeleteSecondLineResultsDocument,
  GetAllComplianceMonitoringAssessmentResultsDocument,
  GetSecondLineResultsByParentIdDocument,
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
import { getSecondLineResultTableFields } from './secondLineRatingRegisterUtils';
import type { SecondLineResultRegisterFields } from './types';

interface Props {
  loading: boolean;
  assessmentId: string;
  records: GetSecondLineResultsByParentIdQuery | undefined;
  parent: ObjectWithContributors;
}

const SecondLineRatingRegister: FC<Props> = ({
  loading,
  records,
  assessmentId,
  parent,
}) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });
  const tableProps = useGetCollectionStatelessTableProps(
    getSecondLineResultTableFields(records, assessmentId)
  );
  const [selectedSecondLineResults, setSelectedSecondLineResults] = useState<
    SecondLineResultRegisterFields[]
  >([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const {
    hasPermission: canDeleteDocumentSecondLineResult,
    loading: canDeleteDocumentSecondLineResultLoading,
  } = useHasPermissionQuery('delete:document_second_line_result', parent);
  const {
    hasPermission: canDeleteObligationSecondLineResult,
    loading: canDeleteObligationSecondLineResultLoading,
  } = useHasPermissionQuery('delete:obligation_second_line_result', parent);
  const {
    hasPermission: canDeleteRiskControlledSecondLineResult,
    loading: canDeleteRiskControlledSecondLineResultLoading,
  } = useHasPermissionQuery(
    'delete:risk_controlled_second_line_result',
    parent
  );
  const {
    hasPermission: canDeleteRiskUncontrolledSecondLineResult,
    loading: canDeleteRiskUncontrolledSecondLineResultLoading,
  } = useHasPermissionQuery(
    'delete:risk_uncontrolled_second_line_result',
    parent
  );
  const {
    hasPermission: canDeleteControlTestSecondLineResult,
    loading: canDeleteControlTestSecondLineResultLoading,
  } = useHasPermissionQuery('delete:control_test_second_line_result', parent);

  const isLoading =
    canDeleteDocumentSecondLineResultLoading ||
    canDeleteObligationSecondLineResultLoading ||
    canDeleteRiskControlledSecondLineResultLoading ||
    canDeleteRiskUncontrolledSecondLineResultLoading ||
    canDeleteControlTestSecondLineResultLoading;

  const canDeleteSecondLineResult =
    !isLoading &&
    (canDeleteDocumentSecondLineResult ||
      canDeleteObligationSecondLineResult ||
      canDeleteRiskControlledSecondLineResult ||
      canDeleteRiskUncontrolledSecondLineResult ||
      canDeleteControlTestSecondLineResult);

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    asyncAction: async () => {
      await deleteSecondLineResults({
        variables: {
          Ids: selectedSecondLineResults?.map((s) => s.Id),
        },
      });
      setSelectedSecondLineResults([]);
      setIsDeleteModalVisible(false);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const [deleteSecondLineResults, deleteResult] = useMutation(
    DeleteSecondLineResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_second_line_result');
        evictField(cache, 'document_second_line_result');
        evictField(cache, 'risk_controlled_second_line_result');
        evictField(cache, 'risk_uncontrolled_second_line_result');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'obligation_second_line_result_aggregate');
        evictField(cache, 'document_second_line_result_aggregate');
        evictField(cache, 'risk_controlled_second_line_result_aggregate');
        evictField(cache, 'risk_uncontrolled_second_line_result_aggregate');
      },
      refetchQueries: [
        GetSecondLineResultsByParentIdDocument,
        GetAllComplianceMonitoringAssessmentResultsDocument,
      ],
    }
  );

  return (
    <>
      <Table
        {...tableProps}
        loading={loading}
        selectionType={canDeleteSecondLineResult ? 'multi' : undefined}
        selectedItems={selectedSecondLineResults}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedSecondLineResults(detail.selectedItems);
        }}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  {canDeleteSecondLineResult && (
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedSecondLineResults.length}
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

export default SecondLineRatingRegister;
