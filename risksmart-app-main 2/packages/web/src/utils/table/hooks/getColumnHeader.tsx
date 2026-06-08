import type { FormRegistry } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { FormFieldConfig } from '@risksmart-app/shared/forms/types';
import type {
  FormConfigurationPartsFragment,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { Header } from '../types';

/**
 * Retrieve a customised column header
 * @param header
 * @param formConfigurations
 * @returns
 */
export function getColumnHeader(
  {
    formRegistry,
    formConfigurations,
    getEntityInfo,
  }: {
    formRegistry: FormRegistry;
    formConfigurations: FormConfigurationPartsFragment[] | null;
    getEntityInfo: (type: Parent_Type_Enum) => { singular: string };
  },
  header: Header
): string {
  if ('header' in header) {
    return header.header;
  }

  const formConfiguration = formConfigurations?.find(
    (fc) => fc.ParentType === header.formId
  );

  const fieldConfig = formConfiguration?.fields_config?.find(
    (field) => field.FieldId === header.fieldId
  );

  const form = formRegistry[header.formId as keyof typeof formRegistry];
  const fieldData: FormFieldConfig = form[header.fieldId as keyof typeof form];

  let label: string = '';
  if (fieldConfig?.Label) {
    label = fieldConfig.Label;
  } else {
    label =
      'columnHeader' in fieldData
        ? (fieldData.columnHeader ?? '')
        : fieldData.formLabel;
  }

  if (!header.includeFromTypePostfix) {
    return label;
  }

  return `${label} (${getEntityInfo(header.formId).singular.toLowerCase()})`;
}
