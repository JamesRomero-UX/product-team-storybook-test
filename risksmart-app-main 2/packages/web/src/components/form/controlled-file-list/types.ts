import type { RelationFile } from '@risksmart-app/shared/forms/shared-schemas/fileSchema';
import type { Change_Request_File_Operation_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

export type FileItem =
  | File
  | (RelationFile & {
      changeRequestFileOperation?: Change_Request_File_Operation_Enum;
    });

export type Files = FileItem[];

/**
 * Files as they may come from form values, which can include nullish values
 * due to incomplete data from queries (e.g., when relation_file.file is null)
 */
export type FilesFromForm = (FileItem | null | undefined)[];
