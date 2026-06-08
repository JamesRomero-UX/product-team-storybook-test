import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components';
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField } from 'src/components/form/form/FormField';
import PropertyFilterPanel from 'src/components/property-filter-panel';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';

type Props<T extends FieldValues> = ControlledBaseProps<T> & {
  testId?: string;
} & Omit<PropertyFilterProps, 'onChange' | 'query'> & {
    secondaryControl?: ReactNode;
    sideControl?: ReactNode;
  };

export const ControlledPropertyFilter = <T extends FieldValues>({
  name,
  control,
  label,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  disabled,
  testId,
  description,
  secondaryControl,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);
  const { t } = useTranslation(['common'], { keyPrefix: 'propertyFilter' });

  return (
    <Controller
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => {
        return (
          <FormField
            label={label}
            testId={testId}
            guidance={description}
            secondaryControl={secondaryControl}
            // The error contains messages on nested fields, so we just show a generic error
            errorText={error?.message ?? (error ? t('invalid') : undefined)}
          >
            <PropertyFilterPanel
              {...props}
              disabled={readOnly || disabled}
              i18nStrings={{
                ...defaultPropertyFilterI18nStrings,
              }}
              onChange={(e) => {
                onChange(e.detail);
              }}
              query={value ?? { tokens: [], tokenGroups: [], operation: 'and' }}
            />
          </FormField>
        );
      }}
    />
  );
};
