import { stringify } from 'csv-stringify';
import fs from 'fs';
import path from 'path';

import type { Sheet } from '../sheets/Sheet';

export const writeFile = async (
  dir: string,
  csvFileName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  excludedColumns?: string[]
) => {
  /* Extract unique set of column names from all items.
  The stringify utility uses the first item to determine the columns,
  and will miss any columns that are not present in the first item.
  */
  const columns = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (excludedColumns?.includes(key)) {
        return;
      }

      columns.add(key);
    });
  });

  const text = await new Promise<string>((resolve) => {
    stringify(
      data,
      {
        header: true,
        columns: Array.from(columns),
        cast: {
          boolean: (value: boolean) => {
            return String(value);
          },
        },
      },
      function (err, data) {
        resolve(data);
      }
    );
  });
  fs.writeFileSync(path.join(dir, csvFileName), text);
};

export const writeSheet = async <N extends string, B, C, D>(
  dir: string,
  sheet: Sheet<N, B, C, D>
) => {
  await writeFile(dir, sheet.name, sheet.generateMockData());
};
