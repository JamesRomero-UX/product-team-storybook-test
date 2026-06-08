import { useQuery } from '@apollo/client';
import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetFormCustomisationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

import type { TableFields, TableRecord } from '../types';

export const useGetTableFormCustomisationData = <T extends TableRecord>(
  tableFields: TableFields<T>,
  customAttributeFormIds: Parent_Type_Enum[]
) => {
  // Form configuration required for custom labels
  const formIds = useMemo<Set<FormId>>(() => {
    const formIds = new Set<FormId>();
    Object.entries(tableFields).forEach(([_, fieldConfig]) => {
      if ('formId' in fieldConfig && fieldConfig.formId) {
        formIds.add(fieldConfig.formId);
      }
    });

    return formIds;
  }, [tableFields]);

  customAttributeFormIds.forEach((id) => formIds.add(id as unknown as FormId));

  // Ideally would refactor this to also return form customisation required for displaying custom attributes.
  const { data } = useQuery(GetFormCustomisationDocument, {
    variables: {
      parentTypes: Array.from(formIds),
    },
    skip: !formIds.size,
    fetchPolicy: 'no-cache',
  });

  return data?.form_configuration ?? [];
};
