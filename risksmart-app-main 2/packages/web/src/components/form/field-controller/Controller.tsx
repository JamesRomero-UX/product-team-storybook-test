import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import { useEffect } from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { Controller as RHFController } from 'react-hook-form';

import { useRiskSmartForm } from '../form/customisable-form/RiskSmartFormContext';
import { ControlledFieldContext } from './ControlledFieldContext';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName> & {
  /**
   * Ensures a non-custom fields required value cannot be updated. Note:
   * forceRequired fields also need to be set to required on the zod schema
   * (optional) is not added to the label
   */
  forceRequired?: boolean;
  /**
   * Sets initial required status (which can be overridden by custom config)
   * Automatically adds required to the zod schema (unless overridden by custom
   * config) Adds (optional) to the field label (unless overridden by custom config)
   */
  defaultRequired?: boolean;

  /**
   * Allow a fields default value to be configured
   */
  allowDefaultValue?: boolean;

  /**
   * Allowed default value options for select/radio
   */
  defaultValueOptions?: SelectProps.Options;
};

export const Controller = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  forceRequired = false,
  defaultRequired = false,
  allowDefaultValue = false,
  defaultValueOptions,
  ...props
}: Props<TFieldValues, TName>) => {
  const { render, ...controllerProps } = props;
  const {
    addDefaultRequiredField,
    addForcedRequiredField,
    addFieldId,
    removeFieldId,
    removeDefaultRequiredField,
    removeForcedRequiredField,
    removeAllowDefaultValueField,
    addAllowDefaultValueField,
  } = useRiskSmartForm();

  useEffect(() => {
    addFieldId(props.name);

    return () => removeFieldId(props.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.name && defaultRequired) {
      addDefaultRequiredField(props.name);
    }

    return () => removeDefaultRequiredField(props.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.name, defaultRequired]);

  useEffect(() => {
    if (props.name && forceRequired) {
      addForcedRequiredField(props.name);
    }

    return () => removeForcedRequiredField(props.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.name, forceRequired]);

  useEffect(() => {
    if (props.name && allowDefaultValue) {
      addAllowDefaultValueField(props.name);
    }

    return () => removeAllowDefaultValueField(props.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.name, allowDefaultValue]);

  const wrappedRender = (options: Parameters<typeof render>[0]) => {
    return (
      <ControlledFieldContext.Provider
        value={{
          ...options,
          forceRequired,
          defaultRequired,
          allowDefaultValue,
          defaultValueOptions,
        }}
      >
        {render(options)}
      </ControlledFieldContext.Provider>
    );
  };

  return <RHFController render={wrappedRender} {...controllerProps} />;
};
