import type { RelationFile } from '@risksmart-app/shared/src/forms/shared-schemas/fileSchema';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

export type FileWithMeta = File & {
  file: {
    Id: string;
    FileName: string;
    FileSize: number;
    CreatedAtTimestamp: string;
    Meta: {
      path?: string;
    };
  };
};

export interface FileType {
  fileId?: null | string;
  fileName: string;
  file?: File;
  openInBrowser?: boolean;
}

export interface FileItemProps {
  fileId?: string;
  file?: File;
  onRemove: () => void;
  fileName: string;
  fileSize: number;
  timestamp: string;
  error?: boolean;
  disabled?: boolean;
  downloadFile: (
    { fileId, fileName, file }: FileType,
    downloadFile?: boolean
  ) => Promise<Blob>;
}

export type FilesForUpdate =
  | (
      | { Id: string | undefined }
      | (File & { meta?: { [key: string]: string } })
      | null
      | undefined
    )[]
  | undefined;

export interface UseFileUpdateOptions {
  // TODO: investigate if we can delete this (here as well as in the relation_file table) now that we have the node table with the object type on it
  parentType: Parent_Type_Enum;
  parentId: string;
  // Original files are the files that were already associated with the parent.
  originalFiles?: FilesForUpdate;
  // Selected files is a subset of the original files that we intend to keep.
  // Any files from the original files not listed will be deleted.
  selectedFiles?: FilesForUpdate;
}

export type UseChangeRequestFileUpdateOptions = Omit<
  UseFileUpdateOptions,
  'originalFiles'
> & { originalFiles: RelationFile[] };

export type UseMultiParentFileUpdateOptions = Omit<
  UseFileUpdateOptions,
  'parentId'
> & {
  parentIds: string[];
};

export type UseChangeRequestMultiParentFileUpdateOptions = Omit<
  UseMultiParentFileUpdateOptions,
  'originalFiles'
> & { originalFiles: RelationFile[] };
