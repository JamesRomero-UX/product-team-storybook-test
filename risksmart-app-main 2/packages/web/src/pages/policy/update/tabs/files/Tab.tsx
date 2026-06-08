import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import { DeleteDocumentFilesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import TabHeader from 'src/components/tab-header';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useGetDocumentFilesByDocumentId } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import type { DocumentFileTableFields } from './config';
import { useGetCollectionTableProps } from './config';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  const documentId = useGetGuidParam('documentId');
  const { getLabel: getStatusLabel } = useRating('document_file_status');
  const { getLabel: getTypeLabel } = useRating('document_file_type');
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'documentFiles',
  });

  const {
    hasPermission: canDeleteDocumentFile,
    loading: canDeleteDocumentFileLoading,
  } = useHasPermissionQuery('delete:document_file', parent);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<DocumentFileTableFields[]>(
    []
  );

  const { data, loading, refetch } = useGetDocumentFilesByDocumentId({
    queryArgs: { documentId },
  });

  const [deleteDocumentFiles, deleteResult] = useMutation(
    DeleteDocumentFilesDocument,
    {
      update: (cache) => {
        evictField(cache, 'document_file');
      },
    }
  );

  const handleEditFile = (item: DocumentFileTableFields) => {
    navigate(`update/${item.id}`);
  };

  const handleFileOpen = () => {
    navigate('create');
  };

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteDocumentFiles({
        variables: {
          documentFileIds: selectedFiles.map((s) => s.id),
        },
      });
      setSelectedFiles([]);
      setIsDeleteModalVisible(false);
      await refetch();

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const labelledFields = useMemo<DocumentFileTableFields[]>(() => {
    return (
      data?.document_file.map((a) => ({
        fileName: a.file?.FileName ?? null,
        version: a.Version,
        type: getTypeLabel(a.Type),
        status: getStatusLabel(a.Status),
        statusValue: a.Status,
        reviewDate: a.ReviewDate,
        reviewedBy: a.reviewedBy?.FriendlyName ?? '-',
        reviewDue: a.NextReviewDate,
        createdAtTimestamp: a.CreatedAtTimestamp,
        id: a.Id,
        changeRequests: a.changeRequests,
      })) || []
    );
  }, [data?.document_file, getStatusLabel, getTypeLabel]);

  const tableProps = useGetCollectionTableProps(
    labelledFields,
    handleEditFile,
    handleFileOpen,
    parent
  );

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          canDeleteDocumentFile && !canDeleteDocumentFileLoading
            ? 'multi'
            : undefined
        }
        selectedItems={selectedFiles}
        trackBy={'id'}
        onSelectionChange={({ detail }) => {
          setSelectedFiles(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:document_file'}
                    parentObject={parent}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedFiles.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:document_file'}
                    parentObject={parent}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      iconName={'upload'}
                      onClick={handleFileOpen}
                    >
                      {st('add_button')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {st('tab_title')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        loadingText={st('loading_message')}
        sortingDisabled={false}
      />
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
