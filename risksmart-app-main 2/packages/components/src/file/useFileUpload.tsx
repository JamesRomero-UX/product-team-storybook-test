import type { RelationFile } from '@risksmart-app/shared/src/forms/shared-schemas/fileSchema';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Change_Request_File_Operation_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios';

import { useAxiosStore } from '../hooks/useAxios';

interface PresignedUrlResponse {
  fileName: string;
  key: string;
  signedUrl: string;
}

interface SaveFileType {
  fileName: string;
  fileId: string;
  fileSize: number;
  mimeType: string;
  meta?: { [key: string]: string };
  changeRequestFileOperation?: Change_Request_File_Operation_Enum | null;
}

interface SaveFileRequest {
  parentIds: string[];
  parentType: string;
  files: SaveFileType[];
}

interface Response {
  fileIds: string[];
}

const getPresignedUrls = async (
  axios: AxiosInstance,
  parentIds: string[],
  parentType: Parent_Type_Enum,
  files: File[]
) => {
  const { data } = await axios.post<PresignedUrlResponse[]>(
    `/files/presigned`,
    {
      parentType,
      parentIds,
      fileNames: files.map((f) => f.name),
    }
  );

  return data;
};

const uploadToS3 = async (
  axiosInstance: AxiosInstance,
  presignedUrl: string,
  file: File
) => {
  return await axiosInstance.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type,
      Authorization: undefined,
    },
  });
};

const saveRelationFileData = async (
  axios: AxiosInstance,
  request: SaveFileRequest
) => {
  const { data } = await axios.post<Response>(`/files/save`, request);

  return data;
};

export const useFileUpload = () => {
  const { authorisedAxiosInstance, unauthorisedAxiosInstance } =
    useAxiosStore();

  return async (
    parentType: Parent_Type_Enum,
    parentIds: string[],
    newFiles: Array<
      File & {
        meta?: { [key: string]: string };
      }
    > = [],
    removedFiles?: RelationFile[],
    isChangeRequest?: boolean
  ): Promise<Response> => {
    try {
      const presignedUrls =
        newFiles.length > 0
          ? await getPresignedUrls(
              authorisedAxiosInstance,
              parentIds,
              parentType,
              newFiles
            )
          : [];

      const newFilePutPromises = presignedUrls.map(async (url, index) => {
        const file = newFiles[index];
        await uploadToS3(unauthorisedAxiosInstance, url.signedUrl, file);

        await saveRelationFileData(authorisedAxiosInstance, {
          parentIds,
          parentType,
          files: [
            {
              fileName: file.name,
              fileId: url.key,
              fileSize: file.size,
              mimeType: file.type,
              meta: file.meta,
              changeRequestFileOperation: isChangeRequest
                ? Change_Request_File_Operation_Enum.Added
                : null,
            },
          ],
        });

        return url.key;
      });

      const removedFilePutPromises =
        removedFiles?.map(async (removedFile) => {
          await saveRelationFileData(authorisedAxiosInstance, {
            parentIds,
            parentType,
            files: [
              {
                fileName: removedFile.FileName,
                fileId: removedFile.Id,
                fileSize: removedFile.FileSize,
                mimeType: removedFile.ContentType,
                changeRequestFileOperation:
                  Change_Request_File_Operation_Enum.Removed,
              },
            ],
          });

          return removedFile.Id;
        }) ?? [];

      const successfulFiles = await Promise.all([
        ...newFilePutPromises,
        ...removedFilePutPromises,
      ]);

      return { fileIds: successfulFiles };
    } catch (error) {
      if (isAxiosError(error)) {
        error.message = 'Something went wrong';
      }
      throw error;
    }
  };
};
