import { useMutation } from '@apollo/client';
import { useFileUpload } from '@risksmart-app/components/src/file/useFileUpload';
import {
  Document_File_Type_Enum,
  InsertDocumentVersionDocument,
  namedOperations,
  Parent_Type_Enum,
  UpdateDocumentVersionDocument,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ConfirmModal from 'src/components/confirm-modal/ConfirmModal';
import { PageForm } from 'src/components/form/form/PageForm';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import type { Editor as TinyEditor } from 'tinymce';

import { useGetDocumentById, useGetDocumentFileById } from '@/hooks/queries';
import { useChangeRequests } from '@/hooks/useChangeRequests';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { evictField } from '@/utils/graphqlUtils';

import type { DocumentVersionFormFieldData } from '../../../forms/documentFileSchema';
import {
  defaultValues,
  DocumentFileFormSchema,
} from '../../../forms/documentFileSchema';
import DocumentVersionForm from '../../../forms/DocumentVersionForm';
import DocumentVersionFormFields from '../../../forms/DocumentVersionFormFields';
import { useNextFileVersion } from '../../../useNextFileVersion';

type TabProps = {
  parentDocumentId: string;
  documentFileId: string;
};

const Tab = ({ parentDocumentId, documentFileId }: TabProps) => {
  const approversEnabled = useIsModuleEnabled('approval');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'documentFiles.confirm_close_modal',
  });
  const { t: st } = useTranslation(['common']);
  const editorRef = useRef<null | TinyEditor>(null);
  const uploadFile = useFileUpload();
  const [confirmCloseVisible, setConfirmCloseVisible] = useState(false);
  const [insert] = useMutation(InsertDocumentVersionDocument, {
    update: (cache) => {
      evictField(cache, 'document');
    },
  });
  const [update] = useMutation(UpdateDocumentVersionDocument, {
    update: (cache) => {
      evictField(cache, 'document');
      evictField(cache, 'change_request');
    },
  });
  const { data: parentData } = useGetDocumentById({
    queryArgs: { documentId: parentDocumentId },
  });
  const parent = parentData?.document[0];

  const [
    { nextVersion, content, type, link, customAttributeData },
    { loading: loadingNextFileVersion },
  ] = useNextFileVersion(parentDocumentId);
  const navigate = useNavigate();
  const {
    hasPermission: canEditPermission,
    loading: canEditPermissionLoading,
  } = useHasPermissionQuery('update:document_file', parent);
  const {
    hasPermission: canCreatePermission,
    loading: canCreatePermissionLoading,
  } = useHasPermissionQuery('insert:document_file', parent);

  const {
    data: documentFileData,
    loading,
    error,
  } = useGetDocumentFileById({
    queryArgs: { id: documentFileId },
    shouldSkip: !documentFileId,
  });
  if (error) {
    throw error;
  }

  const documentFile = documentFileData?.document_file[0];

  const canModify = documentFile
    ? canEditPermission && !canEditPermissionLoading
    : canCreatePermission && !canCreatePermissionLoading;
  const isDocumentFileDraft = documentFile?.Status
    ? documentFile?.Status === Version_Status_Enum.Draft
    : true;
  const onSave = async (data: DocumentVersionFormFieldData) => {
    let content: null | string = null;
    let link: null | string = null;
    let fileId: null | string = null;
    switch (data.Type) {
      case Document_File_Type_Enum.Link:
        link = data.Link;
        break;
      case Document_File_Type_Enum.Html:
        content = editorRef.current?.getContent() ?? null;
        break;
      case Document_File_Type_Enum.File: {
        const files = data.files || [];
        const newFile = files.find((f) => f instanceof File);
        if (newFile) {
          const uploadResponse = await uploadFile(
            Parent_Type_Enum.Document,
            [parentDocumentId],
            [newFile]
          );
          fileId = uploadResponse.fileIds[0];
        } else {
          fileId = documentFile?.file?.Id ?? null;
        }
        break;
      }
    }
    if (documentFile) {
      await update({
        variables: {
          ...data,
          FileId: fileId,
          Id: documentFile.Id,
          Content: content,
          Link: link,
          LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp,
          ReviewedBy: data.ReviewedBy?.value,
        },
        refetchQueries: [namedOperations.Query.getDocumentFileById],
        context: {
          headers: {
            'x-confirm-change-request': 'true',
          },
        },
      });
    } else {
      const { Status: _, ...dataToInsert } = data;
      await insert({
        variables: {
          ...dataToInsert,
          FileId: fileId,
          ParentDocumentId: parentDocumentId,
          Content: content,
          Link: link,
          ReviewedBy: dataToInsert.ReviewedBy?.value,
        },
        refetchQueries: [namedOperations.Query.getDocumentFileById],
      });
    }
  };

  const approvalData = documentFile
    ? {
        ...documentFile,
        owners: documentFile.parent?.owners ?? [],
        ownerGroups: documentFile.parent?.ownerGroups ?? [],
      }
    : undefined;

  const { pendingChangeRequests } = useChangeRequests(approvalData);

  const values: DocumentVersionFormFieldData | undefined = documentFile
    ? ({
        ...defaultValues,
        ...documentFile,
        files: documentFile.file ? [documentFile.file] : [],
        ReviewedBy: documentFile.ReviewedBy
          ? { value: documentFile.ReviewedBy, type: 'user' }
          : null,
      } as DocumentVersionFormFieldData)
    : undefined;
  const defaultValuesWithVersion: DocumentVersionFormFieldData = {
    ...defaultValues,
    Version: nextVersion,
    Content: content,
    Type: type,
    Link: link,
    CustomAttributeData: customAttributeData,
  } as DocumentVersionFormFieldData;
  const readOnly = !canModify;

  if (loading || loadingNextFileVersion) {
    return null;
  }

  const onDismiss = () => {
    navigate(`/policy/${parentDocumentId}/files`);
  };

  return approversEnabled && documentFile?.Id ? (
    <>
      <DocumentVersionForm
        // Disable status field as we have buttons which allow correct status transitions
        disableStatus={true}
        defaultValues={defaultValuesWithVersion}
        values={values}
        onSave={onSave}
        onDismiss={(saved) => {
          if (saved || readOnly || !isDocumentFileDraft) {
            onDismiss();
          }
          setConfirmCloseVisible(true);
        }}
        readOnly={readOnly}
        approvalConfig={{
          object: approvalData,
        }}
        hasPendingChangeRequests={pendingChangeRequests.length >= 1}
        isCreatingNewEntity={!!documentFile}
        editorRef={editorRef}
        readonly={readOnly}
        savedStatus={documentFile?.Status}
        parentId={parentDocumentId}
      />

      {confirmCloseVisible && (
        <ConfirmModal
          isVisible={true}
          onConfirm={onDismiss}
          onDismiss={() => setConfirmCloseVisible(false)}
          header={t('title')}
        >
          {t('message')}
        </ConfirmModal>
      )}
    </>
  ) : (
    <>
      <PageForm
        // TODO: Add render template?
        header={st('details')}
        i18n={st('documentFiles')}
        defaultValues={defaultValuesWithVersion}
        parentType={Parent_Type_Enum.DocumentFile}
        values={values}
        schema={DocumentFileFormSchema}
        onSave={onSave}
        onDismiss={(saved) => {
          if (saved || readOnly) {
            onDismiss();
          }
          setConfirmCloseVisible(true);
        }}
        formId={'document-file-form'}
        readOnly={readOnly}
      >
        <DocumentVersionFormFields
          disableStatus={false}
          isCreatingNewEntity={!!documentFile}
          editorRef={editorRef}
          readonly={readOnly}
          savedStatus={documentFile?.Status || Version_Status_Enum.Draft}
          parentId={parentDocumentId}
        />
      </PageForm>
      <ConfirmModal
        isVisible={confirmCloseVisible}
        onConfirm={onDismiss}
        onDismiss={() => setConfirmCloseVisible(false)}
        header={t('title')}
      >
        {t('message')}
      </ConfirmModal>
    </>
  );
};

export default Tab;
