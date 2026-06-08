import { useMutation } from '@apollo/client';
import { useFileUpload } from '@risksmart-app/components/src/file/useFileUpload';
import {
  Document_File_Type_Enum,
  InsertDocumentVersionDocument,
  namedOperations,
  Parent_Type_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ConfirmModal from 'src/components/confirm-modal/ConfirmModal';
import type { Editor as TinyEditor } from 'tinymce';

import { evictField } from '@/utils/graphqlUtils';

import type { DocumentVersionFormFieldData } from '../../../forms/documentFileSchema';
import { defaultValues } from '../../../forms/documentFileSchema';
import DocumentVersionForm from '../../../forms/DocumentVersionForm';
import { useNextFileVersion } from '../../../useNextFileVersion';

type TabProps = {
  parentDocumentId: string;
};

const Tab = ({ parentDocumentId }: TabProps) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'documentFiles.confirm_close_modal',
  });

  const editorRef = useRef<null | TinyEditor>(null);
  const uploadFile = useFileUpload();
  const [confirmCloseVisible, setConfirmCloseVisible] = useState(false);
  const [insert] = useMutation(InsertDocumentVersionDocument, {
    update: (cache) => {
      evictField(cache, 'document');
    },
  });

  const [
    { nextVersion, content, type, link, customAttributeData },
    { loading: loadingNextFileVersion },
  ] = useNextFileVersion(parentDocumentId);
  const navigate = useNavigate();
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
      case Document_File_Type_Enum.File:
        if (data.files.length === 1) {
          const uploadResponse = await uploadFile(
            Parent_Type_Enum.Document,
            [parentDocumentId],
            data.files as File[]
          );
          fileId = uploadResponse.fileIds[0];
        }
        break;
    }
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
  };

  const defaultValuesWithVersion: DocumentVersionFormFieldData = {
    ...defaultValues,
    Version: nextVersion,
    Content: content,
    Type: type,
    Link: link,
    CustomAttributeData: customAttributeData,
  } as DocumentVersionFormFieldData;

  if (loadingNextFileVersion) {
    return null;
  }

  const onDismiss = () => {
    navigate(`/policy/${parentDocumentId}/files`);
  };

  return (
    <>
      <DocumentVersionForm
        disableStatus={true}
        defaultValues={defaultValuesWithVersion}
        onSave={onSave}
        onDismiss={(saved) => {
          if (saved) {
            onDismiss();
          }

          setConfirmCloseVisible(true);
        }}
        isCreatingNewEntity={false}
        editorRef={editorRef}
        hasPendingChangeRequests={false}
        savedStatus={Version_Status_Enum.Draft}
        parentId={parentDocumentId}
      />

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
