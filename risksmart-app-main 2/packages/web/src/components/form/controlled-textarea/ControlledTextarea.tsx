import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
import type { PromptId } from '@risksmart-app/shared/ai/PromptId';
import type { ReactNode } from 'react';
import type { FieldValues, Noop, RefCallBack } from 'react-hook-form';
import { FormField } from 'src/components/form/form/FormField';
import type { Content } from 'src/components/help-panel/useHelpStore';
import TextInferenceItem from 'src/components/text-inference/TextInferenceItem';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';
import styles from './style.module.scss';

interface TextareaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: Noop;
  additionalPrompts?: [{ id: PromptId; text: string; altPromptText?: string }];
  innerRef?: RefCallBack;
  name?: string;
  errorMessage?: string;
  disabled?: boolean;
  inferenceDisabled?: boolean;
  placeholder?: string;
  className?: string;
  testId?: string;
  info?: ReactNode;
  guidance?: Content | undefined;
}

export const TextareaInput = ({
  label,
  value,
  onChange,
  onBlur,
  errorMessage,
  innerRef,
  name,
  additionalPrompts,
  disabled = false,
  inferenceDisabled = false,
  placeholder = '',
  testId,
  info,
  ...rest
}: TextareaInputProps) => {
  const disableInference = inferenceDisabled ? true : disabled;

  return (
    <div>
      <FormField
        info={info}
        label={label}
        errorText={errorMessage}
        stretch
        testId={testId}
        guidance={rest.guidance}
      >
        <div className={'relative'}>
          <Textarea
            {...{ className: styles.textarea }}
            ref={innerRef}
            name={name}
            value={value}
            onBlur={onBlur}
            onChange={(e) => onChange(e.detail.value)}
            disabled={disabled}
            placeholder={placeholder}
            {...rest}
          />
          {!disableInference && (
            <div className={'absolute top-[6px] right-[6px]'}>
              <TextInferenceItem
                bodyText={value}
                onChange={onChange}
                additionalPrompts={additionalPrompts}
              />
            </div>
          )}
        </div>
      </FormField>
    </div>
  );
};

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  disabled?: boolean;
  readOnly?: boolean;
  additionalPrompts?: [{ id: PromptId; text: string; altPromptText?: string }];
  testId?: string;
}

export const ControlledTextarea = <T extends FieldValues>({
  name,
  label,
  control,
  additionalPrompts,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  testId,
  description,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  return (
    <Controller
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { ref, onChange, onBlur, value } }) => (
        <TextareaInput
          label={label}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          innerRef={ref}
          testId={testId}
          name={name}
          guidance={description}
          errorMessage={error?.message}
          additionalPrompts={additionalPrompts}
          {...props}
          disabled={readOnly || props.disabled}
        />
      )}
    />
  );
};
