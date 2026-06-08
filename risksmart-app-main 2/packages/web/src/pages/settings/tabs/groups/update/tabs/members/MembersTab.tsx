import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import type { GetUserGroupByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteUserGroupUsersDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import TabHeader from 'src/components/tab-header';
import { useGetUsersByGroupId } from 'src/hooks/queries';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import AddMembersModal from './AddMembersModal';
import type { GroupMembersTableFields } from './config';
import { useGetCollectionTableProps } from './config';

type Props = {
  userGroup: GetUserGroupByIdQuery['user_group'][number];
};

const Tab: FC<Props> = ({ userGroup }) => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'userGroupMembers',
  });
  const { t } = useTranslation(['common']);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<GroupMembersTableFields[]>(
    []
  );

  const [deleteUserGroupUsers, deleteResult] = useMutation(
    DeleteUserGroupUsersDocument,
    {
      update: (cache) => {
        evictField(cache, 'user_group_user');
      },
    }
  );

  const { data, loading, refetch } = useGetUsersByGroupId({
    queryArgs: { groupId: userGroup.Id },
  });

  const tableProps = useGetCollectionTableProps(
    data?.user_group[0]?.users ?? []
  );

  const existingUserIds =
    data?.user_group[0]?.users
      .filter((u) => u.authUsers)
      .map((u) => u.authUsers.Id) ?? [];

  const handleAddGroupModalOpen = () => {
    setIsAddModalOpen(true);
  };

  const handleAddGroupModalClose = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteUserGroupUsers({
        variables: {
          UserIds: selectedUsers.map((s) => s.Id),
          UserGroupId: userGroup.Id,
        },
      });
      setSelectedUsers([]);
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
                    disabled={!selectedUsers.length}
                    onClick={() => setIsDeleteModalVisible(true)}
                  >
                    {st('remove_button')}
                  </Button>
                  <Button
                    variant={'primary'}
                    formAction={'none'}
                    onClick={handleAddGroupModalOpen}
                  >
                    {st('add_button')}
                  </Button>
                </SpaceBetween>
              }
            >
              {st('membersTableTitle')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        selectionType={'multi'}
        selectedItems={selectedUsers}
        onSelectionChange={({ detail }) => {
          setSelectedUsers(detail.selectedItems);
        }}
        trackBy={'Id'}
      />
      {isAddModalOpen && (
        <AddMembersModal
          onDismiss={handleAddGroupModalClose}
          userGroupId={userGroup.Id}
          existingUserIds={existingUserIds}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('remove')}
        onDelete={onDelete}
        onDismiss={() => {
          refetch();
          setSelectedUsers([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirm_remove_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
