import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import {
  DeleteAssessmentResultsDocument,
  GetAssessmentResultsByParentIdDocument,
  GetDocumentAssessmentResultsByParentIdDocument,
  GetObligationAssessmentResultsByObligationIdDocument,
  GetRiskAssessmentResultsByControlTypeDocument,
  GetRiskAssessmentResultsByRiskIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import CustomisableRibbon from 'src/components/customisable-ribbon/CustomisableRibbon';
import DeleteModal from 'src/components/delete-modal';
import ExportButton from 'src/components/export-button';
import { useGetAllAssessmentResults } from 'src/hooks/queries/assessment-result/useGetAllAssessmentResults';
import { useRibbonAndExport } from 'src/hooks/useRibbonAndExport';
import { PageLayout } from 'src/layouts';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import { useGetCollectionTableProps } from './config';
import type { AssessmentResultRegisterFields } from './types';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const AssessmentResultsPage: FC = () => {
  const { t: st } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });

  const { data, loading, refetch } = useGetAllAssessmentResults({
    queryArgs: {},
  });
  const [selectedAssessmentResults, setSelectedAssessmentResults] = useState<
    AssessmentResultRegisterFields[]
  >([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const {
    hasPermission: canDeleteDocumentAssessmentResult,
    loading: canDeleteDocumentLoading,
  } = useHasPermissionQuery('delete:document_assessment_result');
  const {
    hasPermission: canDeleteObligationAssessmentResult,
    loading: canDeleteObligationLoading,
  } = useHasPermissionQuery('delete:obligation_assessment_result');
  const {
    hasPermission: canDeleteRiskAssessmentResult,
    loading: canDeleteRiskLoading,
  } = useHasPermissionQuery('delete:risk_assessment_result');
  const isLoading =
    canDeleteDocumentLoading ||
    canDeleteObligationLoading ||
    canDeleteRiskLoading;
  const canDeleteAssessmentResult =
    !isLoading &&
    (canDeleteDocumentAssessmentResult ||
      canDeleteObligationAssessmentResult ||
      canDeleteRiskAssessmentResult);

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteAssessmentResults({
        variables: {
          Ids: selectedAssessmentResults?.map((s) => s.originalResult.Id),
        },
      });
      setSelectedAssessmentResults([]);
      setIsDeleteModalVisible(false);
      await refetch();

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
        evictField(cache, 'assessment');
        evictField(cache, 'obligation_assessment_result_aggregate');
        evictField(cache, 'document_assessment_result_aggregate');
        evictField(cache, 'risk_assessment_result_aggregate');
      },
      refetchQueries: [
        GetAssessmentResultsByParentIdDocument,
        GetDocumentAssessmentResultsByParentIdDocument,
        GetObligationAssessmentResultsByObligationIdDocument,
        GetRiskAssessmentResultsByControlTypeDocument,
        GetRiskAssessmentResultsByRiskIdDocument,
      ],
    }
  );

  const navigate = useNavigate();

  const handleOpenRating = (result: AssessmentResultRegisterFields) => {
    navigate(result.Id);
  };

  const tableProps = useGetCollectionTableProps(
    [
      ...(data?.document_assessment_result || []),
      ...(data?.obligation_assessment_result || []),
      ...(data?.risk_assessment_result || []),
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
          {canDeleteAssessmentResult && (
            <Button
              formAction={'none'}
              variant={'normal'}
              disabled={!selectedAssessmentResults.length}
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
        parentType={Parent_Type_Enum.AssessmentResult}
        {...ribbonProps}
      />
      <Table
        {...tableProps}
        loading={loading}
        selectionType={canDeleteAssessmentResult ? 'multi' : undefined}
        selectedItems={selectedAssessmentResults}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedAssessmentResults(detail.selectedItems);
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

export default AssessmentResultsPage;
