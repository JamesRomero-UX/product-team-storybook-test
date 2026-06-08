import type {
  GetFormFieldOptionsByParentTypeQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ZodIntersection, ZodSchema } from 'zod';
import { z } from 'zod';

import { useConditionalFieldsContext } from '../../conditional-fields-provider/ConditionalFieldsContext';
import { useCustomisableFormDataContext } from '../../customisable-form-data/CustomisableFormDataContext';
import { useRiskSmartForm } from '../RiskSmartFormContext';

const checkRequired = (val: unknown) => {
  if (Array.isArray(val)) {
    return val.length > 0;
  }
  if (typeof val === 'string') {
    return val.length > 0;
  }

  return !_.isNil(val);
};

const addRequiredFieldToObject = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: ZodIntersection<any, any> | ZodSchema,
  fieldId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): z.ZodIntersection<any, any> => {
  const paths = fieldId.split('.');
  const reversedPaths = paths.reverse();
  const lastPath = reversedPaths[0];
  let object = z.object({
    [lastPath]: z.custom(checkRequired, { message: 'Required' }),
  });
  for (let i = 1; i < reversedPaths.length; i++) {
    object = z.object({ [reversedPaths[i]]: object });
  }

  return z.intersection(obj, object);
};

export const getRequiredFields = ({
  allFieldIds,
  defaultRequiredFields,
  fieldConfig,
  conditionallyHiddenFields,
}: {
  allFieldIds: string[];
  defaultRequiredFields: string[];
  fieldConfig: GetFormFieldOptionsByParentTypeQuery['form_field_configuration'];
  conditionallyHiddenFields: Set<string>;
}) => {
  const requiredFields = new Set<string>();

  // Use default required unless overridden with user settings
  defaultRequiredFields
    .filter((fieldId) => !fieldConfig.map((f) => f.FieldId).includes(fieldId))
    .forEach((fieldId) => requiredFields.add(fieldId));

  fieldConfig
    .filter(
      (field) =>
        allFieldIds.includes(field.FieldId) &&
        field.Required &&
        !conditionallyHiddenFields.has(field.FieldId)
    )
    .forEach((field) => requiredFields.add(field.FieldId));

  return requiredFields;
};

export const addRequireFieldsToSchema = (
  schema: ZodSchema,
  requiredFields: Set<string>
) =>
  Array.from(requiredFields).reduce(
    (acc, fieldId) => {
      return addRequiredFieldToObject(acc, fieldId);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema as ZodIntersection<any, any>
  );

export const useTransformSchemaToRequiredFields = (
  parentType: Parent_Type_Enum
) => {
  const conditionallyHiddenFields = useConditionalFieldsContext();
  const { setCustomFormValidation, defaultRequiredFields, allFieldIds } =
    useRiskSmartForm();
  const { formFieldConfigurations } = useCustomisableFormDataContext();

  const { control } = useFormContext();

  useEffect(() => {
    setCustomFormValidation(
      (): ((schema: ZodSchema) => ZodSchema) => (schema) => {
        const requiredFields = getRequiredFields({
          allFieldIds,
          defaultRequiredFields,
          fieldConfig: formFieldConfigurations ?? [],
          conditionallyHiddenFields,
        });

        return addRequireFieldsToSchema(schema, requiredFields);
      }
    );
  }, [
    formFieldConfigurations,
    setCustomFormValidation,
    defaultRequiredFields,
    control,
    allFieldIds,
    parentType,
    conditionallyHiddenFields,
  ]);
};
