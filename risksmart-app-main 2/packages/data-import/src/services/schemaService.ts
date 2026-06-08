import type { GetFormConfigurationQuery } from '../../generated/graphql';
import { getFormConfiguration } from '../graphqlClient';
import type {
  CustomAttributeSchemaData,
  FieldsConfigData,
  SchemaLookup,
} from '../sheets/types';

export const createSchemaLookup = async (
  formConfiguration: GetFormConfigurationQuery['form_configuration']
) => {
  const schemaLookup = formConfiguration.reduce<SchemaLookup>(
    (previous, current) => {
      previous[current.ParentType] = {
        customAttributeSchemaData: current.customAttributeSchema as
          | CustomAttributeSchemaData
          | undefined,
        fieldsConfigData: current.fields_config as FieldsConfigData | undefined,
      };

      return previous;
    },
    {}
  );

  return schemaLookup;
};

export const createSchemaLookupByOrgKey = async (orgKey: string) => {
  const formConfiguration = await getFormConfiguration({
    orgKey,
  });

  const schemaLookup =
    formConfiguration.data.form_configuration.reduce<SchemaLookup>(
      (previous, current) => {
        previous[current.ParentType] = {
          customAttributeSchemaData: current.customAttributeSchema as
            | CustomAttributeSchemaData
            | undefined,
          fieldsConfigData: current.fields_config as
            | FieldsConfigData
            | undefined,
        };

        return previous;
      },
      {}
    );

  return schemaLookup;
};
