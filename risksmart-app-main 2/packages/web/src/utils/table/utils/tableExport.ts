import type { FormRegistry } from '@risksmart-app/shared/forms/formConfigRegistry';
import type {
  FormConfigurationPartsFragment,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { getColumnHeader } from '../hooks/getColumnHeader';
import type { CsvFieldType, TableFields } from '../types';

export function recordsToExportArray<T extends { [key: string]: unknown }>(
  items: readonly T[],
  fields: TableFields<T>,
  visibleColumns: readonly string[] | undefined,
  {
    formConfigurations,
    formRegistry,
    getEntityInfo,
  }: {
    formConfigurations: FormConfigurationPartsFragment[] | null;
    formRegistry: FormRegistry;
    getEntityInfo: (type: Parent_Type_Enum) => { singular: string };
  }
): CsvFieldType[][] {
  const columnsToExport =
    visibleColumns && visibleColumns.length > 0
      ? visibleColumns
      : Object.keys(fields);

  const data: CsvFieldType[][] = [];
  const headers: string[] = [];
  for (const fieldName of columnsToExport) {
    const field = fields[fieldName];
    if (!field) {
      console.warn(`Field ${fieldName} not found in fields object`);
      continue;
    }

    const header = getColumnHeader(
      { formRegistry, formConfigurations, getEntityInfo },
      fields[fieldName]
    );

    headers.push(header);
  }

  data.push(headers);

  for (const item of items) {
    const record: CsvFieldType[] = [];
    for (const fieldName of columnsToExport) {
      const field = fields[fieldName];
      if (!field) {
        continue; // Skip if field doesn't exist
      }

      if (field.exportVal) {
        const exportedValue = field.exportVal(item) as unknown;
        // Ensure arrays are exported as a single, comma-joined string so CSV treats them as one cell
        if (Array.isArray(exportedValue)) {
          record.push(exportedValue.join(','));
        } else {
          record.push(exportedValue as CsvFieldType);
        }
      } else {
        const value = item[fieldName] as unknown;
        if (Array.isArray(value)) {
          // Join arrays without spaces to match e2e expectations (e.g. "A,B")
          record.push(value.join(','));
          continue;
        }
        // Only push if value is a valid CsvFieldType
        if (
          value == null ||
          ['string', 'number', 'boolean'].includes(typeof value)
        ) {
          record.push(value as CsvFieldType);
        } else {
          // Convert other types to string representation
          record.push(String(value));
        }
      }
    }
    data.push(record);
  }

  const footerRecord = getFooterRow(fields, columnsToExport, items);
  if (footerRecord) {
    data.push(footerRecord);
  }

  return data;
}

const getFooterRow = <T extends { [key: string]: unknown }>(
  fields: TableFields<T>,
  columnsToExport: readonly string[],
  items: readonly T[]
) => {
  const includeFooter =
    Object.values(fields).filter((c) => c.footerVal || c.footerExportVal)
      .length > 0;
  if (includeFooter) {
    const footerRecord: CsvFieldType[] = [];
    for (const fieldName of columnsToExport) {
      const cellDef = fields[fieldName];
      if (cellDef.footerExportVal) {
        footerRecord.push(cellDef.footerExportVal(items)?.toString() ?? '');
      } else if (cellDef.footerVal) {
        footerRecord.push(cellDef.footerVal(items)?.toString() ?? '');
      } else {
        footerRecord.push('');
      }
    }

    return footerRecord;
  }

  return null;
};
