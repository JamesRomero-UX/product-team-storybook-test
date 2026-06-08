import type { JsonSchema7, UISchemaElement } from '@jsonforms/core';
import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components';
import type { OrgFeature } from '@risksmart-app/modules/src/index';
import type {
  FieldRegistryLookup,
  FormId,
} from '@risksmart-app/shared/forms/formConfigRegistry';
import { getFormConfigRegistry } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { FormFieldConfig } from '@risksmart-app/shared/forms/types';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';
import { displayTypes } from 'src/pages/custom-datasources/update/display-types';
import type {
  AdditionalData,
  Helpers,
} from 'src/pages/custom-datasources/update/display-types/types';
import { getCustomAttributeRenderProps } from 'src/utils/table/utils/customAttributes';

import { fieldTypesConfig } from '../custom-attributes/field-types';

export const getFormFieldConfig = (
  { formId, fieldId }: FieldRegistryLookup,
  enabledFeatures: OrgFeature[]
): FormFieldConfig | undefined => {
  const formRegistry = getFormConfigRegistry(enabledFeatures);

  return formRegistry[formId as keyof typeof formRegistry]?.[
    fieldId as keyof (typeof formRegistry)[FormId]
  ] as FormFieldConfig | undefined;
};

export const getConditionalPropertyFilterProps = ({
  formId,
  schema,
  uiSchema,
  data,
  helpers,
  enabledFeatures,
  excludedFieldIds,
  getStandardFieldLabel,
}: {
  formId: FormId;
  excludedFieldIds?: string[];
  schema: JsonSchema7 | undefined;
  uiSchema: UISchemaElement | undefined;
  data: AdditionalData;
  helpers: Helpers;
  enabledFeatures: OrgFeature[];
  getStandardFieldLabel: GetStandardFormFieldLabel;
}): Pick<PropertyFilterProps, 'filteringProperties' | 'filteringOptions'> => {
  const allCustomFields =
    schema && uiSchema ? getCustomAttributeRenderProps(schema, uiSchema) : [];
  const allowedCustomFields = allCustomFields.filter(
    (cf) => fieldTypesConfig[cf.type].allowAsConditionSource
  );

  const formRegistry = getFormConfigRegistry(enabledFeatures);
  const form = formRegistry[formId] ?? {};
  const allowedStandardFields = Object.values<FormFieldConfig>(form).filter(
    (field) => field.allowAsConditionSource
  );

  const customFieldProperties = allowedCustomFields.map((rp) => {
    const fieldConfig = fieldTypesConfig[rp.type];
    const properties = fieldConfig.getConditionalPropertyFilterProperty?.(
      rp,
      data
    );

    return {
      key: `CustomAttributeData.${rp.path}`,
      groupValuesLabel: 'Custom fields',
      propertyLabel: rp.label,
      ...properties,
    };
  });

  const standardFieldProperties = allowedStandardFields.map((field) => {
    const propertyLabel = getStandardFieldLabel(formId, field.fieldId as never);
    if (field.displayType) {
      const displayType = displayTypes[field.displayType!.displayType];

      return (
        displayType.propertyConfig?.(
          {
            ...field.displayType!,
            key: field.fieldId,
            groupValuesLabel: '',
            propertyLabel,
          },
          helpers,
          data
        ) ?? {
          key: field.fieldId,
          groupValuesLabel: '',
          propertyLabel,
        }
      );
    }

    return {
      key: field.fieldId,
      groupValuesLabel: '',
      propertyLabel,
    };
  });

  const customFieldFilteringOptions = allowedCustomFields.flatMap((cf) => {
    const fieldConfig = fieldTypesConfig[cf.type];

    const filteringOptions = fieldConfig.getConditionalPropertyFilterOptions?.(
      cf,
      data
    );

    return (
      filteringOptions?.map((fo) => ({
        ...fo,
        propertyKey: `CustomAttributeData.${cf.path}`,
      })) ?? []
    );
  });

  return {
    filteringProperties: [
      ...standardFieldProperties,
      ...customFieldProperties,
    ].filter((fp) => !excludedFieldIds?.includes(fp.key)),
    filteringOptions: [...customFieldFilteringOptions].filter(
      (fo) => !excludedFieldIds?.includes(fo.propertyKey)
    ),
  };
};
