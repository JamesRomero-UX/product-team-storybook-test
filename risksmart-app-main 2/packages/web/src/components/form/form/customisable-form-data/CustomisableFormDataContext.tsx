import type { JsonSchema7, VerticalLayout } from '@jsonforms/core';
import type { Conditions } from '@risksmart-app/form-configuration/src/field-types/types';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createContext, useContext } from 'react';

export type TypedFormFieldConfiguration = Omit<
  GetFormCustomisationQuery['form_field_configuration'][number],
  'Conditions'
> & {
  Conditions?: Conditions | null | undefined;
};

export type CustomisableFormDataContextState = {
  formFieldConfigurations: TypedFormFieldConfiguration[] | null;
  formFieldOrdering: GetFormCustomisationQuery['form_field_ordering'] | null;
  customAttributeSchema: {
    UiSchema: VerticalLayout;
    Schema: JsonSchema7;
    Id: string;
  } | null;
};

export const CustomisableFormDataContext =
  createContext<CustomisableFormDataContextState>({
    formFieldConfigurations: null,
    formFieldOrdering: null,
    customAttributeSchema: null,
  });

export const useCustomisableFormDataContext = () => {
  const context = useContext(CustomisableFormDataContext);
  if (!context) {
    throw new Error(
      'useCustomisableFormDataContext must be used within a CustomisableFormDataProvider'
    );
  }

  return context;
};
