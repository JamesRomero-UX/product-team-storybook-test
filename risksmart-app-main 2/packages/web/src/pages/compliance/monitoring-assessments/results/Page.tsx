import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  DeleteSecondLineResultsDocument,
  GetAllComplianceMonitoringAssessmentResultsDocument,
  GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdDocument,
  GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdDocument,
  GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument,
  GetComplianceMonitoringAssessmentTestResultsByControlIdDocument,
  GetSecondLineResultsByParentIdDocument,
  Parent_Type_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import CustomisableRibbon from 'src/components/customisable-ribbon/CustomisableRibbon';
import DeleteModal from 'src/components/delete-modal';
import ExportButton from 'src/components/export-button';
import { useRibbonAndExport } from 'src/hooks/useRibbonAndExport';
import { PageLayout } from 'src/layouts';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { handleError } from '@/utils/errorUtils';
import { evictField } from '@/utils/graphqlUtils';

import { useGetCollectionTableProps } from './config';
import type { ComplianceMonitoringAssessmentResultRegisterFields } from './types';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const ComplianceMonitoringAssessmentResultsPage: FC = () => {
  const { t: st } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });

  const { addNotification } = useNotifications();
  const { data, loading } = useQuery(
    GetAllComplianceMonitoringAssessmentResultsDocument,
    {
      onError: (error) => {
        handleError(error);
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );
  const [selectedSecondLineResults, setSelectedSecondLineResults] = useState<
    ComplianceMonitoringAssessmentResultRegisterFields[]
  >([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const {
    hasPermission: canDeleteDocumentSecondLineResult,
    loading: canDeleteDocumentSecondLineResultLoading,
  } = useHasPermissionQuery('delete:document_second_line_result');
  const {
    hasPermission: canDeleteObligationSecondLineResult,
    loading: canDeleteObligationSecondLineResultLoading,
  } = useHasPermissionQuery('delete:obligation_second_line_result');
  const {
    hasPermission: canDeleteRiskControlledSecondLineResult,
    loading: canDeleteRiskControlledSecondLineResultLoading,
  } = useHasPermissionQuery('delete:risk_controlled_second_line_result');
  const {
    hasPermission: canDeleteRiskUncontrolledSecondLineResult,
    loading: canDeleteRiskUncontrolledSecondLineResultLoading,
  } = useHasPermissionQuery('delete:risk_uncontrolled_second_line_result');
  const isLoading =
    canDeleteDocumentSecondLineResultLoading ||
    canDeleteObligationSecondLineResultLoading ||
    canDeleteRiskControlledSecondLineResultLoading ||
    canDeleteRiskUncontrolledSecondLineResultLoading;
  const canDeleteSecondLineResult =
    !isLoading &&
    (canDeleteDocumentSecondLineResult ||
      canDeleteObligationSecondLineResult ||
      canDeleteRiskControlledSecondLineResult ||
      canDeleteRiskUncontrolledSecondLineResult);

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteSecondLineResults({
        variables: {
          Ids: selectedSecondLineResults?.map((s) => s.originalResult.Id),
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
        GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdDocument,
        GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdDocument,
        GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument,
        GetComplianceMonitoringAssessmentTestResultsByControlIdDocument,
      ],
    }
  );

  const navigate = useNavigate();

  const handleOpenRating = (id: string) => {
    navigate(id);
  };

  const tableProps = useGetCollectionTableProps(
    [
      ...(data?.document_second_line_result || []),
      ...(data?.obligation_second_line_result || []),
      ...(data?.risk_controlled_second_line_result?.map((c) => ({
        ...c,
        ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
      })) || []),
      ...(data?.risk_uncontrolled_second_line_result?.map((c) => ({
        ...c,
        ControlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
      })) || []),
    ],
    handleOpenRating
  );

  const assessmentResultCount = useMemo(() => {
    if (loading) {
      return '';
    }

    return `(${tableProps.allItems?.length})`;
  }, [loading, tableProps]);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  const title = st('register_title');

  return (
    <PageLayout
      helpTranslationKey={'assessmentResults.registerHelp'}
      title={title}
      counter={assessmentResultCount}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xxs'}>
          {canDeleteSecondLineResult && (
            <Button
              formAction={'none'}
              variant={'normal'}
              disabled={!selectedSecondLineResults.length}
              onClick={() => setIsDeleteModalVisible(true)}
            >
              {st('delete_button')}
            </Button>
          )}
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
        </SpaceBetween>
      }
    >
      <CustomisableRibbon
        items={tableProps.allItems}
        propertyFilterQuery={tableProps.propertyFilterQuery}
        onFilterQueryChanged={tableProps.actions.setPropertyFiltering}
        filteringProperties={tableProps.filteringProperties}
        filteringOptions={tableProps.propertyFilterProps.filteringOptions}
        parentType={Parent_Type_Enum.ComplianceMonitoringAssessmentResult}
        {...ribbonProps}
      />
      <Table
        {...tableProps}
        loading={loading}
        selectionType={canDeleteSecondLineResult ? 'multi' : undefined}
        selectedItems={selectedSecondLineResults}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedSecondLineResults(detail.selectedItems);
        }}
      />
      <DeleteModal
        isVisible={isDeleteModalVisible}
        loading={deleteResult.loading}
        header={st('delete_button')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default ComplianceMonitoringAssessmentResultsPage;
