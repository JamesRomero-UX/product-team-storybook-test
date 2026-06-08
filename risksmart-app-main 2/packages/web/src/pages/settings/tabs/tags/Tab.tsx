import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import { DeleteTagTypesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';

import { useGetTags } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import type { TagsTableFields } from './config';
import { useGetCollectionTableProps } from './config';
import TagTypeModal from './TagTypeModal';

const TagsTab: FC = () => {
  useI18NSummaryHelpContent('tags.help');
  const { t } = useTranslation(['common'], { keyPrefix: 'tags' });
  const { t: st } = useTranslation(['common']);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedTagTypes, setSelectedTagTypes] = useState<TagsTableFields[]>(
    []
  );
  const [selectedTagTypeId, setSelectedTagTypeId] = useState<
    string | undefined
  >(undefined);

  const { data, loading, refetch } = useGetTags({ queryArgs: {} });

  const tableProps = useGetCollectionTableProps(
    data?.tag_type ?? [],
    (tagType) => {
      setSelectedTagTypeId(tagType.TagTypeId);
      setIsEditOpen(true);
    }
  );

  const [deleteTagTypes, deleteResult] = useMutation(DeleteTagTypesDocument, {
    update: (cache) => {
      evictField(cache, 'tag_type');
    },
  });

  const handleTagTypeModalOpen = () => {
    setIsEditOpen(true);
  };

  const handleTagTypeModalClose = async (saved: boolean) => {
    setSelectedTagTypeId(undefined);
    setIsEditOpen(false);
    if (saved) {
      await refetch();
    }
  };

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteTagTypes({
        variables: {
          Ids: selectedTagTypes.map((s) => s.TagTypeId),
        },
      });
      setSelectedTagTypes([]);
      setIsDeleteModalVisible(false);
      await refetch();

      return true;
    },
  });

  return (
    <>
      <Table
        {...tableProps}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    formAction={'none'}
                    variant={'normal'}
                    disabled={!selectedTagTypes.length}
                    onClick={() => setIsDeleteModalVisible(true)}
                  >
                    {t('delete')}
                  </Button>
                  <Button
                    variant={'primary'}
                    formAction={'none'}
                    onClick={handleTagTypeModalOpen}
                  >
                    {t('add_button')}
                  </Button>
                  <Button
                    iconName={'download'}
                    onClick={tableProps.exportToCsv}
                  >
                    {st('export.export')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('tagsTableTitle')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        selectionType={'multi'}
        selectedItems={selectedTagTypes}
        onSelectionChange={({ detail }) => {
          setSelectedTagTypes(detail.selectedItems);
        }}
        trackBy={'TagTypeId'}
      />
      {isEditOpen && (
        <TagTypeModal
          id={selectedTagTypeId}
          onDismiss={handleTagTypeModalClose}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          setSelectedTagTypeId(undefined);
          setSelectedTagTypes([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {t('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default TagsTab;
