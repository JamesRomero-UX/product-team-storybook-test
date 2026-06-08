import { useMutation } from '@apollo/client';
import { DeleteRelationFileByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getRemovedFiles, getRemovedFilesIds } from './fileUtils';
import type {
  UseChangeRequestFileUpdateOptions,
  UseChangeRequestMultiParentFileUpdateOptions,
  UseFileUpdateOptions,
  UseMultiParentFileUpdateOptions,
} from './types';
import { useFileUpload } from './useFileUpload';

const useUpdateFiles = () => {
  const [deleteFilesById] = useMutation(DeleteRelationFileByIdDocument);
  const uploadFiles = useFileUpload();

  return async ({
    parentType,
    parentIds,
    newFiles,
    originalFiles,
    selectedFiles,
  }: UseMultiParentFileUpdateOptions & {
    newFiles: File[] | undefined;
  }): Promise<void> => {
    const removedFileIds = getRemovedFilesIds(
      originalFiles?.map((f) => ({
        Id: (f as { Id: string | undefined })?.Id,
      })) ?? [],
      (selectedFiles?.filter((f) => !(f instanceof File)) as {
        Id: string | undefined;
      }[]) || []
    );

    await uploadFiles(parentType, parentIds, newFiles);

    if (removedFileIds.length > 0) {
      await deleteFilesById({
        variables: {
          parentIds,
          fileIds: removedFileIds,
        },
      });
    }
  };
};

export const useFileUpdate = () => {
  const updateFiles = useUpdateFiles();

  return {
    updateFiles: async ({
      parentType,
      parentId,
      originalFiles,
      selectedFiles,
    }: UseFileUpdateOptions): Promise<void> =>
      await updateFiles({
        parentType,
        parentIds: [parentId],
        newFiles: selectedFiles?.filter((f): f is File => f instanceof File),
        originalFiles,
        selectedFiles,
      }),
    error: '',
  };
};

const useChangeRequestUpdateFiles = () => {
  const uploadFiles = useFileUpload();

  return async ({
    parentType,
    parentIds,
    newFiles,
    originalFiles,
    selectedFiles,
  }: UseChangeRequestMultiParentFileUpdateOptions & {
    newFiles: File[] | undefined;
  }): Promise<void> => {
    const removedFiles = getRemovedFiles(
      originalFiles,
      (selectedFiles?.filter(
        (selectedFile) => !(selectedFile instanceof File)
      ) as {
        Id: string | undefined;
      }[]) || []
    );

    await uploadFiles(parentType, parentIds, newFiles, removedFiles, true);
  };
};

export const useChangeRequestFileUpdate = () => {
  const updateFiles = useChangeRequestUpdateFiles();

  return {
    updateFiles: async ({
      parentType,
      parentId,
      originalFiles,
      selectedFiles,
    }: UseChangeRequestFileUpdateOptions): Promise<void> =>
      await updateFiles({
        parentType,
        parentIds: [parentId],
        newFiles: selectedFiles?.filter(
          (selectedFile): selectedFile is File => selectedFile instanceof File
        ),
        originalFiles,
        selectedFiles,
      }),
    error: '',
  };
};

export const useMultiParentFileUpdate = () => {
  const updateFiles = useUpdateFiles();

  return {
    updateFiles: async ({
      parentType,
      parentIds,
      originalFiles,
      selectedFiles,
    }: UseMultiParentFileUpdateOptions): Promise<void> =>
      await updateFiles({
        parentType,
        parentIds,
        newFiles: selectedFiles?.filter((f): f is File => f instanceof File),
        originalFiles,
        selectedFiles,
      }),
    error: '',
  };
};
