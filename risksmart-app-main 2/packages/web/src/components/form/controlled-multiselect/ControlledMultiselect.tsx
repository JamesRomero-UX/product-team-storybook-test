import type { MultiselectProps } from '@risk-smart/themed-cloudscape-components/multiselect';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { FieldValues, RefCallBack } from 'react-hook-form';
import { FormField } from 'src/components/form/form/FormField';
import type { Content } from 'src/components/help-panel/useHelpStore';
import { SideControlContainer } from 'src/components/SideControlContainer';
import Tokens from 'src/components/tokens';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import FormRow from '../form/FormRow';
import HideableMultiselect from '../multi-select/HideableMultiselect';
import type { ControlledBaseProps } from '../types';
import type { HidableOption, HidableOptionGroup } from './types';
import useFilterHiddenOptions from './useFilterHiddenOptions';

type Props<T extends FieldValues> = ControlledBaseProps<T> & {
  testId?: string;
  options: ReadonlyArray<HidableOption>;
  onChange?: (options: readonly HidableOption[]) => void;
  renderTokens?: boolean;
  customTokenRender?: (
    options: HidableOption[],
    actions: { removeToken: (value: string) => void }
  ) => ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previewChangesFormatter?: (value: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hasFieldChanged?: (value: any) => boolean;
} & Omit<MultiselectProps, 'onChange' | 'options' | 'selectedOptions'> & {
    secondaryControl?: ReactNode;
    sideControl?: ReactNode;
  };

interface MultiSelectInputProps extends MultiselectProps {
  label: string;
  innerRef?: RefCallBack;
  errorMessage?: string;
  testId?: string;
  tokenSection: ReactNode;
  description?: Content;
  renderTokens?: boolean;
  secondaryControl?: ReactNode;
  sideControl?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previewChangesFormatter?: (value: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hasFieldChanged?: (value: any) => boolean;
}

export const MultiSelect = ({
  label,
  options,
  testId,
  description,
  secondaryControl,
  sideControl,
  errorMessage,
  tokenSection,
  renderTokens,
  innerRef,
  previewChangesFormatter,
  hasFieldChanged,
  ...props
}: MultiSelectInputProps) => {
  return (
    <FormField
      label={label}
      errorText={errorMessage}
      stretch
      testId={testId}
      guidance={description}
      secondaryControl={secondaryControl}
      previewChangesFormatter={previewChangesFormatter}
      hasFieldChanged={hasFieldChanged}
    >
      <FormRow>
        <SideControlContainer sideControl={sideControl}>
          <HideableMultiselect
            virtualScroll={(options || []).length >= 500}
            hideTokens={!!renderTokens}
            ref={innerRef}
            // TODO: translation
            placeholder={'Enter value'}
            empty={'No matches found'}
            options={options}
            {...props}
          />
        </SideControlContainer>
        {tokenSection}
      </FormRow>
    </FormField>
  );
};

export const ControlledMultiselect = <T extends FieldValues>({
  name,
  control,
  label,
  onChange: _onChange,
  options,
  renderTokens,
  customTokenRender,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  disabled,
  testId,
  description,
  secondaryControl,
  sideControl,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  const filteredOptions = useFilterHiddenOptions(options);

  const getSelectedOptions = (
    selectedOptions?: HidableOption[]
  ): HidableOption[] => {
    const selectedOptionDefinitions: HidableOption[] = [];

    const getValue = (item: unknown): string | undefined => {
      if (!item) {
        return undefined;
      }
      if (typeof item === 'string') {
        return item;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (item as any).value ?? (item as any).Id;
    };
    const selectedValues = selectedOptions?.map(getValue).filter(Boolean);

    if (!selectedValues || selectedValues.length === 0) {
      return [];
    }

    for (const option of options) {
      if ('value' in option) {
        if (selectedValues.includes(option.value)) {
          selectedOptionDefinitions.push(option);
          continue;
        }
      }
      if ('options' in option) {
        for (const childOption of (option as HidableOptionGroup).options) {
          if ('value' in childOption) {
            if (selectedValues.includes(childOption.value)) {
              selectedOptionDefinitions.push(childOption);
              continue;
            }
          }
        }
      }
    }

    return selectedOptionDefinitions;
  };

  // Count the number of options, including nested options
  const optionCount = useMemo(
    () =>
      filteredOptions.reduce((previous, current) => {
        if ('options' in current) {
          previous += (current as HidableOptionGroup).options.length;
        }

        return previous + 1;
      }, 0),
    [filteredOptions]
  );

  return (
    <Controller
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { ref, onChange, onBlur, value } }) => {
        const selectedValues: MultiselectProps.Option[] | undefined = value;
        const removeToken = (itemValue: string) => {
          const newOptions = (selectedValues ?? []).filter(
            (v) => v.value !== itemValue
          );
          _onChange?.(newOptions);
          onChange(newOptions);
        };
        const currentSelectedOptions = getSelectedOptions(value);
        let tokenSection: ReactNode = <></>;
        if (renderTokens) {
          if (customTokenRender) {
            tokenSection = customTokenRender(currentSelectedOptions, {
              removeToken,
            });
          } else {
            tokenSection = (
              <Tokens
                disabled={disabled || readOnly}
                onRemove={removeToken}
                tokens={currentSelectedOptions.map((o) => ({
                  value: o.value!,
                  label: o.label!,
                }))}
              />
            );
          }
        }

        return (
          <MultiSelect
            secondaryControl={secondaryControl}
            description={description}
            tokenSection={tokenSection}
            sideControl={sideControl}
            disabled={disabled || readOnly}
            virtualScroll={optionCount >= 500}
            hideTokens={!!renderTokens}
            innerRef={ref}
            selectedOptions={currentSelectedOptions}
            onBlur={onBlur}
            onChange={(e) => {
              _onChange?.(e.detail.selectedOptions);
              // Strip React elements (iconSvg) before storing in
              // react-hook-form — its deepEqual hangs on them.
              const formValues = e.detail.selectedOptions.map(
                ({ iconSvg: _iconSvg, ...rest }) => rest
              );
              onChange(formValues);
            }}
            options={filteredOptions}
            // TODO: translation
            placeholder={'Enter value'}
            empty={'No matches found'}
            testId={testId}
            errorMessage={error?.message}
            label={label}
            renderTokens={renderTokens}
            {...props}
          />
        );
      }}
    />
  );
};
