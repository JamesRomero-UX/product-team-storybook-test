import { useMutation } from '@apollo/client';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  Parent_Type_Enum,
  UpdateIssueUpdateDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { useGetIssueUpdateById } from 'src/hooks/queries/issue-update/useGetIssueUpdateById';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import type { IssueUpdatesFields } from 'src/schemas/issueUpdates';
import { defaultValues, IssueUpdatesSchema } from 'src/schemas/issueUpdates';

import { useInsertIssueUpdate } from '@/hooks/mutations/issue-update';
import { evictField } from '@/utils/graphqlUtils';

import IssueUpdateForm from './forms/IssueUpdateForm';

type Props = {
  onDismiss: () => void;
  issueUpdateId?: string;
  parent: ObjectWithContributors;
};

const IssueUpdateModal: FC<Props> = ({ onDismiss, issueUpdateId, parent }) => {
  const issueId = useGetGuidParam('issueId');

  const { updateFiles } = useFileUpdate();
  const { insertIssueUpdate } = useInsertIssueUpdate();

  const {
    hasPermission: canCreateIssueUpdate,
    loading: canCreateIssueUpdateLoading,
  } = useHasPermissionQuery('insert:issue_update', parent);
  const {
    hasPermission: canEditIssueUpdate,
    loading: canEditIssueUpdateLoading,
  } = useHasPermissionQuery('update:issue_update', parent);
  const [updateIssueUpdate] = useMutation(UpdateIssueUpdateDocument, {
    update: (cache) => evictField(cache, 'issue_update'),
  });
  const { t } = useTranslation('common');
  const { data, loading } = useGetIssueUpdateById({
    queryArgs: { id: issueUpdateId ?? '' },
    shouldSkip: !issueUpdateId,
  });

  const issueUpdate = data?.issue_update[0];
  const canModify = issueUpdate
    ? canEditIssueUpdate && !canEditIssueUpdateLoading
    : canCreateIssueUpdate && !canCreateIssueUpdateLoading;
  const onSave = async (data: IssueUpdatesFields) => {
    const { files } = data;
    if (issueUpdate) {
      const result = await updateIssueUpdate({
        variables: {
          ...data,
          CustomAttributeData: data.CustomAttributeData,
          ParentIssueId: issueId,
          Id: issueUpdate.Id,
          OriginalTimestamp: issueUpdate?.ModifiedAtTimestamp,
        },
      });
      if (result.data?.update_issue_update?.affected_rows !== 1) {
        throw new Error(
          'Records not updated. Record may have been updated by another user'
        );
      }
    } else {
      const result = await insertIssueUpdate({
        ...data,
        CustomAttributeData: data.CustomAttributeData,
        ParentIssueId: issueId,
      });
      issueUpdateId = result.insert_issue_update_one?.Id;
    }

    if (!issueUpdateId) {
      throw new Error('Missing result');
    }

    await updateFiles({
      parentType: Parent_Type_Enum.IssueUpdate,
      parentId: issueUpdateId,
      originalFiles: issueUpdate?.files.map((rf) => rf.file),
      selectedFiles: files,
    });
  };

  if (loading) {
    return null;
  }

  return (
    <ModalForm<IssueUpdatesFields>
      i18n={t('actionUpdates')}
      values={
        issueUpdate
          ? {
              ...defaultValues,
              ...issueUpdate,
              files:
                issueUpdate?.files.map((f) => f.file).filter(Boolean) ?? [],
            }
          : undefined
      }
      defaultValues={defaultValues}
      schema={IssueUpdatesSchema}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={'issue-update-form'}
      visible={true}
      readOnly={!canModify || loading}
      parentType={Parent_Type_Enum.IssueUpdate}
    >
      <IssueUpdateForm readOnly={!canModify || loading} />
    </ModalForm>
  );
};

export default IssueUpdateModal;
