import { useMutation } from '@apollo/client';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import {
  DeleteAssessmentResultsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import TabHeader from 'src/components/tab-header';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useGetDocumentAssessmentResultsByParentId } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { getCounter } from '@/utils/collectionUtils';
import { evictField } from '@/utils/graphqlUtils';

import AssessmentResultModal from '../../../../assessments/modals/AssessmentResultModal';
import { useGetCollectionTableProps } from './documentRatingConfig';
import type { DocumentAssessmentResultRegisterFields } from './types';

interface Props {
  parent: ObjectWithContributors;
}

const DocumentRatingRegister: FC<Props> = ({ parent }) => {
  const { t: st } = useTranslation(['common']);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedAssessmentResults, setSelectedAssessmentResults] = useState<
    DocumentAssessmentResultRegisterFields[]
  >([]);

  const [openAssessmentResultId, setOpenAssessmentResultId] = useState<
    string | undefined
  >();

  const {
    hasPermission: userCanDeleteAssessmentResults,
    loading: userCanDeleteAssessmentResultsLoading,
  } = useHasPermissionQuery('delete:document_assessment_result', parent);

  const [deleteAssessmentResults, deleteResult] = useMutation(
    DeleteAssessmentResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'document_assessment_result');
        evictField(cache, 'assessment');
        evictField(cache, 'document_assessment_result_aggregate');
      },
    }
  );

  const { data, loading, refetch } = useGetDocumentAssessmentResultsByParentId({
    queryArgs: { parentId: parent.Id },
  });

  const handleAssessmentResultModalClose = (saved?: boolean) => {
    if (saved) {
      refetch();
    }
    setOpenAssessmentResultId(undefined);
    setIsEditOpen(false);
  };

  const onAddRating = () => {
    setIsEditOpen(true);
  };

  const onOpenResult = (id?: string) => {
    setOpenAssessmentResultId(id);
    setIsEditOpen(true);
  };

  const onDelete = useDeleteResultNotification({
    entityName: st('documentAssessments.entity_name'),
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
      refetch();

      return true;
    },
  });

  const tableProps = useGetCollectionTableProps(
    parent,
    data?.document_assessment_result,
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
                permission={'delete:document_assessment_result'}
                parentObject={parent}
              >
                <Button
                  formAction={'none'}
                  variant={'normal'}
                  disabled={
                    !selectedAssessmentResults.length ||
                    !userCanDeleteAssessmentResults ||
                    userCanDeleteAssessmentResultsLoading
                  }
                  onClick={() => setIsDeleteModalVisible(true)}
                >
                  {st('documentAssessments.delete_button')}
                </Button>
              </Permission>
              <Permission
                permission={'insert:document_assessment_result'}
                parentObject={parent}
              >
                <Button
                  iconName={'add-plus'}
                  variant={'primary'}
                  formAction={'none'}
                  onClick={onAddRating}
                >
                  {st('documentAssessments.add_rating_button')}
                </Button>
              </Permission>
            </SpaceBetween>
          }
        >
          {st('documentAssessments.tab_title')}
        </TabHeader>
      </SpaceBetween>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>{st('documentAssessments.documentRatingSubheading')}</span>
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
          data-testid={'document-rating-table'}
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
          assessmentMode={'rating'}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={st('assessmentResults.delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => {
          setOpenAssessmentResultId(undefined);
          setSelectedAssessmentResults([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('assessmentResults.confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default DocumentRatingRegister;
