import { z } from 'zod';

import { validateAgainstSchema } from './schemaValidation';

describe('schemaValidation', () => {
  describe('validateAgainstSchema', () => {
    it('returns valid records', () => {
      const records = [
        {
          name: 'risk1',
        },
      ];
      const schema = z.object({
        name: z.string(),
      });
      const { records: result } = validateAgainstSchema(
        'risks.csv',
        records,
        schema
      );
      expect(result).toEqual([{ name: 'risk1' }]);
    });

    it('excludes invalid records', () => {
      const records = [
        {
          wrong: 'risk1',
        },
      ];
      const schema = z.object({
        name: z.string(),
      });
      const { records: result } = validateAgainstSchema(
        'risks.csv',
        records,
        schema
      );
      expect(result).toEqual([]);
    });

    it('includes custom fields on CustomAttributeData field', () => {
      const records = [
        {
          name: 'risk1',
          custom1: 'custom record',
        },
      ];
      const schema = z.object({
        name: z.string(),
      });
      const customAttributes = z.object({
        custom1: z.string(),
      });
      const { records: result } = validateAgainstSchema(
        'risks.csv',
        records,
        schema,
        customAttributes
      );
      expect(result).toEqual([
        {
          name: 'risk1',
          CustomAttributeData: {
            custom1: 'custom record',
          },
        },
      ]);
    });

    it('customAttributes are required', () => {
      const records = [
        {
          name: 'risk1',
        },
      ];
      const schema = z.object({
        name: z.string(),
      });
      const customAttributes = z.object({
        custom1: z.string(),
      });
      const { records: result } = validateAgainstSchema(
        'risks.csv',
        records,
        schema,
        customAttributes
      );
      expect(result).toEqual([]);
    });
  });
});
