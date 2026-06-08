import type { Readable } from 'node:stream';

import type { CastingContext } from 'csv-parse';
import { CsvError, parse } from 'csv-parse';
import _ from 'lodash';

import type { CsvParseDefinition, FieldType } from '../sheets/Sheet';
import type { CsvLineErrorType } from '../utils/logging';

export function isNumeric(value: string) {
  return _.isFinite(Number(value));
}

export const parseCsvStream = async <N extends string, C>(
  stream: Readable,
  sheet: CsvParseDefinition<N, C>
): Promise<{
  errors: CsvLineErrorType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: any[];
}> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const records: any[] = [];

  const columnTypes = sheet.fields.reduce(
    (previous, current) => {
      previous[current.key] = current.type;

      return previous;
    },
    {} as { [key in keyof C]: FieldType }
  );

  const parser = stream.pipe(
    parse({
      //  columns: sheet.fields.map((s) => s.key),
      trim: true,
      columns: true,
      bom: true,
      cast: (value: string, context: CastingContext) => {
        if (context.header) {
          return value;
        }
        if (value === '' || value.toLowerCase() === 'null') {
          return null;
        }
        const columnType = columnTypes[context.column as keyof C];
        if (!columnType) {
          const error = new CsvError(
            'CSV_RECORD_INCONSISTENT_COLUMNS',
            `Unexpected column '${context.column}'`,
            {},
            context
          );
          errors.push(error);

          return value;
        }

        switch (columnTypes[context.column as keyof C]) {
          case 'string':
            return value;
          case 'number': {
            if (!isNumeric(value)) {
              const error = new CsvError(
                'CSV_INVALID_OPTION_CAST',
                `'${context.column}' value '${value}' is not a number`,
                {},
                context
              );
              errors.push(error);
            }

            return Number(value);
          }
          case 'boolean': {
            if (
              value.toLowerCase() === 'true' ||
              value.toLowerCase() === 'false'
            ) {
              return value.toLowerCase() === 'true';
            }
            const error = new CsvError(
              'CSV_INVALID_OPTION_CAST',
              `'${context.column}' value '${value}' is not a boolean`,
              {},
              context
            );
            errors.push(error);
            break;
          }
          default:
            return value;
        }
      },
      // List all errors at the end
      skipRecordsWithError: true,
    })
  );
  parser.on('skip', function (err) {
    errors.push(err);
  });

  for await (const record of parser) {
    // Work with each record
    records.push(record);
  }
  const formattedErrors: CsvLineErrorType[] = [];
  if (errors.length > 0) {
    for (const error of errors) {
      const err = error as CsvError;
      formattedErrors.push({
        file: sheet.name,
        message: err.message,
        row: err.lines,
      });
    }
  }

  fixNewLines(records);

  return { records, errors: formattedErrors };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fixNewLines = (records: any[]) => {
  for (const record of records) {
    for (const field in record) {
      const value = record[field];
      if (typeof value === 'string') {
        record[field] = value.replaceAll('\\n', '\n').replaceAll('\\r', '\r');
      }
    }
  }
};
