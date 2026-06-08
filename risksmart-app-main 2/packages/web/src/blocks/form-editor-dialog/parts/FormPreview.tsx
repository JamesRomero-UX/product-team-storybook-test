import {
  Accordion,
  Alert,
  AlertDescription,
  AlertHeader,
  AlertTitle,
  Checkbox,
  cn,
  Field,
  FieldTitle,
  Icon,
  Input,
  RadioGroup,
  RadioItem,
  Select,
  Textarea as AtomicTextarea,
} from '@risksmart-app/atomic-ui';
import { useState } from 'react';

import type { FieldEditorValues } from '../config';
import type { FieldSummary } from '../constants';

export const PreviewField = ({
  field,
  fieldConfig,
}: {
  field: FieldSummary;
  fieldConfig?: FieldEditorValues;
}) => {
  const options = fieldConfig?.options ?? [];

  return (
    <Field>
      <FieldTitle>
        {field.name}
        {field.required ? (
          <span className={'text-destructive ml-0.5'}>{'*'}</span>
        ) : null}
      </FieldTitle>
      {field.type === 'text' ||
      field.type === 'url' ||
      field.type === 'date' ||
      field.type === 'number' ? (
        <Input
          placeholder={'Placeholder text'}
          disabled={field.readOnly}
          type={
            field.type === 'date'
              ? 'date'
              : field.type === 'number'
                ? 'number'
                : 'text'
          }
        />
      ) : null}
      {field.type === 'textArea' ? (
        <AtomicTextarea
          placeholder={'Placeholder text'}
          rows={3}
          disabled={field.readOnly}
        />
      ) : null}
      {field.type === 'radio' ? (
        <RadioGroup defaultValue={options[0]?.id} disabled={field.readOnly}>
          {options.map((opt, i) => (
            <label
              key={opt.id}
              className={'flex items-center gap-2 text-sm cursor-pointer'}
            >
              <RadioItem value={opt.id} />
              {opt.label || `Option ${i + 1}`}
            </label>
          ))}
        </RadioGroup>
      ) : null}
      {field.type === 'dropdown' ? (
        <Select
          items={[
            { label: 'Select...', value: null },
            ...options.map((opt) => ({
              label: opt.label || `Option`,
              value: opt.id,
            })),
          ]}
          disabled={field.readOnly}
        />
      ) : null}
      {field.type === 'multiselect' ? (
        <div
          className={cn(
            'flex flex-col gap-1.5 rounded-lg border border-neutral-border p-3'
          )}
        >
          {options.map((opt, i) => (
            <label
              key={opt.id}
              className={'flex items-center gap-2 text-sm cursor-pointer'}
            >
              <Checkbox size={'md'} disabled={field.readOnly} />
              {opt.label || `Option ${i + 1}`}
            </label>
          ))}
        </div>
      ) : null}
    </Field>
  );
};

export const FormPreview = ({
  containerOrder,
  containers,
  fields,
  sectionNames,
  fieldConfigs,
}: {
  containerOrder: string[];
  containers: Record<string, string[]>;
  fields: Record<string, FieldSummary>;
  sectionNames: Record<string, string>;
  fieldConfigs: Record<string, FieldEditorValues>;
}) => {
  const [openSections, setOpenSections] = useState<string[]>(
    containerOrder.length > 0 ? [containerOrder[0]] : []
  );

  return (
    <div className={cn('flex flex-col gap-4')}>
      <Alert
        variant={'active'}
        className={
          'bg-secondary-minimal [&>svg]:text-primary [&>svg]:self-start [&>svg]:mt-0.5'
        }
      >
        <Icon name={'eye'} size={'lg'} />
        <AlertHeader>
          <AlertTitle className={'text-primary'}>
            {'Preview mode active'}
          </AlertTitle>
        </AlertHeader>
        <AlertDescription className={'text-primary'}>
          {
            'Interact with the form to test conditional logic. Fields and sections will show/hide based on your responses.'
          }
        </AlertDescription>
      </Alert>
      <Accordion multiple value={openSections} onValueChange={setOpenSections}>
        {containerOrder.map((sectionId) => {
          const fieldIds = containers[sectionId] ?? [];

          return (
            <Accordion.Item key={sectionId} value={sectionId}>
              <Accordion.Header>
                <Accordion.Trigger>
                  {sectionNames[sectionId] ?? sectionId}
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <div className={cn('flex flex-col gap-4')}>
                  {fieldIds.map((fieldId) => {
                    const field = fields[fieldId];
                    if (!field) {
                      return null;
                    }

                    return (
                      <PreviewField
                        key={fieldId}
                        field={field}
                        fieldConfig={fieldConfigs[fieldId]}
                      />
                    );
                  })}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
};
