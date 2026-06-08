import {
  Button,
  Checkbox,
  cn,
  Icon,
  Select,
  Text,
} from '@risksmart-app/atomic-ui';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import type { ConditionalLogicOption } from '../types';

export const ConditionalLogicRuleBuilder = ({
  fieldOptions,
  getValueOptions,
  showOptions,
  description,
}: {
  fieldOptions: ConditionalLogicOption[];
  getValueOptions?: (fieldValue: string) => ConditionalLogicOption[];
  showOptions: ConditionalLogicOption[];
  description?: string;
}) => {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conditionalLogicRules',
  });

  return (
    <div className={cn('flex flex-col gap-4')}>
      <Text preset={'body'} className={'text-sm font-semibold text-secondary'}>
        {description ??
          'Show this section based on the output from another field'}
      </Text>
      {fields.map((rule, index) => {
        const selectedIfField = watch(`conditionalLogicRules.${index}.ifField`);
        const valueOptions = getValueOptions?.(selectedIfField) ?? [];

        return (
          <div
            key={rule.id}
            className={cn(
              'rounded-lg border border-neutral-border bg-muted/30 p-4 flex flex-col gap-3'
            )}
          >
            <div className={cn('flex items-center justify-between')}>
              <Text preset={'body'} className={'font-semibold text-sm'}>
                {`Rule ${index + 1}`}
              </Text>
              <Button
                variant={'neutral'}
                style={'ghost'}
                size={'icon'}
                className={cn('p-0 size-auto')}
                onClick={() => remove(index)}
              >
                <Icon name={'trash-2'} size={'sm'} />
              </Button>
            </div>
            <Controller
              control={control}
              name={`conditionalLogicRules.${index}.ifField`}
              render={({ field }) => (
                <div className={cn('flex items-center gap-3')}>
                  <Text
                    preset={'body'}
                    className={
                      'text-sm text-secondary font-semibold shrink-0 w-[60px]'
                    }
                  >
                    {'If'}
                  </Text>
                  <Select
                    items={[
                      { label: 'Choose a question', value: null },
                      ...fieldOptions,
                    ]}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </div>
              )}
            />
            {valueOptions.length > 0 ? (
              <Controller
                control={control}
                name={`conditionalLogicRules.${index}.values`}
                render={({ field: valuesField }) => {
                  const toggleValue = (val: string) => {
                    const current = valuesField.value ?? [];
                    const next = current.includes(val)
                      ? current.filter((v: string) => v !== val)
                      : [...current, val];
                    valuesField.onChange(next);
                  };

                  return (
                    <div className={cn('flex items-start gap-3')}>
                      <Text
                        preset={'body'}
                        className={
                          'text-sm text-secondary font-semibold shrink-0 w-[60px] mt-2'
                        }
                      >
                        {'Is equal to'}
                      </Text>
                      <div
                        className={cn(
                          'flex-1 rounded-md border border-neutral-border p-3 flex flex-col gap-2'
                        )}
                      >
                        <Text
                          preset={'body'}
                          className={
                            'text-sm text-muted-foreground font-semibold'
                          }
                        >
                          {'Select trigger inputs:'}
                        </Text>
                        {valueOptions.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'flex items-center gap-2 rounded py-1 pl-1.5 text-sm cursor-pointer'
                            )}
                          >
                            <Checkbox
                              size={'md'}
                              checked={(valuesField.value ?? []).includes(
                                option.value
                              )}
                              onCheckedChange={() => toggleValue(option.value)}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
            ) : null}
            <Controller
              control={control}
              name={`conditionalLogicRules.${index}.showField`}
              render={({ field }) => (
                <div className={cn('flex items-center gap-3')}>
                  <Text
                    preset={'body'}
                    className={
                      'text-sm text-secondary font-semibold shrink-0 w-[60px]'
                    }
                  >
                    {'Show'}
                  </Text>
                  <Select
                    items={[
                      { label: 'this section', value: null },
                      ...showOptions,
                    ]}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
        );
      })}
      <Button
        style={'dashed-fill'}
        radius={'xl'}
        className={'w-full'}
        onClick={() => append({ ifField: '', values: [], showField: '' })}
      >
        <Icon name={'plus'} size={'sm'} />
        {'Add rule'}
      </Button>
    </div>
  );
};
