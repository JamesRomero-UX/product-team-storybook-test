import type { FileUploadProps } from '@risk-smart/themed-cloudscape-components/file-upload';
import FileUpload from '@risk-smart/themed-cloudscape-components/file-upload';
import { allowedFileExtensions } from '@risksmart-app/shared/allowedFileExtensions';
import { isEqual } from 'lodash';
import type { FieldValues } from 'react-hook-form';
import { FormField } from 'src/components/form/form/FormField';
import type { FileOrRelation } from 'src/schemas/global';

import ControlledFileList from '../controlled-file-list';
import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';
import styles from './style.module.scss';

interface Props<T extends FieldValues>
  extends ControlledBaseProps<T>, Partial<FileUploadProps> {
  disabled?: boolean;
  testId: string;
}

export const ControlledFileUpload = <T extends FieldValues>({
  name,
  control,
  label,
  disabled,
  forceRequired,
  defaultRequired,
  testId,
  description,
  allowDefaultValue,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const multiple = props.multiple ?? true;
  const readOnly = useIsFieldReadOnly(name);

  const previewChangesFormatter = (value: FileOrRelation[]) => {
    const fileNames =
      value?.map((file, i) => {
        const fileName =
          file instanceof File ? (file?.name ?? '') : (file?.FileName ?? '');

        return i === 0 ? fileName : ` ${fileName}`;
      }) || [];

    return fileNames.toString();
  };

  return (
    <Controller
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { ref, onChange, value } }) => {
        return (
          <FormField
            label={label}
            errorText={error?.message}
            stretch
            testId={testId}
            guidance={description}
            previewChangesFormatter={previewChangesFormatter}
            hasFieldChanged={(value) => {
              return !isEqual(value.from, value.to);
            }}
          >
            {!disabled && !readOnly && (
              <FileUpload
                {...{ className: styles.hideFiles }}
                accept={allowedFileExtensions.join(',')}
                ref={ref}
                value={
                  value?.files?.map((f: FileOrRelation) =>
                    f instanceof File ? f : new File([], f!.FileName)
                  ) || []
                }
                onChange={(e) => {
                  // For new file uploads, combine with existing files
                  const newFiles = e.detail.value;
                  const existingValue = value || [];
                  const combinedFiles = multiple
                    ? [...existingValue, ...newFiles]
                    : newFiles;
                  onChange(combinedFiles);
                }}
                showFileLastModified={true}
                showFileSize={true}
                multiple={multiple}
                i18nStrings={{
                  uploadButtonText: (e) => (e ? 'Choose files' : 'Choose file'),
                  dropzoneText: (e) =>
                    e ? 'Drop files to upload' : 'Drop file to upload',
                  removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
                  limitShowFewer: 'Show fewer files',
                  limitShowMore: 'Show more files',
                  errorIconAriaLabel: 'Error',
                }}
                {...props}
              />
            )}

            <div className={'files'}>
              <ControlledFileList
                disabled={disabled || readOnly}
                name={name}
                control={control}
              />
            </div>
          </FormField>
        );
      }}
    />
  );
};
