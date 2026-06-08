import { stringify } from 'csv-stringify/sync';

export const dataToCsv = (
  dataArray: Record<string, unknown>[] = [],
  excludedColumns?: string[]
): string => {
  /* Extract unique set of column names from all items.
  The stringify utility uses the first item to determine the columns,
  and will miss any columns that are not present in the first item.
  */
  const columns = new Set<string>();
  dataArray.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (excludedColumns?.includes(key)) {
        return;
      }

      columns.add(key);
    });
  });

  return stringify(dataArray, {
    header: true,
    columns: Array.from(columns),
    cast: {
      boolean: (value: boolean) => {
        return String(value);
      },
      object: (value: Record<string, unknown>) => {
        return JSON.stringify(value);
      },
    },
  });
};
