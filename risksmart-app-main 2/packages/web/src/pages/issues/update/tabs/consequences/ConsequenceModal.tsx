import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { useGetIssueById } from 'src/hooks/queries';
import { useGetConsequenceById } from 'src/hooks/queries/consequence/useGetConsequenceById';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import {
  ConsequenceFormSchema,
  defaultValues,
} from 'src/schemas/consequenceSchema';

import { useInsertConsequence, useUpdateConsequence } from '@/hooks/mutations';

import ConsequenceForm from '../../forms/ConsequenceForm';

type Props = {
  onDismiss: (saved: boolean) => void;
  issueId: string;
  consequenceId?: string;
};

const ConsequenceModal: FC<Props> = ({ onDismiss, issueId, consequenceId }) => {
  const { t } = useTranslation('common');

  const { data: issueData, loading: issueLoading } = useGetIssueById({
    queryArgs: { id: issueId! },
    shouldSkip: !issueId,
  });
  const parent = issueData?.issue?.[0];
  const { data, loading, error } = useGetConsequenceById({
    queryArgs: { id: consequenceId! },
    shouldSkip: !consequenceId,
  });
  if (error) {
    throw error;
  }

  const {
    hasPermission: canEditConsequence,
    loading: canEditConsequenceLoading,
  } = useHasPermissionQuery('update:consequence', parent);
  const {
    hasPermission: canCreateConsequence,
    loading: canCreateConsequenceLoading,
  } = useHasPermissionQuery('insert:consequence', parent);
  const consequence = data?.consequence[0];
  const canModify = consequence
    ? canEditConsequence && !canEditConsequenceLoading
    : canCreateConsequence && !canCreateConsequenceLoading;

  const { insertConsequence } = useInsertConsequence();
  const { updateConsequence } = useUpdateConsequence();

  if (loading || issueLoading) {
    return null;
  }

  return (
    <ModalForm
      onDismiss={onDismiss}
      onSave={async (data) => {
        if (consequence) {
          await updateConsequence({
            ...data,
            ParentIssueId: issueId,
            Id: consequence.Id,
            OriginalTimestamp: consequence.ModifiedAtTimestamp,
            CustomAttributeData: data.CustomAttributeData || undefined,
          });
        } else {
          await insertConsequence({
            ...data,
            ParentIssueId: issueId,
            CustomAttributeData: data.CustomAttributeData || undefined,
          });
        }
      }}
      defaultValues={defaultValues}
      i18n={t('consequences')}
      schema={ConsequenceFormSchema}
      values={consequence}
      formId={'consequence-form'}
      visible={true}
      readOnly={!canModify}
      parentType={Parent_Type_Enum.Consequence}
    >
      <ConsequenceForm readOnly={!canModify} />
    </ModalForm>
  );
};

export default ConsequenceModal;
