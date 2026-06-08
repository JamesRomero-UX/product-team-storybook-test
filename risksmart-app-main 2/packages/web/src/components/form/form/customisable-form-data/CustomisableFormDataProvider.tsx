import { useQuery } from '@apollo/client';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetFormCustomisationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type PropsWithChildren, useMemo } from 'react';
import Loading from 'src/components/loading';

import { CustomisableFormDataContext } from './CustomisableFormDataContext';

type Props = PropsWithChildren & {
  /**
   * The parent type of the form, used to determine the form field configuration
   */
  parentType?: Parent_Type_Enum;
  /**
   * When specified, the form configuration for all possible parent types will be retrieved,
   * avoiding the loading state when switching types which causes the form to loose its state
   */
  possibleParentTypes?: Parent_Type_Enum[];
};

/**
 * Context provider to allow the edit field modal to be opened from any child component
 * @returns
 */
export const CustomisableFormDataProvider = ({
  children,
  parentType,
  possibleParentTypes,
}: Props) => {
  // Retrieve all possible form configurations to prevent loading in the form when switching types
  const parentTypesToRequest =
    possibleParentTypes ?? (parentType ? [parentType] : []);

  const { data, loading } = useQuery(GetFormCustomisationDocument, {
    variables: {
      parentTypes: parentTypesToRequest,
    },
    skip: !parentType,
  });

  const formFieldConfigurations = useMemo(
    () =>
      data?.form_field_configuration?.filter(
        (ff) => ff.FormConfigurationParentType === parentType
      ) ?? null,
    [data?.form_field_configuration, parentType]
  );
  const formFieldOrdering = useMemo(
    () =>
      data?.form_field_ordering?.filter(
        (fo) => fo.FormConfigurationParentType === parentType
      ) ?? null,
    [data?.form_field_ordering, parentType]
  );
  const customAttributeSchema = useMemo(
    () =>
      data?.form_configuration?.find((fc) => fc.ParentType === parentType)
        ?.customAttributeSchema ?? null,
    [data?.form_configuration, parentType]
  );

  return (
    <CustomisableFormDataContext.Provider
      value={{
        formFieldConfigurations,
        formFieldOrdering,
        customAttributeSchema,
      }}
    >
      {loading ? <Loading /> : children}
    </CustomisableFormDataContext.Provider>
  );
};
