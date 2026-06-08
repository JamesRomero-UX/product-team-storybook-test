import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import type { GetActionByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import ActionUpdateModal from 'src/pages/action-updates/ActionUpdateModal';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteActionUpdate } from '@/hooks/mutations/action-update';
import { useGetActionUpdatesByParentActionId } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';

import type { ActionUpdateTableFields } from './config';
import { useGetCollectionTableProps } from './config';

interface Props {
  action: GetActionByIdQuery['action'][number];
}
const Tab: FC<Props> = ({ action }) => {
  useI18NSummaryHelpContent('actionUpdates.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'actionUpdates',
  });
  const {
    hasPermission: canDeleteActionUpdate,
    loading: isLoadingDeleteActionUpdate,
  } = useHasPermissionQuery('delete:action_update', action);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const actionId = useGetGuidParam('actionId');

  const [selectedActionUpdates, setSelectedActionUpdates] = useState<
    ActionUpdateTableFields[]
  >([]);

  const { deleteActionUpdates, loading: deleteLoading } =
    useDeleteActionUpdate();

  const [actionUpdateId, setActionUpdateId] = useState<string | undefined>();

  const { data, loading, refetch } = useGetActionUpdatesByParentActionId({
    queryArgs: { parentActionId: actionId },
  });

  const handleActionUpdateModalOpen = () => {
    setIsEditOpen(true);
  };

  const handleActionUpdateModalClose = () => {
    setActionUpdateId(undefined);
    setIsEditOpen(false);
    refetch();
  };

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteActionUpdates(selectedActionUpdates.map((s) => s.Id));
      setSelectedActionUpdates([]);
      setIsDeleteModalVisible(false);
      refetch();

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const labelledFields = useMemo<ActionUpdateTableFields[]>(() => {
    return (
      data?.action_update.map((r) => ({
        ...r,
        CreatedByUserName: r.createdByUser?.FriendlyName ?? null,
      })) || []
    );
  }, [data?.action_update]);

  const tableProps = useGetCollectionTableProps(
    labelledFields,
    (actionUpdate) => {
      setActionUpdateId(actionUpdate.Id);
      setIsEditOpen(true);
    },
    handleActionUpdateModalOpen,
    action
  );

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          !isLoadingDeleteActionUpdate && canDeleteActionUpdate
            ? 'multi'
            : undefined
        }
        selectedItems={selectedActionUpdates}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedActionUpdates(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:action_update'}
                    parentObject={action}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedActionUpdates.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:action_update'}
                    parentObject={action}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleActionUpdateModalOpen}
                    >
                      {st('add_button')}
                    </Button>{' '}
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
        loadingText={st('loading_message') ?? ''}
        sortingDisabled={false}
      />
      {isEditOpen && (
        <ActionUpdateModal
          actionUpdateId={actionUpdateId}
          action={action}
          onDismiss={handleActionUpdateModalClose}
        />
      )}
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          setSelectedActionUpdates([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
