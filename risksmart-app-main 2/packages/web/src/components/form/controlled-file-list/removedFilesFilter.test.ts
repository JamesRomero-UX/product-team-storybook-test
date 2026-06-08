import { Change_Request_File_Operation_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { describe, expect, it } from 'vitest';

import { removedFilesFilter } from './removedFilesFilter';

describe('removedFilesFilter', () => {
  const changeRequestFile = (
    id: string,
    operation?: Change_Request_File_Operation_Enum
  ) => ({
    Id: id,
    FileName: `${id}.pdf`,
    FileSize: 1000,
    ContentType: 'application/pdf',
    CreatedAtTimestamp: new Date().toISOString(),
    ...(operation ? { changeRequestFileOperation: operation } : {}),
  });

  it('removes change request files marked as removed when not viewing change request', () => {
    const files = [
      changeRequestFile('1', Change_Request_File_Operation_Enum.Removed),
      changeRequestFile('2', Change_Request_File_Operation_Enum.Added),
    ];

    const result = removedFilesFilter(files, false);

    expect(result).toEqual([files[1]]);
  });

  it('keeps removed files if viewing change request', () => {
    const files = [
      changeRequestFile('1', Change_Request_File_Operation_Enum.Removed),
      changeRequestFile('2', Change_Request_File_Operation_Enum.Added),
    ];

    const result = removedFilesFilter(files, true);

    expect(result).toEqual(files);
  });

  it('does not filter original files(no `changeRequestFileOperation` field) if there is no change request to removed them', () => {
    const files = [changeRequestFile('3')];

    const result = removedFilesFilter(files, false);

    expect(result).toEqual(files);
  });

  it('filters out original files that are to be removed in change request', () => {
    const originalFile = changeRequestFile('4');
    const removedFile = changeRequestFile(
      '4',
      Change_Request_File_Operation_Enum.Removed
    );
    const files = [originalFile, removedFile];

    const result = removedFilesFilter(files, true);

    expect(result).toEqual([removedFile]);
  });
});
