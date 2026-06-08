import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { Tag } from '@risksmart-app/web-graphql-client/derived-types';
import { isEqual } from 'lodash';
import type { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField } from 'src/components/form/form/FormField';
import Tokens from 'src/components/tokens/Tokens';

import type { TagType } from '@/types/index';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import { getSelectedOptions } from '../form-utils';
import Multiselect from '../multi-select';
import type { ControlledBaseProps } from '../types';
import styles from './style.module.scss';
import { useTagOptions } from './useTagOptions';

interface Props<T extends FieldValues = FieldValues> extends Omit<
  ControlledBaseProps<T>,
  'label'
> {
  control: Control<T>;
  label?: string;
  disabled?: boolean;
  hideTokens?: boolean;
  testId?: string;
  disableInfo?: boolean;
}

export const TagSelector = <T extends FieldValues = FieldValues>({
  control,
  label,
  name,
  placeholder,
  disabled,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  hideTokens,
  description,
  testId,
  disableInfo,
  ...props
}: Props<T>) => {
  const { tags, optionItems: options } = useTagOptions();
  const { t } = useTranslation(['common']);

  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  description = disableInfo ? '' : (description ?? t('fields.Tags_help'));
  label = label ?? t('fields.Tags');

  return (
    <Controller
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { ref, onChange, onBlur, value } }) => {
        const fieldValuesAsOptions = convertTagsToOptions(value || [], tags);
        const selectedOptions = getSelectedOptions(
          fieldValuesAsOptions,
          options
        );

        const selectedValues: TagType[] | undefined = value;
        const removeToken = (itemValue: string) => {
          const newOptions = (selectedValues ?? []).filter(
            (v) => v.TagTypeId !== itemValue
          );
          onChange(newOptions);
        };

        return (
          <FormField
            testId={testId}
            className={styles.root}
            label={label}
            guidance={description}
            errorText={error?.message}
            stretch
            hasFieldChanged={(val) => {
              if (!val) {
                return false;
              }

              return !isEqual(
                val.from?.map((f: Tag) => ({
                  ParentId: f.ParentId,
                  TagTypeId: f.TagTypeId,
                })),
                val.to
              );
            }}
            previewChangesFormatter={(
              val: [{ TagTypeId: string }] | null | undefined
            ) => {
              if (Array.isArray(val)) {
                return val
                  .map((v) => v.TagTypeId)
                  .map((v) => tags?.find((t) => t.TagTypeId === v)?.Name)
                  .join(', ');
              }

              return '-';
            }}
          >
            <Multiselect
              ref={ref}
              options={options}
              selectedOptions={selectedOptions}
              onBlur={onBlur}
              filteringType={'auto'}
              onChange={(e) => {
                onChange(convertOptionsToTagTypes(e.detail.selectedOptions));
              }}
              placeholder={placeholder ?? t('select')}
              empty={t('noMatchedFound')}
              disabled={disabled || readOnly}
              {...props}
              hideTokens
            />
            {!hideTokens && (
              <Tokens
                disabled={disabled || readOnly}
                onRemove={removeToken}
                tokens={selectedOptions.map((o) => ({
                  value: o.value!,
                  label: o.label!,
                }))}
              />
            )}
          </FormField>
        );
      }}
    />
  );
};

/*
  Converts a single tag option definition back to a tag type
*/
const convertOptionToTagType = (option: SelectProps.Option): TagType => ({
  Name: option.label || '',
  Description: option.description || '',
  TagTypeId: option.value || '',
});

/*
  Converts an array of option definitions back to tag types
*/
const convertOptionsToTagTypes = (
  options: readonly SelectProps.Option[]
): Array<TagType> | TagType =>
  options.map((option) => convertOptionToTagType(option));

/*
  Converts a single tag type to a single tag option definition
*/
const convertTagTypeToOption = (tag: TagType): SelectProps.Option => ({
  label: tag.Name || '',
  description: tag.Description || '',
  value: tag.TagTypeId,
});

function convertTagsToOptions(
  input: Array<TagType> | TagType,
  tagTypes: Array<TagType>
): SelectProps.Option[] {
  const tags = Array.isArray(input) ? input : [input];

  return tags.map((tag) => {
    const tagType = tagTypes.find(
      ({ TagTypeId }) => TagTypeId === tag.TagTypeId
    );
    if (!tagType) {
      return {};
    }

    return convertTagTypeToOption(tagType);
  });
}
