import { useJsonForms } from '@jsonforms/react';
import FileUpload from '@risk-smart/themed-cloudscape-components/file-upload';
import dayjs from 'dayjs';
import _ from 'lodash';
import type { FC } from 'react';

import { allowedFileExtensions } from '../../../file/allowedExtensions';
import FileItem from '../../../file/FileItem';
import type { FileItemProps, FileWithMeta } from '../../../file/types';
import { useFileDownload } from '../../../file/useFileDownload';
import styles from './style.module.scss';

interface Props {
  allowAttachments?: boolean;
  handleChange: (
    path: string,
    value: boolean | File[] | number | string
  ) => void;
  path: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const Attachments: FC<Props> = ({
  allowAttachments,
  handleChange,
  path,
  disabled,
  readOnly,
}) => {
  const downloadFile = useFileDownload();
  const { core } = useJsonForms();

  return (
    <>
      {allowAttachments && !disabled && (
        <FileUpload
          className={styles.fileUpload}
          accept={allowedFileExtensions.join(',')}
          value={[]}
          onChange={(e) => {
            handleChange(`newFiles.${path}`, e.detail.value);
            handleChange(`files`, [
              ...(core?.data?.files ?? []),
              ...e.detail.value.map((f: File) =>
                _.assignIn(f, { file: { Meta: { path } } })
              ),
            ]);
          }}
          showFileLastModified={true}
          showFileSize={true}
          multiple
          i18nStrings={{
            uploadButtonText: (multiple) =>
              multiple ? 'Choose files' : 'Choose file',
            dropzoneText: (multiple) =>
              multiple ? 'Drop files to upload' : 'Drop file to upload',
            removeFileAriaLabel: (fileIndex) => `Remove file ${fileIndex + 1}`,
            limitShowFewer: 'Show fewer files',
            limitShowMore: 'Show more files',
            errorIconAriaLabel: 'Error',
          }}
        />
      )}
      {core?.data?.files &&
        (core?.data?.files as Array<File | FileWithMeta>)
          .filter((f) => (f as FileWithMeta).file?.Meta?.path === path)
          .map((f) => {
            const props: Omit<FileItemProps, 'onRemove'> =
              f instanceof File
                ? {
                    file: f,
                    fileName: f.name,
                    fileSize: f.size,
                    timestamp: dayjs(f.lastModified).toISOString(),
                    downloadFile,
                  }
                : {
                    fileId: (f as FileWithMeta).file.Id,
                    fileName: (f as FileWithMeta).file.FileName,
                    fileSize: (f as FileWithMeta).file.FileSize,
                    timestamp: (f as FileWithMeta).file.CreatedAtTimestamp,
                    downloadFile,
                  };

            return (
              <FileItem
                disabled={disabled || readOnly}
                key={props.fileId || props.file?.name}
                {...props}
                onRemove={() => {
                  if (core?.data?.updatedFiles?.[path]?.length > 0) {
                    handleChange(
                      `updatedFiles.${path}`,
                      core.data.updatedFiles[path].filter(
                        (ff: FileWithMeta) => ff !== f
                      )
                    );
                  } else {
                    handleChange(
                      `updatedFiles.${path}`,
                      core.data.files.filter((ff: FileWithMeta) => ff !== f)
                    );
                  }
                  handleChange(
                    'files',
                    core.data.files.filter((ff: FileWithMeta) => ff !== f)
                  );
                }}
              />
            );
          })}
    </>
  );
};

export default Attachments;
