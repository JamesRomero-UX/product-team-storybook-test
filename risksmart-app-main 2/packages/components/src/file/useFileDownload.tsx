import type { AxiosInstance } from 'axios';

import { useAxiosStore } from '../hooks/useAxios';
import { downloadBlob } from './fileUtils';

interface FileType {
  fileId?: null | string;
  fileName: string;
  file?: File;
  openInBrowser?: boolean;
}

const getS3DownloadUrl = async ({ get }: AxiosInstance, fileId: string) =>
  (await get<string>(`/files/${fileId}`)).data;

const getFileFromS3 = async (
  unauthorisedAxiosInstance: AxiosInstance,
  url: string
) =>
  (await unauthorisedAxiosInstance.get<Blob>(url, { responseType: 'blob' }))
    .data;

const getFileBlob = async (
  authorisedAxiosInstance: AxiosInstance,
  unauthorisedAxiosInstance: AxiosInstance,
  fileId: string
) => {
  const url = await getS3DownloadUrl(authorisedAxiosInstance, fileId);

  return await getFileFromS3(unauthorisedAxiosInstance, url);
};

export const useFileDownload = () => {
  const { authorisedAxiosInstance, unauthorisedAxiosInstance } =
    useAxiosStore();

  return async (
    { fileId, fileName, file }: FileType,
    downloadFile = true
  ): Promise<Blob> => {
    const blob =
      file ||
      (fileId &&
        (await getFileBlob(
          authorisedAxiosInstance,
          unauthorisedAxiosInstance,
          fileId
        )));
    if (!blob) {
      throw new Error('No file or fileId to download');
    }
    if (downloadFile) {
      downloadBlob(fileName, blob);
    }

    return blob;
  };
};
