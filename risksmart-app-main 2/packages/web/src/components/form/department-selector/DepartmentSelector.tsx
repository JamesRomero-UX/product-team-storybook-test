import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { Department } from '@risksmart-app/web-graphql-client/derived-types';
import { isEqual } from 'lodash';
import type { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField } from 'src/components/form/form/FormField';
import Tokens from 'src/components/tokens';

import type { DepartmentType } from '@/types/index';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import { getSelectedOptions } from '../form-utils';
import Multiselect from '../multi-select';
import type { ControlledBaseProps } from '../types';
import styles from './style.module.scss';
import { useDepartmentOptions } from './useDepartmentOptions';

interface Props<T extends FieldValues = FieldValues> extends Omit<
  ControlledBaseProps<T>,
  'label'
> {
  control: Control<T>;
  label?: string;
  disabled?: boolean;
  hiddenTokens?: boolean;
  disableInfo?: boolean;
}

export const DepartmentSelector = <T extends FieldValues = FieldValues>({
  control,
  label,
  name,
  placeholder,
  disabled,
  forceRequired,
  hiddenTokens,
  defaultRequired,
  allowDefaultValue,
  description,
  disableInfo = false,
  testId,
  ...props
}: Props<T>) => {
  const { t } = useTranslation();
  const { departments, optionItems: options } = useDepartmentOptions();
  label = label ?? t('fields.Departments');
  description = disableInfo
    ? ''
    : (description ?? t('fields.Departments_help'));

  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  return (
    <Controller
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { ref, onChange, onBlur, value } }) => {
        const fieldValuesAsOptions = convertDepartmentsToOptions(
          value || [],
          departments
        );
        const selectedOptions = getSelectedOptions(
          fieldValuesAsOptions,
          options
        );

        const selectedValues: DepartmentType[] | undefined = value;
        const removeToken = (itemValue: string) => {
          onChange(
            (selectedValues ?? []).filter(
              (v) => v.DepartmentTypeId !== itemValue
            )
          );
        };

        return (
          <div className={styles.root}>
            <FormField
              testId={testId}
              label={label}
              errorText={error?.message}
              stretch
              guidance={description}
              hasFieldChanged={(val) => {
                if (!val) {
                  return false;
                }

                return !isEqual(
                  val.from?.map((f: Department) => ({
                    ParentId: f.ParentId,
                    DepartmentTypeId: f.DepartmentTypeId,
                  })),
                  val.to
                );
              }}
              previewChangesFormatter={(
                val: [{ DepartmentTypeId: string }] | null | undefined
              ) => {
                if (Array.isArray(val)) {
                  return val
                    .map((v) => v.DepartmentTypeId)
                    .map(
                      (v) =>
                        departments?.find((d) => d.DepartmentTypeId === v)?.Name
                    )
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
                  onChange(
                    convertOptionsToDepartmentTypes(e.detail.selectedOptions)
                  );
                }}
                placeholder={placeholder ?? t('select')}
                empty={t('noMatchedFound')}
                disabled={disabled || readOnly}
                {...props}
                hideTokens
              />
              {!hiddenTokens && (
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
          </div>
        );
      }}
    />
  );
};

/*
  Converts a single department option definition back to a department type
*/
const convertOptionToDepartmentType = (
  option: SelectProps.Option
): DepartmentType => ({
  Name: option.label || '',
  Description: option.description || '',
  DepartmentTypeId: option.value || '',
});

/*
  Converts an array of option definitions back to department types
*/
const convertOptionsToDepartmentTypes = (
  options: readonly SelectProps.Option[]
): Array<DepartmentType> | DepartmentType =>
  options.map((option) => convertOptionToDepartmentType(option));

/*
  Converts a single department type to a single department option definition
*/
const convertDepartmentTypeToOption = (
  department: DepartmentType
): SelectProps.Option => ({
  label: department.Name || '',
  description: department.Description || '',
  value: department.DepartmentTypeId,
});

function convertDepartmentsToOptions(
  input: Array<DepartmentType> | DepartmentType,
  departmentTypes: Array<DepartmentType>
): SelectProps.Option[] {
  const departments = Array.isArray(input) ? input : [input];

  return departments.map((department) => {
    const departmentType = departmentTypes.find(
      ({ DepartmentTypeId }) => DepartmentTypeId === department.DepartmentTypeId
    );
    if (!departmentType) {
      return {};
    }

    return convertDepartmentTypeToOption(departmentType);
  });
}
