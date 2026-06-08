import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import { DeleteUserGroupsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';

import { useGetUserGroupsWithApprovers } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import AddGroupModal from './AddGroupModal';
import type { GroupsTableFields } from './config';
import { useGetCollectionTableProps } from './config';

const GroupsTab: FC = () => {
  useI18NSummaryHelpContent('userGroups.help');
  const { t } = useTranslation(['common'], { keyPrefix: 'userGroups' });
  const { t: st } = useTranslation(['common']);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedUserGroups, setSelectedUserGroups] = useState<
    GroupsTableFields[]
  >([]);

  const { data, loading, refetch } = useGetUserGroupsWithApprovers({
    queryArgs: {},
  });

  const tableProps = useGetCollectionTableProps(data?.user_group ?? []);

  const selectedGroupsWithApprovals = useMemo(
    () =>
      selectedUserGroups.filter(
        (group) =>
          group.approvers_aggregate?.aggregate?.count &&
          group.approvers_aggregate?.aggregate?.count > 0
      ) ?? [],
    [selectedUserGroups]
  );

  const [deleteUserGroups, deleteResult] = useMutation(
    DeleteUserGroupsDocument,
    {
      update: (cache) => {
        evictField(cache, 'user_group');
      },
    }
  );

  const handleAddGroupModalOpen = () => {
    setIsAddModalOpen(true);
  };

  const handleAddGroupModalClose = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteUserGroups({
        variables: {
          UserGroupIds: selectedUserGroups.map((s) => s.Id),
        },
      });
      setSelectedUserGroups([]);
      setIsDeleteModalVisible(false);
      refetch();

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
                    disabled={!selectedUserGroups.length}
                    onClick={() => setIsDeleteModalVisible(true)}
                  >
                    {t('delete')}
                  </Button>
                  <Button
                    variant={'primary'}
                    formAction={'none'}
                    onClick={handleAddGroupModalOpen}
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
              {t('groupsTableTitle')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        selectionType={'multi'}
        selectedItems={selectedUserGroups}
        onSelectionChange={({ detail }) => {
          setSelectedUserGroups(detail.selectedItems);
        }}
        trackBy={'Id'}
      />
      {isAddModalOpen && <AddGroupModal onDismiss={handleAddGroupModalClose} />}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          refetch();
          setSelectedUserGroups([]);
          setIsDeleteModalVisible(false);
        }}
        disabled={selectedGroupsWithApprovals.length > 0}
        size={selectedGroupsWithApprovals.length > 0 ? 'medium' : 'small'}
      >
        {selectedGroupsWithApprovals.length > 0 ? (
          <>
            <p>{t('cannot_delete_message')}</p>
            <ul>
              {selectedGroupsWithApprovals?.map((group) => (
                <li key={group.Id} className={'font-bold'}>
                  {group.Name}
                </li>
              ))}
            </ul>
          </>
        ) : (
          t('confirm_delete_message')
        )}
      </DeleteModal>
    </>
  );
};

export default GroupsTab;
