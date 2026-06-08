import { Readable } from 'node:stream';

import type { CsvParseDefinition } from '../sheets/Sheet';
import { isNumeric, parseCsvStream } from './csvReader';

describe('csvReader', () => {
  describe('isNumeric', () => {
    it('returns true for positive number', () => {
      expect(isNumeric('1')).toEqual(true);
    });
    it('returns true for positive decimal number', () => {
      expect(isNumeric('1.1')).toEqual(true);
    });
    it('returns true for negative number', () => {
      expect(isNumeric('-1')).toEqual(true);
    });
    it('returns false for non number', () => {
      expect(isNumeric('a')).toEqual(false);
    });
  });

  describe('processCsvStream', () => {
    describe('single string column', () => {
      const sheet: CsvParseDefinition<'risks.csv', { col1: string }> = {
        name: 'risks.csv',
        fields: [
          {
            key: 'col1',
            type: 'string',
          },
        ],
      };

      it('does not allow unknown columns', async () => {
        const readable = Readable.from([
          `col1,col2
row 1 value,row 1 col2 val`,
        ]);

        const { errors } = await parseCsvStream(readable, sheet);

        expect(errors.length).toEqual(1);
        expect(errors[0]).toEqual({
          file: 'risks.csv',
          message: "Unexpected column 'col2'",
          row: 2,
        });
      });

      it('can read string fields', async () => {
        const readable = Readable.from([
          'col1\r\nrow 1 value\r\nrow 2 value\r\n',
        ]);

        const { records, errors } = await parseCsvStream(readable, sheet);

        expect(records.length).toEqual(2);
        expect(records).toEqual([
          { col1: 'row 1 value' },
          { col1: 'row 2 value' },
        ]);
        expect(errors.length).toEqual(0);
      });

      it('can read string fields that look like numbers', async () => {
        const readable = Readable.from(['col1\r\n1.1\r\n333\r\n']);

        const { records, errors } = await parseCsvStream(readable, sheet);

        expect(records.length).toEqual(2);
        expect(records).toEqual([{ col1: '1.1' }, { col1: '333' }]);
        expect(errors.length).toEqual(0);
      });
    });

    describe('single number column', () => {
      const sheet: CsvParseDefinition<'risks.csv', { col1: string }> = {
        name: 'risks.csv',
        fields: [
          {
            key: 'col1',
            type: 'number',
          },
        ],
      };

      it('can read number fields', async () => {
        const readable = Readable.from(['col1\r\n1\r\n1.1\r\n']);

        const { records, errors } = await parseCsvStream(readable, sheet);

        expect(records.length).toEqual(2);
        expect(records).toEqual([{ col1: 1 }, { col1: 1.1 }]);
        expect(errors.length).toEqual(0);
      });

      it('validates number type', async () => {
        const readable = Readable.from(['col1\r\nabc\r\n']);

        const { errors } = await parseCsvStream(readable, sheet);

        expect(errors.length).toEqual(1);
        expect(errors).toEqual([
          {
            file: 'risks.csv',
            message: "'col1' value 'abc' is not a number",
            row: 2,
          },
        ]);
      });
    });

    describe('single boolean column', () => {
      const sheet: CsvParseDefinition<'risks.csv', { col1: string }> = {
        name: 'risks.csv',
        fields: [
          {
            key: 'col1',
            type: 'boolean',
          },
        ],
      };

      it('can read boolean fields', async () => {
        const readable = Readable.from(['col1\r\nTrue\r\nFalse\r\n']);

        const { records, errors } = await parseCsvStream(readable, sheet);

        expect(records.length).toEqual(2);
        expect(records).toEqual([{ col1: true }, { col1: false }]);
        expect(errors.length).toEqual(0);
      });

      it('validates boolean type', async () => {
        const readable = Readable.from(['col1\r\nabc\r\n']);

        const { errors } = await parseCsvStream(readable, sheet);

        expect(errors.length).toEqual(1);
        expect(errors).toEqual([
          {
            file: 'risks.csv',
            message: "'col1' value 'abc' is not a boolean",
            row: 2,
          },
        ]);
      });
    });
  });
});
