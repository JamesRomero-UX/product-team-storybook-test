import type { RelationFile } from '@risksmart-app/shared/src/forms/shared-schemas/fileSchema';

import type { FilesForUpdate } from './types';

type CsvFieldType = boolean | null | number | string | undefined;

export const downloadBlob = (fileName: string, blob: Blob) => {
  const anchor = document.createElement('a');
  document.body.appendChild(anchor);

  const objectUrl = window.URL.createObjectURL(blob);
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(objectUrl);
};

export function arrayToCsv(data: CsvFieldType[][]) {
  return data
    .map((row) =>
      row
        .map((value) =>
          typeof value === 'string' ? value.replaceAll('"', '""') : value
        )

        .map((value) => (typeof value === 'string' ? `"${value}"` : value))
        .map((value) => {
          if (value === undefined || value === null) {
            return '';
          }

          return String(value);
        })
        .join(',')
    )
    .join('\r\n');
}

export const humanFileSize = (bytes: number, dp = 2) => {
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + ' ' + units[u];
};

export const getRemovedFilesIds = (
  originalFiles: { Id: string | undefined }[],
  selectedFiles: { Id: string | undefined }[]
): string[] => {
  return (
    originalFiles
      .filter(
        (originalFile) =>
          !!originalFile.Id &&
          !selectedFiles.find(
            (selectedFile) => selectedFile.Id === originalFile.Id
          )
      )
      .map((originalFile) => originalFile.Id!) || []
  );
};

export const getRemovedFiles = (
  originalFiles: RelationFile[],
  selectedFiles: { Id: string | undefined }[]
): RelationFile[] => {
  return originalFiles.filter(
    (originalFile) =>
      !selectedFiles.find((selectedFile) => selectedFile.Id === originalFile.Id)
  );
};

export const hasFileChanges = (
  originalFiles?: { Id: string | undefined }[],
  selectedFiles?: FilesForUpdate
): boolean => {
  const removedFiles = getRemovedFilesIds(
    (originalFiles ?? []).map((f) => ({ Id: f.Id })) || [],
    (selectedFiles?.filter((f) => !(f instanceof File)) as {
      Id: string | undefined;
    }[]) || []
  );
  const newFiles = selectedFiles?.filter(
    (selectedFile): selectedFile is File => selectedFile instanceof File
  );

  return removedFiles.length > 0 || (newFiles ? newFiles.length > 0 : false);
};
