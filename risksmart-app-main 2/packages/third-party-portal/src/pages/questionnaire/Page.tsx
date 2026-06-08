import { useMutation, useSubscription } from '@apollo/client';
import type { FileWithMeta } from '@risksmart-app/components/src/file/types';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { CustomForm } from '@risksmart-app/components/src/form-builder/CustomForm';
import type { ResponseData } from '@risksmart-app/components/src/form-builder/types';
import Loading from '@risksmart-app/components/src/loading';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  Parent_Type_Enum,
  Third_Party_Response_Status_Enum,
  TppGetResponseByIdDocument,
  TppUpdateThirdPartyResponseDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _, { isEmpty } from 'lodash';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PageLayout } from 'src/layouts';

const assignPathToFiles = (files: File[], path: string) =>
  files.map((f) => _.assignIn(f, { meta: { path } }));

// Adds the path (form field) the file belongs to as metadata.
// We have to use assignIn because the File type is protected.
const enrichFilesWithPathMetadata = (files: {
  [key: string]: File[];
}): Array<File & { meta?: { [key: string]: string } }> => {
  const filesWithMeta: Array<File & { meta?: { [key: string]: string } }> = [];
  _.keys(files).forEach((k) => {
    filesWithMeta.push(...assignPathToFiles(files[k], k));
  });

  return filesWithMeta;
};

type OriginalFiles =
  | {
      file?:
        | {
            Id: string;
            Meta?: { path?: string } | null | undefined;
          }
        | null
        | undefined;
    }[]
  | undefined;

/**
 * Given the original files and the updated files, this function filters out the files that have been deleted.
 * If there are no updated files, it returns all original files that have a path.
 * If there are updated files, if the file's path is not present, it is not considered deleted
 * If the file's path is present, if the file is not present in the updated files for the given path, it is considered deleted.
 * @param originalFiles List of files returned from response
 * @param updatedFiles List of updated files
 * @returns List of files that have not been deleted (i.e selected files)
 */
const removeDeletedFiles = (
  originalFiles: OriginalFiles,
  updatedFiles: {
    [key: string]: FileWithMeta[];
  }
) => {
  if (!originalFiles) {
    return [];
  }

  return originalFiles
    .filter((f) => {
      if (!f?.file?.Meta?.path) {
        return false;
      }

      if (!updatedFiles || !updatedFiles[f.file.Meta.path]) {
        return true;
      }

      return updatedFiles[f.file.Meta.path].some(
        (ff) => ff.file.Id === f.file?.Id
      );
    })
    .map((f) => f.file);
};

const Page: FC = () => {
  const Id = useGetGuidParam('id');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party_responses.questionnaire_form.notification',
  });

  const notificationI18n = {
    saveSuccess: t('save_success'),
    submitSuccess: t('submit_success'),
    submitError: t('submit_error'),
  };

  const navigate = useNavigate();
  const [update] = useMutation(TppUpdateThirdPartyResponseDocument);
  const { data, loading } = useSubscription(TppGetResponseByIdDocument, {
    fetchPolicy: 'no-cache',
    variables: { Id },
  });
  const { updateFiles } = useFileUpdate();

  const responseData = data?.third_party_response_by_pk;
  const originalFiles = responseData?.files;
  const readOnly =
    responseData?.Status === Third_Party_Response_Status_Enum.AwaitingReview ||
    responseData?.Status === Third_Party_Response_Status_Enum.Completed ||
    responseData?.Status === Third_Party_Response_Status_Enum.Recalled ||
    responseData?.Status === Third_Party_Response_Status_Enum.Rejected;

  if (loading) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }

  if (
    isEmpty(
      data?.third_party_response_by_pk?.questionnaireTemplateVersion?.Schema
    ) ||
    isEmpty(
      data?.third_party_response_by_pk?.questionnaireTemplateVersion?.UISchema
    )
  ) {
    throw new Error('Schema or UISchema is empty');
  }

  const onSave =
    (status: Third_Party_Response_Status_Enum) =>
    async (data: ResponseData) => {
      await update({
        variables: {
          Id,
          response: {
            ...data,
            files: undefined,
            newFiles: undefined,
            updatedFiles: undefined,
          },
          status,
        },
      });

      // ResponseData's index signature types all values as string | number | boolean | { [key: string]: File[] }.
      // newFiles/updatedFiles are only present when the user interacts with attachments, so default to {}.
      // The long-term fix would be to extend ResponseData's index signature to include FileWithMeta[],
      // which would make these assertions unnecessary.
      const newFiles = (data.newFiles ?? {}) as { [key: string]: File[] }; // ResponseData index signature doesn't distinguish field shapes — newFiles is always File[] values
      // updatedFiles contains FileWithMeta[] values; ResponseData index signature doesn't distinguish field shapes
      const typedUpdatedFiles = (data.updatedFiles ?? {}) as {
        [key: string]: FileWithMeta[];
      };

      await updateFiles({
        parentId: Id,
        parentType: Parent_Type_Enum.ThirdPartyResponse,
        originalFiles: originalFiles?.map((f) => f.file),
        selectedFiles: [
          ...enrichFilesWithPathMetadata(newFiles),
          ...removeDeletedFiles(originalFiles, typedUpdatedFiles),
        ],
      });

      navigate('/');
    };

  return (
    <PageLayout
      title={`${responseData?.questionnaireTemplateVersion?.parent?.Title}`}
      counter={`(v${responseData?.questionnaireTemplateVersion?.Version})`}
    >
      <CustomForm
        onCancel={() => navigate('..')}
        onSubmit={onSave(Third_Party_Response_Status_Enum.AwaitingReview)}
        onSave={onSave(Third_Party_Response_Status_Enum.InProgress)}
        values={{
          ...responseData?.ResponseData,
          files: responseData?.files,
        }}
        schema={responseData?.questionnaireTemplateVersion?.Schema}
        uischema={responseData?.questionnaireTemplateVersion?.UISchema}
        notificationI18n={notificationI18n}
        readOnly={readOnly}
      />
    </PageLayout>
  );
};

export default Page;
