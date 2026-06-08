import type { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import type { FormFieldOption } from '@risksmart-app/form-configuration/src/types';
import { ErrorBoundary } from '@sentry/react';
import { useFormContext } from 'react-hook-form';

import { getCustomAttributeRenderProps } from '@/utils/table/utils/customAttributes';

import { Controller } from '../field-controller/Controller';
import { useCustomisableFormDataContext } from '../form/customisable-form-data/CustomisableFormDataContext';
import { CustomFieldProvider } from './context/CustomFieldProvider';
import { fieldTypesConfig } from './field-types';
import type { CustomAttributeProps } from './renderers/field-layouts/CustomAttributeProps';

type Props = {
  name?: string;
  readOnly?: boolean;
};

function useControlledCustomAttributes({
  name = 'CustomAttributeData',
  readOnly,
}: Props) {
  const { control } = useFormContext();
  const { formFieldConfigurations, customAttributeSchema } =
    useCustomisableFormDataContext();
  if (!customAttributeSchema) {
    return [];
  }

  const { Schema, UiSchema } = customAttributeSchema;

  const elements = (UiSchema.elements ?? []).filter(
    (el) => el.type === 'Control'
  );

  if (elements.length === 0) {
    return [];
  }

  const renderProps = getCustomAttributeRenderProps(Schema, UiSchema);

  return renderProps.map((renderProp) => {
    const fieldId = `${name}.${renderProp.path}`;
    const formFieldConfiguration = formFieldConfigurations?.find(
      (f) => f.FieldId === fieldId
    );
    const fieldReadOnly = formFieldConfiguration?.ReadOnly;
    const fieldRequired = formFieldConfiguration?.Required;
    const fieldHidden = formFieldConfiguration?.Hidden;
    const property = Schema.properties![renderProp.path];
    const type: CustomAttributeFieldType = renderProp.type;
    const fieldConfig = fieldTypesConfig[type];
    if (!fieldConfig) {
      console.warn(
        `No field type config found for type: ${type} at path: ${renderProp.path}`
      );

      return null;
    }

    return (
      <ErrorBoundary
        key={renderProp.scope}
        onError={(error) =>
          console.error('failed to render custom attributes', error)
        }
        fallback={<p>{'Failed to load custom field'}</p>}
      >
        <Controller
          defaultRequired={false}
          forceRequired={false}
          allowDefaultValue={fieldConfig.supportsDefaultValue}
          name={`${name}.${renderProp.path}`}
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            const props: CustomAttributeProps = {
              value,
              onChange,
              label: renderProp.label,
              altLabel: renderProp.altLabel,
              error: error?.message,
              disabled: fieldReadOnly || readOnly,
              description: property.description,
              schema: property,
            };

            const ControlledInputComp = fieldConfig.FieldComponent;

            const getOptions = (): FormFieldOption[] | null => {
              if (!fieldConfig.hasOptions) {
                return null;
              }

              if (property.enum) {
                return property.enum.map((option) => ({
                  _tag: 'StringOption',
                  Value: option.toString(),
                  GeneratedId: crypto.randomUUID(),
                }));
              }

              if (property.oneOf) {
                return property.oneOf.map((option) => ({
                  _tag: 'AltValueOption',
                  AltValue: option.const ?? '',
                  Value: option.title ?? '',
                  GeneratedId: crypto.randomUUID(),
                }));
              }

              return null;
            };

            const fieldOptions = getOptions() ?? undefined;

            return (
              <CustomFieldProvider
                fieldPath={renderProp.path}
                currentField={{
                  Label: props.label,
                  AltLabel: props.altLabel,
                  Type: type,
                  ShowAltValues:
                    fieldOptions?.some((o) => o._tag === 'AltValueOption') ??
                    false,
                  Options: fieldConfig.hasOptions ? fieldOptions : undefined,
                  Required: !!fieldRequired,
                  ReadOnly: fieldReadOnly || readOnly || false,
                  Hidden: !!fieldHidden,
                  Description: property.description,
                }}
              >
                {<ControlledInputComp {...props} />}
              </CustomFieldProvider>
            );
          }}
        />
      </ErrorBoundary>
    );
  });
}

export default useControlledCustomAttributes;
