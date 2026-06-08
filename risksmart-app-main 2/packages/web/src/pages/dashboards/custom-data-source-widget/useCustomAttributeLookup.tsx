import { useQuery } from '@apollo/client';
import type { GetFormConfigurationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetFormConfigurationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import type { CustomAttributeSchemaLookup } from 'src/pages/custom-datasources/update/types';

export const createCustomAttributeSchemaLookup = (
  formConfigurationData: GetFormConfigurationQuery | undefined
): CustomAttributeSchemaLookup | undefined => {
  const schemaConfigurations: CustomAttributeSchemaLookup = {};
  const formConfigurations = formConfigurationData?.form_configuration;
  if (!formConfigurations) {
    return undefined;
  }
  for (const formConfig of formConfigurations) {
    if (formConfig.customAttributeSchema) {
      schemaConfigurations[formConfig.ParentType] =
        formConfig.customAttributeSchema;
    }
  }

  return schemaConfigurations;
};

export const useCustomAttributeLookup = () => {
  const { data: formConfigurationData, loading } = useQuery(
    GetFormConfigurationDocument,
    {
      fetchPolicy: 'no-cache',
    }
  );
  const customAttributeSchemaLookup = useMemo(
    () => createCustomAttributeSchemaLookup(formConfigurationData),
    [formConfigurationData]
  );

  return {
    customAttributeSchemaLookup,
    loading,
  };
};
