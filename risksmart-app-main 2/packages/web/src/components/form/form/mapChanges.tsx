import {
  Change_Request_File_Operation_Enum,
  type GetPendingChangeRequestsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { FileOrRelation } from 'src/schemas/global';

export const mapChanges = (
  from: Record<string, unknown>,
  to: Record<string, unknown>
) => {
  const compareResult = compare(from, to);
  const mappedFiles = mapFileChanges(compareResult);

  return mappedFiles.to.length > 0 || mappedFiles.from.length > 0
    ? { ...compareResult, files: mappedFiles }
    : { ...compareResult };
};

export const mapFileChanges = (
  compareResult: Record<
    string,
    {
      from: unknown;
      to: unknown;
    }
  >
) => {
  const originalFiles = (compareResult['files']?.from ??
    []) as FileOrRelation[];
  const changeRequestFiles = (compareResult['files']?.to ??
    []) as GetPendingChangeRequestsQuery['change_request'][0]['requestedFileChanges'];

  const isRemoved = (file: (typeof changeRequestFiles)[number]) =>
    file.ChangeRequestFileOperation ===
    Change_Request_File_Operation_Enum.Removed;

  const isAdded = (file: (typeof changeRequestFiles)[number]) =>
    file.ChangeRequestFileOperation ===
    Change_Request_File_Operation_Enum.Added;

  const changeRequestRemovedFiles = changeRequestFiles.filter((file) =>
    isRemoved(file)
  );

  const changeRequestAddedFiles = changeRequestFiles.filter((file) =>
    isAdded(file)
  );

  const originalFilesWithoutRemovedFiles = originalFiles.filter((file) => {
    const fileId = file && 'Id' in file ? file.Id : '';

    return !changeRequestRemovedFiles.some(
      (changeRequestFile) => changeRequestFile.file?.Id === fileId
    );
  });

  const newFiles = [
    ...originalFilesWithoutRemovedFiles,
    ...changeRequestAddedFiles,
  ].map((file) => {
    return file && 'file' in file ? file.file : file;
  });

  return { from: originalFiles, to: newFiles };
};

const compare = (a: Record<string, unknown>, b: Record<string, unknown>) => {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  if (!_.isObject(a) && !_.isObject(b)) {
    return changes;
  }
  const keys = _.union(_.keys(a), _.keys(b));
  for (const key of keys) {
    if (a?.[key] !== b?.[key]) {
      changes[key] = { from: a?.[key], to: b?.[key] };
      const subChanges = compare(
        a?.[key] as Record<string, unknown>,
        b?.[key] as Record<string, unknown>
      );
      for (const subKey in subChanges) {
        changes[key + '.' + subKey] = subChanges[subKey];
      }
    }
  }

  return changes;
};
