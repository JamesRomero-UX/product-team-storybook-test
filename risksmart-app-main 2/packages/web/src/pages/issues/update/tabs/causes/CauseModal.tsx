import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { useGetIssueById } from 'src/hooks/queries';
import { useGetCauseById } from 'src/hooks/queries/cause/useGetCauseById';
import type { CauseFormFields } from 'src/pages/issues/update/forms/causeSchema';
import {
  CauseFormSchema,
  defaultValues,
} from 'src/pages/issues/update/forms/causeSchema';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useInsertCause, useUpdateCause } from '@/hooks/mutations/cause';

import CauseForm from '../../forms/CauseForm';

type Props = {
  onDismiss: (saved: boolean) => void;
  issueId: string;
  causeId?: string;
};

const CauseModal: FC<Props> = ({ onDismiss, issueId, causeId }) => {
  const { t } = useTranslation('common');

  const { insertCause } = useInsertCause();
  const { updateCause } = useUpdateCause();

  const { data: issueData, loading: issueLoading } = useGetIssueById({
    queryArgs: { id: issueId! },
    shouldSkip: !issueId,
  });
  const parent = issueData?.issue?.[0];
  const { hasPermission: canEditCause, loading: canEditCauseLoading } =
    useHasPermissionQuery('update:cause', parent);
  const { hasPermission: canCreateCause, loading: canCreateCauseLoading } =
    useHasPermissionQuery('insert:cause', parent);

  const { data, loading, error } = useGetCauseById({
    queryArgs: { causeId: causeId! },
    shouldSkip: !causeId,
  });

  if (error) {
    throw error;
  }

  const cause = data?.cause[0];
  const canModify = cause
    ? canEditCause && !canEditCauseLoading
    : canCreateCause && !canCreateCauseLoading;

  const onSave = async (data: CauseFormFields) => {
    if (cause) {
      await updateCause({
        ...data,
        ParentIssueId: issueId,
        Id: causeId ?? null,
        OriginalTimestamp: cause?.ModifiedAtTimestamp ?? null,
        CustomAttributeData: data.CustomAttributeData || undefined,
      });
    } else {
      await insertCause({
        ...data,
        ParentIssueId: issueId,
        CustomAttributeData: data.CustomAttributeData || undefined,
      });
    }
  };

  if (loading || issueLoading) {
    return null;
  }

  return (
    <ModalForm
      onDismiss={onDismiss}
      onSave={onSave}
      defaultValues={defaultValues}
      i18n={t('causes')}
      schema={CauseFormSchema}
      values={cause}
      formId={'cause-form'}
      visible={true}
      readOnly={!canModify}
      parentType={Parent_Type_Enum.Cause}
    >
      <CauseForm readOnly={!canModify} />
    </ModalForm>
  );
};

export default CauseModal;
