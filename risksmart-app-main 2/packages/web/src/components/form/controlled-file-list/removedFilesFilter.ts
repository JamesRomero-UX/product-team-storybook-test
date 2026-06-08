import { Change_Request_File_Operation_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { Files } from './types';

export const removedFilesFilter = (
  files: Files,
  isViewingChangeRequest: boolean
) => {
  const isToBeRemovedChangeRequestFile = (file: Files[number]) =>
    !(file instanceof File) &&
    file.changeRequestFileOperation ===
      Change_Request_File_Operation_Enum.Removed &&
    isViewingChangeRequest;

  const isRemovedOriginalFile = (file: Files[number], removedFiles: Files) =>
    removedFiles.find(
      (removedFile) =>
        'Id' in removedFile && 'Id' in file && removedFile.Id === file.Id
    );

  const removedFiles = files.filter(
    (file) =>
      'changeRequestFileOperation' in file &&
      file.changeRequestFileOperation ===
        Change_Request_File_Operation_Enum.Removed
  );

  return files.filter(
    (file) =>
      !isRemovedOriginalFile(file, removedFiles) ||
      isToBeRemovedChangeRequestFile(file)
  );
};
