import { useApolloClient, useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import Table from '@risksmart-app/components/src/table';
import type { RelationFile } from '@risksmart-app/shared/forms/shared-schemas/fileSchema';
import {
  DeleteActionsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import ActionModal from 'src/pages/actions/ActionModal';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useInsertChildAction } from '@/hooks/mutations/action/useInsertChildAction';
import { useGetActionsByParentIdRegister } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import { useGetCollectionStatelessTableProps } from './config';
import type { ActionFields } from './types';
import type { ActionFormFieldData } from './update/forms/actionsSchema';

interface Props {
  parent: ObjectWithContributors;
}

const ActionsTab: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('actions.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'actions',
  });
  const apolloClient = useApolloClient();
  const { updateFiles } = useFileUpdate();
  const { hasPermission: canDeleteAction, loading: isLoadingDeleteAction } =
    useHasPermissionQuery('delete:action', parent);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedActions, setSelectedActions] = useState<ActionFields[]>([]);
  const { data, loading, refetch } = useGetActionsByParentIdRegister({
    queryArgs: { parentId: parent.Id },
  });
  const { insertChildAction } = useInsertChildAction();

  const saveAction = async (values: ActionFormFieldData) => {
    const { files } = values;
    const result = await insertChildAction({
      ...values,
      ParentId: parent.Id,
      CustomAttributeData: values.CustomAttributeData || undefined,
      DepartmentTypeIds:
        values.departments?.map((d) => d.DepartmentTypeId) || [],
      TagTypeIds: values.tags?.map((t) => t.TagTypeId) || [],
      ...ownerAndContributorIds(values),
    });
    const actionId = result?.insertChildAction?.Id;
    if (!actionId) {
      throw new Error('Missing actionId');
    }
    await updateFiles({
      parentType: Parent_Type_Enum.Action,
      parentId: actionId,
      originalFiles: values?.files.filter(
        (f) => !(f instanceof File)
      ) as RelationFile[],
      selectedFiles: files,
    });
    evictField(apolloClient.cache, 'action');
    evictField(apolloClient.cache, 'action_aggregate');
    evictField(apolloClient.cache, 'internal_audit_entity');
    refetch();
  };

  const [deleteActions, deleteResult] = useMutation(DeleteActionsDocument, {
    update: (cache) => {
      evictField(cache, 'action');
      evictField(cache, 'action_aggregate');
      refetch();
    },
  });

  const handleActionOpen = () => {
    setIsEditOpen(true);
  };

  const handleActionCreateClose = () => {
    setIsEditOpen(false);
  };

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteActions({
        variables: {
          Ids: selectedActions.map((s) => s.Id),
        },
      });
      setSelectedActions([]);
      setIsDeleteModalVisible(false);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const tableProps = useGetCollectionStatelessTableProps(data?.action);

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          !isLoadingDeleteAction && canDeleteAction ? 'multi' : undefined
        }
        selectedItems={selectedActions}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedActions(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:action'}
                    parentObject={parent}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedActions.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:action'}
                    parentObject={parent}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleActionOpen}
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
      {isEditOpen && (
        <ActionModal
          onSaving={saveAction}
          onDismiss={handleActionCreateClose}
        />
      )}
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

export default ActionsTab;
