import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Box from '@risk-smart/themed-cloudscape-components/box';
import { humanFileSize } from '@risksmart-app/components/src/file/fileUtils';
import { useFileDownload } from '@risksmart-app/components/src/file/useFileDownload';
import { Change_Request_File_Operation_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import type { FC } from 'react';
import type { FieldValues } from 'react-hook-form';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import { useRiskSmartForm } from '../form/customisable-form/RiskSmartFormContext';
import type { ControlledBaseProps } from '../types';
import { removedFilesFilter } from './removedFilesFilter';
import styles from './style.module.scss';
import type { FilesFromForm } from './types';

interface Props<T extends FieldValues> extends Omit<
  ControlledBaseProps<T>,
  'label'
> {
  disabled?: boolean;
}

export const ControlledFileList = <T extends FieldValues>({
  name,
  control,
  disabled,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
}: Props<T>) => {
  const readOnly = useIsFieldReadOnly(name);
  const { previewChanges } = useRiskSmartForm();

  return (
    <div className={styles.fileList}>
      <Controller
        name={name}
        defaultRequired={defaultRequired}
        forceRequired={forceRequired}
        allowDefaultValue={allowDefaultValue}
        control={control}
        render={({ field: { value, onChange } }) => {
          const filesFromForm = (value ?? []) as FilesFromForm;
          const files = filesFromForm.filter(
            (f): f is NonNullable<typeof f> => f != null
          );

          const { error } = control.getFieldState(name);

          return (
            <>
              {removedFilesFilter(files, !!previewChanges).map((f) => {
                const props: Omit<FileItemProps, 'onRemove'> =
                  f instanceof File
                    ? {
                        file: f,
                        fileName: f.name,
                        fileSize: f.size,
                        timestamp: dayjs(f.lastModified).toISOString(),
                      }
                    : {
                        fileId: f.Id,
                        fileName: f.FileName,
                        fileSize: f.FileSize,
                        timestamp: f.CreatedAtTimestamp,
                        changeRequestFileOperation:
                          f.changeRequestFileOperation,
                      };

                return (
                  <FileItem
                    disabled={disabled || readOnly}
                    error={Boolean(error)}
                    key={props.fileId || props.file?.name}
                    {...props}
                    onRemove={() => {
                      const newFiles = files.filter((ff) => ff != f);
                      onChange(newFiles);
                    }}
                  />
                );
              })}
            </>
          );
        }}
      />
    </div>
  );
};

type FileItemProps = {
  fileId?: string;
  file?: File;
  onRemove: () => void;
  fileName: string;
  fileSize: number;
  timestamp: string;
  error?: boolean;
  disabled?: boolean;
  changeRequestFileOperation?: Change_Request_File_Operation_Enum;
};

const FileItem: FC<FileItemProps> = ({
  fileId,
  onRemove,
  fileName,
  fileSize,
  file,
  error,
  disabled,
  changeRequestFileOperation,
}) => {
  const downloadFile = useFileDownload();

  return (
    <Box
      data-testid={'file-list-file-item'}
      margin={{ vertical: 'xs' }}
      key={fileId || file?.name}
    >
      <Alert
        type={
          error ||
          changeRequestFileOperation ===
            Change_Request_File_Operation_Enum.Removed
            ? 'error'
            : 'success'
        }
        onDismiss={onRemove}
        dismissible={!disabled}
      >
        <div
          className={styles.fileDetailContainer}
          onClick={async () => {
            downloadFile({ fileId, fileName, file });
          }}
        >
          <span data-testid={'file-name'}>{fileName}</span>
          <br />
          <Box variant={'small'}>{humanFileSize(fileSize)}</Box>
        </div>
      </Alert>
    </Box>
  );
};
