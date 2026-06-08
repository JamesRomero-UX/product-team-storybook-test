import {
  Field,
  FieldError,
  FieldTitle,
  Input,
  Select,
  Textarea as AtomicTextarea,
} from '@risksmart-app/atomic-ui';
import { Controller, useFormContext } from 'react-hook-form';

export const FormTextField = ({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder?: string;
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error || undefined}>
          <FieldTitle>{label}</FieldTitle>
          <Input
            placeholder={placeholder}
            aria-invalid={!!fieldState.error}
            {...field}
          />
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );
};

export const FormTextareaField = ({
  name,
  label,
  placeholder,
  optional,
  rows = 3,
}: {
  name: string;
  label: string;
  placeholder?: string;
  optional?: boolean;
  rows?: number;
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error || undefined}>
          <FieldTitle>
            {label}
            {optional ? (
              <span className={'text-muted-foreground ml-1'}>
                {'(optional)'}
              </span>
            ) : null}
          </FieldTitle>
          <AtomicTextarea
            placeholder={placeholder}
            rows={rows}
            aria-invalid={!!fieldState.error}
            {...field}
            value={field.value ?? ''}
          />
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );
};

export const FormSelectField = ({
  name,
  label,
  placeholder,
  options,
}: {
  name: string;
  label: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}) => {
  const { control } = useFormContext();

  const items = [
    { label: placeholder ?? 'Select...', value: null },
    ...options,
  ];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error || undefined}>
          <FieldTitle>{label}</FieldTitle>
          <Select
            items={items}
            value={field.value}
            onValueChange={field.onChange}
          />
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );
};
