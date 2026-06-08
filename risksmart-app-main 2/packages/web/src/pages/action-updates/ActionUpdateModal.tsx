import { useMutation } from '@apollo/client';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { GetActionByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Parent_Type_Enum,
  UpdateActionUpdateDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import type { ActionUpdatesFields } from 'src/schemas/actionUpdates';
import { ActionUpdatesSchema, defaultValues } from 'src/schemas/actionUpdates';

import { useInsertActionUpdate } from '@/hooks/mutations';
import { useGetActionUpdateById } from '@/hooks/queries';

import ActionUpdateForm from './forms/ActionUpdateForm';

type Props = {
  onDismiss: () => void;
  actionUpdateId?: string;
  action: GetActionByIdQuery['action'][number];
};

const ActionUpdateModal: FC<Props> = ({
  onDismiss,
  actionUpdateId,
  action,
}) => {
  const { t } = useTranslation('common');
  const { updateFiles } = useFileUpdate();
  const actionId = useGetGuidParam('actionId');

  const { data, loading, error } = useGetActionUpdateById({
    queryArgs: { id: actionUpdateId! },
    shouldSkip: !actionUpdateId,
  });
  if (error) {
    throw error;
  }

  const actionUpdate = data?.action_update[0];
  const {
    hasPermission: canEditActionUpdate,
    loading: isLoadingEditActionUpdate,
  } = useHasPermissionQuery('update:action_update', action);
  const {
    hasPermission: canCreateActionUpdate,
    loading: isLoadingCreateActionUpdate,
  } = useHasPermissionQuery('insert:action_update', action);
  const isLoading = isLoadingEditActionUpdate || isLoadingCreateActionUpdate;

  const canModify = !isLoading
    ? actionUpdate
      ? canEditActionUpdate
      : canCreateActionUpdate
    : false;
  const { insertActionUpdate } = useInsertActionUpdate();
  const [updateActionUpdate] = useMutation(UpdateActionUpdateDocument);

  const values = actionUpdate
    ? {
        ...actionUpdate,
        files: actionUpdate?.files.map((rf) => rf.file),
      }
    : undefined;

  const onSave = async (data: ActionUpdatesFields) => {
    const { files, ...rest } = data;
    if (actionUpdate) {
      await updateActionUpdate({
        variables: {
          ...rest,
          CustomAttributeData: rest.CustomAttributeData,
          Id: actionUpdate.Id,
          OriginalTimestamp: actionUpdate.ModifiedAtTimestamp,
        },
      });
    } else {
      const result = await insertActionUpdate({
        ...rest,
        CustomAttributeData: rest.CustomAttributeData,
      });
      actionUpdateId = result.insert_action_update_one?.Id;
    }
    if (!actionUpdateId) {
      throw new Error('Missing action update id');
    }

    await updateFiles({
      parentType: Parent_Type_Enum.ActionUpdate,
      parentId: actionUpdateId,
      originalFiles: values?.files,
      selectedFiles: files,
    });
  };

  if (loading) {
    return null;
  }

  return (
    <ModalForm<ActionUpdatesFields>
      values={values as ActionUpdatesFields}
      defaultValues={{
        ...defaultValues,
        ParentActionId: actionId,
      }}
      i18n={t('actionUpdates')}
      schema={ActionUpdatesSchema}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={'action-update-form'}
      visible={true}
      readOnly={!canModify}
      parentType={Parent_Type_Enum.ActionUpdate}
    >
      <ActionUpdateForm readOnly={!canModify} />
    </ModalForm>
  );
};

export default ActionUpdateModal;
