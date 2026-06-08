import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useDeleteControlGroup } from 'src/hooks/mutations';
import {
  useGetControlGroupById,
  useGetControlGroupsRegister,
} from 'src/hooks/queries';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import { useGetDetailPath } from 'src/routes/useGetDetailParentPath';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';

type Props = {
  activeTabId: 'controls' | 'details' | 'linkedItems' | 'notificationHistory';
};

const Page: FC<Props> = ({ activeTabId }) => {
  const controlGroupId = useGetGuidParam('controlGroupId');
  const navigate = useNavigate();
  const detailsPath = useGetDetailPath(controlGroupId);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'controlGroups',
  });
  const defaultTitle = st('fallback_title', 'Control Group');

  const { data, error } = useGetControlGroupById({
    queryArgs: { controlGroupId },
  });
  const { refetch } = useGetControlGroupsRegister({ queryArgs: {} });

  if (error) {
    throw error;
  }
  const controlGroup = data?.control_group?.[0];

  const { deleteControlGroup, loading } = useDeleteControlGroup();

  const onDelete = useDeleteResultNotification({
    asyncAction: async () => {
      if (!controlGroup) {
        throw new Error('Missing control group');
      }
      await deleteControlGroup(
        controlGroup.Id,
        controlGroup.ModifiedAtTimestamp
      );

      await refetch();
      navigate(`/control-groups`);

      return true;
    },
    entityName: st('entity_name', 'control group'),
  });

  if (data?.control_group.length === 0) {
    throw new PageNotFound(`Control group with id ${controlGroupId} not found`);
  }
  const tabs = useTabs({
    parentType: Parent_Type_Enum.ControlGroup,
    parent: controlGroup,
    hrefRoot: detailsPath,
  });

  return (
    <PageLayout
      title={controlGroup?.Title}
      meta={{
        title: defaultTitle,
      }}
      actions={
        <Permission permission={'delete:control_group'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setIsDeleteModalVisible(true);
              }}
            >
              {st('delete_button', 'Delete')}
            </Button>
          </SpaceBetween>
        </Permission>
      }
    >
      <ControlledTabs
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.ControlGroup}
        parent={controlGroup}
      />
      <DeleteModal
        loading={loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message', 'Are you sure you want to delete?')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
