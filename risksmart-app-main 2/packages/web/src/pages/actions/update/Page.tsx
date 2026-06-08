import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteActionsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import {
  useGetDetailParentPath,
  useGetDetailPath,
} from 'src/routes/useGetDetailParentPath';

import { useGetActionById } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';

import useExporter from './useExporter';

type Props = {
  activeTabId: 'details' | 'linkedItems' | 'notificationHistory' | 'updates';
  showDeleteButton?: boolean;
};

const Page: FC<Props> = ({ activeTabId, showDeleteButton }) => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'actions' });
  const { t } = useTranslation(['common']);
  const defaultTitle = st('fallback_title');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();
  const actionId = useGetGuidParam('actionId');
  const [exportItem, { loading: exporting }] = useExporter(actionId);
  const parentPath = useGetDetailParentPath(actionId);
  const detailsPath = useGetDetailPath(actionId);

  const { data, error } = useGetActionById({ queryArgs: { id: actionId } });
  if (error) {
    throw error;
  }

  const [deleteActions, deleteResult] = useMutation(DeleteActionsDocument, {
    update: (cache) => {
      evictField(cache, 'action');
      evictField(cache, 'action_aggregate');
    },
  });

  const action = data?.action?.[0];
  const tabs = useTabs({
    parentType: Parent_Type_Enum.Action,
    parent: action,
    hrefRoot: detailsPath,
  });

  if (data?.action.length === 0) {
    throw new PageNotFound(`Action with id ${actionId} not found`);
  }

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      if (!action) {
        return false;
      }
      await deleteActions({
        variables: { Ids: [action.Id] },
      });
      navigate(parentPath);

      return true;
    },
  });

  const title = action?.Title || defaultTitle;
  const counter =
    action &&
    `(${getFriendlyId(Parent_Type_Enum.Action, action.SequentialId)})`;

  return (
    <PageLayout
      title={title}
      meta={{
        title: defaultTitle,
      }}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button
            iconName={'download'}
            disabled={exporting}
            onClick={exportItem}
          >
            {t('export.export')}
          </Button>
          {showDeleteButton && (
            <Permission permission={'delete:action'} parentObject={action}>
              <Button
                variant={'normal'}
                formAction={'none'}
                onClick={() => {
                  setIsDeleteModalVisible(true);
                }}
              >
                {st('delete_button')}
              </Button>
            </Permission>
          )}
        </SpaceBetween>
      }
    >
      <ControlledTabs
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Action}
        parent={action}
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
    </PageLayout>
  );
};

export default Page;
