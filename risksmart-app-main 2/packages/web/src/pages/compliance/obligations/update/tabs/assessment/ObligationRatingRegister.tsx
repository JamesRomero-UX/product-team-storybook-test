import { useMutation, useQuery } from '@apollo/client';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  DeleteAssessmentResultsDocument,
  GetObligationAssessmentResultsByObligationIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import AssessmentResultModal from 'src/pages/assessments/modals/AssessmentResultModal';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { getCounter } from '@/utils/collectionUtils';
import { evictField } from '@/utils/graphqlUtils';

import { useGetCollectionTableProps } from './obligationRatingConfig';
import type { ObligationAssessmentResultRegisterFields } from './types';

interface Props {
  parent: ObjectWithContributors;
}

const ObligationRatingRegister: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('obligationsAssessments.tabHelp');
  const { t } = useTranslation(['common']);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { addNotification } = useNotifications();

  const [selectedAssessmentResults, setSelectedAssessmentResults] = useState<
    ObligationAssessmentResultRegisterFields[]
  >([]);

  const [openAssessmentResultId, setOpenAssessmentResultId] = useState<
    string | undefined
  >();

  const {
    hasPermission: userCanDeleteAssessmentResults,
    loading: userCanDeleteAssessmentResultsLoading,
  } = useHasPermissionQuery('delete:obligation_assessment_result', parent);

  const [deleteAssessmentResults, deleteResult] = useMutation(
    DeleteAssessmentResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_assessment_result');
        evictField(cache, 'assessment');
        evictField(cache, 'obligation_assessment_result_aggregate');
      },
    }
  );

  const { data, loading, refetch } = useQuery(
    GetObligationAssessmentResultsByObligationIdDocument,
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

  const onAddRating = () => {
    setIsEditOpen(true);
  };

  const onOpenResult = (id: string) => {
    setOpenAssessmentResultId(id);
    setIsEditOpen(true);
  };

  const onDelete = useDeleteResultNotification({
    entityName: t('obligationsAssessments.entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteAssessmentResults({
        variables: {
          Ids: selectedAssessmentResults.map((assessment) => assessment.Id),
        },
      });
      setSelectedAssessmentResults([]);
      setIsDeleteModalVisible(false);

      return true;
    },
  });
  const tableProps = useGetCollectionTableProps(
    parent,
    data?.obligation_assessment_result,
    onOpenResult,
    onAddRating
  );

  return (
    <>
      <SpaceBetween size={'m'}>
        <TabHeader
          actions={
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Permission
                permission={'delete:obligation_assessment_result'}
                parentObject={parent}
              >
                <Button
                  formAction={'none'}
                  variant={'normal'}
                  disabled={
                    userCanDeleteAssessmentResultsLoading ||
                    !selectedAssessmentResults.length ||
                    !userCanDeleteAssessmentResults
                  }
                  onClick={() => setIsDeleteModalVisible(true)}
                >
                  {t('obligationsAssessments.delete_button')}
                </Button>
              </Permission>
              <Permission
                permission={'insert:obligation_assessment_result'}
                parentObject={parent}
              >
                <Button
                  iconName={'add-plus'}
                  variant={'primary'}
                  formAction={'none'}
                  onClick={onAddRating}
                >
                  {t('obligationsAssessments.add_rating_button')}
                </Button>
              </Permission>
            </SpaceBetween>
          }
        >
          {t('obligationsAssessments.tab_title')}
        </TabHeader>
      </SpaceBetween>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>
              {t('obligationsAssessments.obligationRatingSubheading')}
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
          selectionType={'multi'}
          selectedItems={selectedAssessmentResults}
          trackBy={'Id'}
          onSelectionChange={({ detail }) => {
            setSelectedAssessmentResults(detail.selectedItems);
          }}
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
          assessmentMode={'rating'}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('assessmentResults.delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => {
          refetch();
          setOpenAssessmentResultId(undefined);
          setSelectedAssessmentResults([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {t('assessmentResults.confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default ObligationRatingRegister;
