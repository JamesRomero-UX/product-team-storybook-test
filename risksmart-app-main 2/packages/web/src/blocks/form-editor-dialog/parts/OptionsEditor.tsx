import {
  Button,
  cn,
  FieldError,
  FieldTitle,
  Icon,
  Input,
} from '@risksmart-app/atomic-ui';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import type { FieldEditorValues } from '../config';

export const OptionsEditor = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<FieldEditorValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });
  const optionsError =
    errors.options && !Array.isArray(errors.options)
      ? (errors.options as { message?: string }).message
      : undefined;

  return (
    <div className={cn('flex flex-col gap-3')}>
      <FieldTitle>{'Options'}</FieldTitle>
      {fields.map((item, index) => (
        <Controller
          key={item.id}
          control={control}
          name={`options.${index}.label`}
          render={({ field, fieldState }) => (
            <div className={cn('flex items-center gap-2')}>
              <div className={cn('flex-1')}>
                <Input
                  placeholder={`Option ${index + 1}`}
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </div>
              <Button
                variant={'destructive'}
                style={'ghost'}
                size={'icon'}
                className={cn('p-0 size-auto shrink-0')}
                onClick={() => remove(index)}
              >
                <Icon name={'trash-2'} size={'sm'} />
              </Button>
            </div>
          )}
        />
      ))}
      {optionsError ? <FieldError>{optionsError}</FieldError> : null}
      <Button
        style={'dashed-fill'}
        radius={'xl'}
        className={'w-full'}
        onClick={() =>
          append({ id: `opt-${Date.now()}-${fields.length}`, label: '' })
        }
      >
        <Icon name={'plus'} size={'sm'} />
        {'Add option'}
      </Button>
    </div>
  );
};
