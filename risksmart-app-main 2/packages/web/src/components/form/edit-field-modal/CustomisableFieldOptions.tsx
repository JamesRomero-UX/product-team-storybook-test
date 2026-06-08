import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import _ from 'lodash';
import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ControlledInput from '../controlled-input';
import ControlledSelect from '../controlled-select';
import {
  ControlledSwitch,
  Switch,
} from '../controlled-switch/ControlledSwitch';
import type {
  FormFieldOptions,
  OptionsSchema,
} from '../custom-attributes/edit-fields/fieldSchema';
import { fieldTypesConfig } from '../custom-attributes/field-types';
import type { ControlledBaseProps } from '../types';

type Props = {
  defaultValueOptions: SelectProps.Options;
  forceRequired: boolean;
  allowDefaultValue: boolean;
  type: CustomAttributeFieldType;
  options: OptionsSchema;
};

/**
 * Component for customizing field behavior
 * @param param0
 * @returns
 */
const CustomisableFieldOptions: FC<Props> = ({
  defaultValueOptions,
  forceRequired,
  allowDefaultValue,
  type,
  options,
}) => {
  const { control, watch, setValue } = useFormContext<FormFieldOptions>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'customAttributes.fields',
  });

  let defaultValueInput: ReactNode;
  const defaultValueDefaultProps: ControlledBaseProps<FormFieldOptions> & {
    testId: string;
  } = {
    name: 'DefaultValue',
    control,
    label: st('defaultValue'),
    testId: 'defaultValue',
  };
  if (type) {
    const props = {
      ...defaultValueDefaultProps,
      options:
        options?.map((o) => ({
          value: o.AltValue ?? o.Value,
          label: o.Value,
        })) ?? [],
    };

    const fieldConfigType = fieldTypesConfig[type];
    const DefaultComponent = fieldConfigType.DefaultValueComponent;
    if (DefaultComponent) {
      defaultValueInput = <DefaultComponent {...props} />;
    }
  } else {
    if (defaultValueOptions.length > 0) {
      defaultValueInput = (
        <ControlledSelect
          {...defaultValueDefaultProps}
          options={defaultValueOptions}
        />
      );
    } else {
      defaultValueInput = <ControlledInput {...defaultValueDefaultProps} />;
    }
  }

  const required = watch('Required');
  const hidden = watch('Hidden');
  const readOnly = watch('ReadOnly');
  const defaultValue = watch('DefaultValue');
  const [enableDefaultValue, setEnableDefaultValue] = useState<boolean>(
    () => !_.isNil(defaultValue)
  );

  useEffect(() => {
    if (required) {
      setValue('Hidden', false);
      setValue('ReadOnly', false);
    }
  }, [required, setValue]);

  useEffect(() => {
    if (hidden) {
      setValue('Required', false);
      setValue('ReadOnly', false);
    }
  }, [hidden, setValue]);

  useEffect(() => {
    if (readOnly) {
      setValue('Required', false);
      setValue('Hidden', false);
    }
  }, [readOnly, setValue]);

  return (
    <FormField label={st('options')}>
      <SpaceBetween size={'xxs'} direction={'vertical'}>
        <ControlledSwitch
          disabled={forceRequired}
          name={'Required'}
          control={control}
          label={st('required')}
          testId={'Required'}
        />
        <ControlledSwitch
          disabled={forceRequired}
          name={'Hidden'}
          control={control}
          label={st('hidden')}
          testId={'Hidden'}
        />
        <ControlledSwitch
          disabled={forceRequired}
          name={'ReadOnly'}
          control={control}
          label={st('readOnly')}
          testId={'ReadOnly'}
        />
        {allowDefaultValue && !!defaultValueInput && (
          <>
            <Switch
              name={'EnableDefaultValue'}
              checked={enableDefaultValue}
              label={st('setDefaultValue')}
              testId={'EnableDefaultValue'}
              onChange={(e) => {
                if (!e.detail.checked) {
                  setValue('DefaultValue', null);
                }
                setEnableDefaultValue(e.detail.checked);
              }}
            />
            {enableDefaultValue && defaultValueInput}
          </>
        )}
      </SpaceBetween>
    </FormField>
  );
};

export default CustomisableFieldOptions;
