import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteCustomRoleDocument,
  GetCustomRoleByIdDocument,
  GetDefaultRolesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import { PageLayout } from 'src/layouts';
import { useGetDetailPath } from 'src/routes/useGetDetailParentPath';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';
import { settingsCustomRolesUrl } from '@/utils/urls';

import { useTabs } from './config';

type Props = {
  activeTabId: 'details';
};

const Page: FC<Props> = ({ activeTabId }) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation(['common'], { keyPrefix: 'customRoles' });
  const customRoleId = useGetGuidParam('customRoleId');
  const detailPath = useGetDetailPath(customRoleId);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();
  const { data: getRolesResponse, loading: loadingRoles } = useQuery(
    GetDefaultRolesDocument,
    {}
  );
  const { data, loading } = useQuery(GetCustomRoleByIdDocument, {
    variables: {
      Id: customRoleId,
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
    fetchPolicy: 'no-cache',
  });

  const [deleteCustomRole, deleteResult] = useMutation(
    DeleteCustomRoleDocument,
    {
      update: (cache) => {
        evictField(cache, 'custom_role');
      },
    }
  );

  const customRole = data?.custom_role[0];
  const tabs = useTabs(
    customRole,
    getRolesResponse?.auth_role_type
      ?.filter((c) => c.resourceTypes.length > 0)
      .map((role) => ({
        roleKey: role.RoleKey,
        name: role.Name,
        groupKey: role.resourceTypes[0].resourceType.ResourceType,
        category: role.Category === 'Manager' ? 'Manager' : 'Viewer',
      })) || [],
    detailPath
  );

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteCustomRole({
        variables: {
          filter: {
            Id: { _eq: customRoleId },
          },
        },
      });
      setIsDeleteModalVisible(false);
      navigate(settingsCustomRolesUrl());

      return true;
    },
  });

  return (
    <PageLayout
      title={customRole?.RoleName}
      meta={{
        title: t('tab_title'),
      }}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button
            variant={'normal'}
            formAction={'none'}
            onClick={() => {
              setIsDeleteModalVisible(true);
            }}
          >
            {t('delete_button')}
          </Button>
        </SpaceBetween>
      }
    >
      {loading || loadingRoles ? (
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
        header={t('delete_button')}
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
