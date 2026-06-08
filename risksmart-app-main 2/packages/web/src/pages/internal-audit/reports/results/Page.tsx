import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  DeleteInternalAuditResultsDocument,
  GetAllInternalAuditReportResultsDocument,
  GetInternalAuditReportDocumentAssessmentResultsByDocumentIdDocument,
  GetInternalAuditReportObligationAssessmentResultsByObligationIdDocument,
  GetInternalAuditReportRiskAssessmentResultsByRiskIdDocument,
  GetInternalAuditReportTestResultsByControlIdDocument,
  GetInternalAuditResultsByParentIdDocument,
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
import type { InternalAuditReportResultRegisterFields } from './types';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const InternalAuditReportResultsPage: FC = () => {
  const { t: st } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });
  const { t: stt } = useTranslation('common', {
    keyPrefix: 'internalAuditAssessmentResults',
  });

  const { addNotification } = useNotifications();
  const { data, loading } = useQuery(GetAllInternalAuditReportResultsDocument, {
    onError: (error) => {
      handleError(error);
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
    fetchPolicy: 'no-cache',
  });
  const [selectedInternalAuditResults, setSelectedInternalAuditResults] =
    useState<InternalAuditReportResultRegisterFields[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const {
    hasPermission: canDeleteDocumentInternalAuditResult,
    loading: canDeleteDocumentInternalAuditResultLoading,
  } = useHasPermissionQuery('delete:document_internal_audit_result');
  const {
    hasPermission: canDeleteObligationInternalAuditResult,
    loading: canDeleteObligationInternalAuditResultLoading,
  } = useHasPermissionQuery('delete:obligation_internal_audit_result');
  const {
    hasPermission: canDeleteRiskControlledInternalAuditResult,
    loading: canDeleteRiskControlledInternalAuditResultLoading,
  } = useHasPermissionQuery('delete:risk_controlled_internal_audit_result');
  const {
    hasPermission: canDeleteRiskUncontrolledInternalAuditResult,
    loading: canDeleteRiskUncontrolledInternalAuditResultLoading,
  } = useHasPermissionQuery('delete:risk_uncontrolled_internal_audit_result');

  const isLoading =
    canDeleteDocumentInternalAuditResultLoading ||
    canDeleteObligationInternalAuditResultLoading ||
    canDeleteRiskControlledInternalAuditResultLoading ||
    canDeleteRiskUncontrolledInternalAuditResultLoading;
  const canDeleteInternalAuditResult =
    !isLoading &&
    (canDeleteDocumentInternalAuditResult ||
      canDeleteObligationInternalAuditResult ||
      canDeleteRiskControlledInternalAuditResult ||
      canDeleteRiskUncontrolledInternalAuditResult);

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteInternalAuditResults({
        variables: {
          Ids: selectedInternalAuditResults?.map((s) => s.originalResult.Id),
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
        GetInternalAuditReportDocumentAssessmentResultsByDocumentIdDocument,
        GetInternalAuditReportObligationAssessmentResultsByObligationIdDocument,
        GetInternalAuditReportRiskAssessmentResultsByRiskIdDocument,
        GetInternalAuditReportTestResultsByControlIdDocument,
      ],
    }
  );

  const navigate = useNavigate();

  const handleOpenRating = (id: string) => {
    navigate(id);
  };

  const results = [
    ...(data?.document_internal_audit_result || []),
    ...(data?.obligation_internal_audit_result || []),
    ...(data?.risk_controlled_internal_audit_result?.map((c) => ({
      ...c,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
    })) || []),
    ...(data?.risk_uncontrolled_internal_audit_result?.map((c) => ({
      ...c,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
    })) || []),
  ];

  const tableProps = useGetCollectionTableProps(results, handleOpenRating);

  const internalAuditReportResultCount = useMemo(() => {
    if (loading) {
      return '';
    }

    return `(${tableProps.allItems?.length})`;
  }, [loading, tableProps]);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  const title = stt('register_title');

  return (
    <PageLayout
      helpTranslationKey={'assessmentResults.registerHelp'}
      title={title}
      counter={internalAuditReportResultCount}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xxs'}>
          {canDeleteInternalAuditResult && (
            <Button
              formAction={'none'}
              variant={'normal'}
              disabled={!selectedInternalAuditResults.length}
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
        parentType={Parent_Type_Enum.InternalAuditReportResult}
        {...ribbonProps}
      />
      <Table
        {...tableProps}
        loading={loading}
        selectionType={canDeleteInternalAuditResult ? 'multi' : undefined}
        selectedItems={selectedInternalAuditResults}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedInternalAuditResults(detail.selectedItems);
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

export default InternalAuditReportResultsPage;
