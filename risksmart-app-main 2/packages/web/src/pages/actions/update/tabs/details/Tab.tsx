import { useMutation } from '@apollo/client';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { hasFileChanges } from '@risksmart-app/components/src/file/fileUtils';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  Parent_Type_Enum,
  UpdateActionDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useGetActionById } from '@/hooks/queries';
import { evictField } from '@/utils/graphqlUtils';

import ActionForm from '../../forms/ActionForm';
import type { ActionFormFieldData } from '../../forms/actionsSchema';
import { defaultValues } from '../../forms/actionsSchema';

const Tab: FC = () => {
  useI18NSummaryHelpContent('actions.help');
  const { updateFiles } = useFileUpdate();
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const actionId = useGetGuidParam('actionId');
  const { data, error } = useGetActionById({ queryArgs: { id: actionId } });
  if (error) {
    throw error;
  }

  if (data?.action.length === 0) {
    throw new PageNotFound(`Action with id ${actionId} not found`);
  }
  const action = data?.action[0];
  const { hasPermission: canEditAction, loading: isLoadingEditAction } =
    useHasPermissionQuery('update:action', action);
  const values = {
    ...defaultValues,
    ...action,
    files: action?.files.map((rf) => rf.file),
    Owners: getOwners(action),
    Contributors: getContributors(action),
    ancestorContributors: action?.ancestorContributors ?? [],
  };
  const [updateAction] = useMutation(UpdateActionDocument, {
    update: (cache) => {
      evictField(cache, 'action');
      evictField(cache, 'action_aggregate');
      evictField(cache, 'control');
    },
  });

  const onDismiss = () => {
    navigate(-1);
  };

  const onSave = async (
    data: ActionFormFieldData,
    confirmChangeRequest?: boolean
  ) => {
    const { files } = data;

    if (!action) {
      throw new Error('action missing');
    }

    await updateAction({
      variables: {
        ...data,
        Priority: data.Priority,
        OriginalTimestamp: action.ModifiedAtTimestamp,
        Id: action.Id,
        CustomAttributeData: data.CustomAttributeData || undefined,
        DepartmentTypeIds:
          data.departments?.map((d) => d.DepartmentTypeId) || [],
        TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
        ...ownerAndContributorIds(data),
      },
      context: {
        headers: {
          'x-confirm-change-request': confirmChangeRequest ? 'true' : 'false',
          'x-has-file-changes': hasFileChanges(
            values?.files?.map((file) => ({ Id: file?.Id })),
            files
          )
            ? 'true'
            : 'false',
        },
      },
    });
    await updateFiles({
      parentType: Parent_Type_Enum.Action,
      parentId: action?.Id,
      originalFiles: values?.files,
      selectedFiles: files,
    });
  };

  return (
    <ActionForm
      values={values as ActionFormFieldData}
      onDismiss={onDismiss}
      onSave={onSave}
      readOnly={isLoadingEditAction || !canEditAction}
      header={t('details')}
      approvalConfig={{ object: { Id: actionId } }}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default Tab;
