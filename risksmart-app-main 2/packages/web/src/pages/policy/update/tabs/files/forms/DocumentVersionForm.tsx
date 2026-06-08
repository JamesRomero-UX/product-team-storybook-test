import { useQuery } from '@apollo/client';
import {
  GetGlobalApprovalsDocument,
  Parent_Type_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, MutableRefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';
import type { Editor as TinyEditor } from 'tinymce';

import type { DocumentVersionFormFieldData } from './documentFileSchema';
import { DocumentFileFormSchema } from './documentFileSchema';
import DocumentVersionFormFields from './DocumentVersionFormFields';

export type Props = Omit<
  FormContextProps<DocumentVersionFormFieldData>,
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
  | 'submitActions'
> & {
  readonly?: boolean;
  isCreatingNewEntity: boolean;
  savedStatus: Version_Status_Enum;
  editorRef: MutableRefObject<null | TinyEditor>;
  parentId: string;
  hasPendingChangeRequests: boolean;
  disableStatus: boolean;
};

const DocumentVersionForm: FC<Props> = ({
  savedStatus,
  disableStatus,
  hasPendingChangeRequests,
  readOnly,
  isCreatingNewEntity,
  parentId,
  onSave,
  editorRef,
  ...props
}) => {
  const { t: st } = useTranslation(['common']);
  const isDocumentFileDraft = savedStatus === Version_Status_Enum.Draft;
  const isPublished = savedStatus === Version_Status_Enum.Published;
  const allowStatusChange =
    !hasPendingChangeRequests && !readOnly && isCreatingNewEntity;
  const { data } = useQuery(GetGlobalApprovalsDocument, {
    variables: { parentId },
  });

  const requiresApproval = data?.approval.some(
    (a) => a.Workflow === 'publish-document-version'
  );

  return (
    <CustomisableForm
      {...props}
      onSave={onSave}
      parentType={Parent_Type_Enum.DocumentFile}
      header={st('details')}
      i18n={st('documentFiles')}
      schema={DocumentFileFormSchema}
      formId={'document-file-form'}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      submitActions={[
        {
          label: st('save'),
          action: onSave,
        },
        ...(allowStatusChange && isDocumentFileDraft
          ? [
              {
                label: requiresApproval
                  ? st('submit_for_approval')
                  : st('publish'),
                action: (data: DocumentVersionFormFieldData) =>
                  onSave({
                    ...data,
                    Status: Version_Status_Enum.Published,
                  }),
              },
            ]
          : []),
        ...(allowStatusChange && isPublished
          ? [
              {
                label: st('archive'),
                action: (data: DocumentVersionFormFieldData) =>
                  onSave({
                    ...data,
                    Status: Version_Status_Enum.Archived,
                  }),
              },
            ]
          : []),
      ]}
    >
      <DocumentVersionFormFields
        disableStatus={disableStatus}
        isCreatingNewEntity={isCreatingNewEntity}
        editorRef={editorRef}
        savedStatus={savedStatus}
        parentId={parentId}
      />
    </CustomisableForm>
  );
};

export default DocumentVersionForm;
