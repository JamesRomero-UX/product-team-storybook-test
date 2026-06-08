import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { DeleteUserGroupsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import { PageLayout } from 'src/layouts';
import { useGetDetailPath } from 'src/routes/useGetDetailParentPath';

import { useGetUserGroupById } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';
import { settingsGroupsUrl } from '@/utils/urls';

import { useTabs } from './config';

type Props = {
  activeTabId: 'details' | 'members';
};

const Page: FC<Props> = ({ activeTabId }) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'userGroups' });
  const userGroupId = useGetGuidParam('groupId');
  const detailPath = useGetDetailPath(userGroupId);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();

  const { data, loading } = useGetUserGroupById({
    queryArgs: { id: userGroupId },
  });

  const [deleteUserGroups, deleteResult] = useMutation(
    DeleteUserGroupsDocument,
    {
      update: (cache) => {
        evictField(cache, 'user_group');
      },
    }
  );

  const userGroup = data?.user_group[0];
  const tabs = useTabs(userGroup, detailPath);

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteUserGroups({
        variables: {
          UserGroupIds: [userGroupId],
        },
      });
      setIsDeleteModalVisible(false);
      navigate(settingsGroupsUrl());

      return true;
    },
  });

  return (
    <PageLayout
      title={userGroup?.Name}
      meta={{
        title: 'User Group',
      }}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button
            variant={'normal'}
            formAction={'none'}
            onClick={() => {
              setIsDeleteModalVisible(true);
            }}
            disabled={
              (userGroup?.approvers_aggregate?.aggregate?.count || 0) > 0
            }
          >
            {t('delete')}
          </Button>
        </SpaceBetween>
      }
    >
      {loading ? (
        <Spinner />
      ) : (
        <ControlledTabs
          activeTabId={activeTabId}
          tabs={tabs}
          variant={'container'}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          setIsDeleteModalVisible(false);
        }}
      >
        {t('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
