import { describe, expect, it } from 'vitest';

import { listQueryByUuidTsSchema } from '../query.schema';

describe('listQueryByUuidTsBase schema validation', () => {
  describe('happy paths - valid inputs', () => {
    it('should accept when both afterId and afterDateTime are null', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: null,
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept when both afterId and afterDateTime are undefined', () => {
      const input = {
        limit: 10,
        afterId: undefined,
        afterDateTime: undefined,
        beforeId: undefined,
        beforeDateTime: undefined,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept when both afterId and afterDateTime are provided', () => {
      const input = {
        limit: 10,
        afterId: '123e4567-e89b-12d3-a456-426614174000',
        afterDateTime: '2023-10-01T12:00:00Z',
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept when both beforeId and beforeDateTime are null', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: null,
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept when both beforeId and beforeDateTime are provided', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: null,
        beforeId: '123e4567-e89b-12d3-a456-426614174000',
        beforeDateTime: '2023-10-01T12:00:00Z',
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept when only limit is provided', () => {
      const input = {
        limit: 50,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept when no parameters are provided', () => {
      const input = {};

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('unhappy paths - afterId/afterDateTime mismatch', () => {
    it('should reject when afterId is null but afterDateTime is provided', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: '2023-10-01T12:00:00Z',
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors).toHaveLength(2);
        expect(errors[0]?.path).toEqual(['afterId']);
        expect(errors[0]?.message).toBe(
          'Both "afterId" and "afterDateTime" must be provided together or both must be null.'
        );
        expect(errors[1]?.path).toEqual(['afterDateTime']);
        expect(errors[1]?.message).toBe(
          'Both "afterId" and "afterDateTime" must be provided together or both must be null.'
        );
      }
    });

    it('should reject when afterId is provided but afterDateTime is null', () => {
      const input = {
        limit: 10,
        afterId: '123e4567-e89b-12d3-a456-426614174000',
        afterDateTime: null,
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors).toHaveLength(2);
        expect(errors[0]?.path).toEqual(['afterId']);
        expect(errors[1]?.path).toEqual(['afterDateTime']);
      }
    });

    it('should reject when afterId is undefined but afterDateTime is provided', () => {
      const input = {
        limit: 10,
        afterId: undefined,
        afterDateTime: '2023-10-01T12:00:00Z',
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some((e) => e.path.includes('afterId'))).toBe(true);
        expect(errors.some((e) => e.path.includes('afterDateTime'))).toBe(true);
      }
    });

    it('should reject when afterId is provided but afterDateTime is undefined', () => {
      const input = {
        limit: 10,
        afterId: '123e4567-e89b-12d3-a456-426614174000',
        afterDateTime: undefined,
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some((e) => e.path.includes('afterId'))).toBe(true);
        expect(errors.some((e) => e.path.includes('afterDateTime'))).toBe(true);
      }
    });
  });

  describe('unhappy paths - beforeId/beforeDateTime mismatch', () => {
    it('should reject when beforeId is null but beforeDateTime is provided', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: null,
        beforeId: null,
        beforeDateTime: '2023-10-01T12:00:00Z',
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors).toHaveLength(2);
        expect(errors[0]?.path).toEqual(['beforeId']);
        expect(errors[0]?.message).toBe(
          'Both "beforeId" and "beforeDateTime" must be provided together or both must be null.'
        );
        expect(errors[1]?.path).toEqual(['beforeDateTime']);
        expect(errors[1]?.message).toBe(
          'Both "beforeId" and "beforeDateTime" must be provided together or both must be null.'
        );
      }
    });

    it('should reject when beforeId is provided but beforeDateTime is null', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: null,
        beforeId: '123e4567-e89b-12d3-a456-426614174000',
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors).toHaveLength(2);
        expect(errors[0]?.path).toEqual(['beforeId']);
        expect(errors[1]?.path).toEqual(['beforeDateTime']);
      }
    });

    it('should reject when beforeId is undefined but beforeDateTime is provided', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: null,
        beforeId: undefined,
        beforeDateTime: '2023-10-01T12:00:00Z',
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some((e) => e.path.includes('beforeId'))).toBe(true);
        expect(errors.some((e) => e.path.includes('beforeDateTime'))).toBe(
          true
        );
      }
    });

    it('should reject when beforeId is provided but beforeDateTime is undefined', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: null,
        beforeId: '123e4567-e89b-12d3-a456-426614174000',
        beforeDateTime: undefined,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.some((e) => e.path.includes('beforeId'))).toBe(true);
        expect(errors.some((e) => e.path.includes('beforeDateTime'))).toBe(
          true
        );
      }
    });
  });

  describe('unhappy paths - both before and after provided', () => {
    it('should reject when all 4 IDs are provided', () => {
      const input = {
        limit: 10,
        afterId: '123e4567-e89b-12d3-a456-426614174000',
        afterDateTime: '2023-10-01T12:00:00Z',
        beforeId: '123e4567-e89b-12d3-a456-426614174001',
        beforeDateTime: '2023-10-02T12:00:00Z',
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.length).toBeGreaterThanOrEqual(2);
        expect(errors.some((e) => e.path.includes('afterId'))).toBe(true);
        expect(errors.some((e) => e.path.includes('beforeId'))).toBe(true);
        expect(
          errors.some((e) =>
            e.message.includes(
              'Do not provide both "after" and "before" pagination parameters together.'
            )
          )
        ).toBe(true);
      }
    });
  });

  describe('edge cases - field validation', () => {
    it('should reject invalid UUID format for afterId', () => {
      const input = {
        limit: 10,
        afterId: 'invalid-uuid',
        afterDateTime: '2023-10-01T12:00:00Z',
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some(
            (e) => e.path.includes('afterId') && e.message.includes('uuid')
          )
        ).toBe(true);
      }
    });

    it('should reject invalid UUID format for beforeId', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: null,
        beforeId: 'invalid-uuid',
        beforeDateTime: '2023-10-01T12:00:00Z',
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some(
            (e) => e.path.includes('beforeId') && e.message.includes('uuid')
          )
        ).toBe(true);
      }
    });

    it('should reject invalid datetime format for afterDateTime', () => {
      const input = {
        limit: 10,
        afterId: '123e4567-e89b-12d3-a456-426614174000',
        afterDateTime: 'invalid-datetime',
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('afterDateTime'))
        ).toBe(true);
      }
    });

    it('should reject invalid datetime format for beforeDateTime', () => {
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: null,
        beforeId: '123e4567-e89b-12d3-a456-426614174000',
        beforeDateTime: 'invalid-datetime',
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes('beforeDateTime'))
        ).toBe(true);
      }
    });

    it('should reject limit less than 1', () => {
      const input = {
        limit: 0,
        afterId: null,
        afterDateTime: null,
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some(
            (e) =>
              e.path.includes('limit') && e.message.includes('1 or greater')
          )
        ).toBe(true);
      }
    });

    it('should reject limit greater than 1000', () => {
      const input = {
        limit: 1001,
        afterId: null,
        afterDateTime: null,
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some(
            (e) =>
              e.path.includes('limit') && e.message.includes('1000 or less')
          )
        ).toBe(true);
      }
    });

    it('should accept limit at boundary value 1', () => {
      const input = {
        limit: 1,
        afterId: null,
        afterDateTime: null,
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept limit at boundary value 1000', () => {
      const input = {
        limit: 1000,
        afterId: null,
        afterDateTime: null,
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept null limit', () => {
      const input = {
        limit: null,
        afterId: null,
        afterDateTime: null,
        beforeId: null,
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('complex scenarios', () => {
    it('should reject when afterId mismatch and all 4 IDs provided', () => {
      // This tests multiple validation failures at once
      const input = {
        limit: 10,
        afterId: null,
        afterDateTime: '2023-10-01T12:00:00Z',
        beforeId: '123e4567-e89b-12d3-a456-426614174001',
        beforeDateTime: '2023-10-02T12:00:00Z',
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        // Should have errors for afterId/afterDateTime mismatch
        expect(errors.some((e) => e.path.includes('afterId'))).toBe(true);
        expect(errors.some((e) => e.path.includes('afterDateTime'))).toBe(true);
      }
    });

    it('should reject when beforeId mismatch and limit out of range', () => {
      const input = {
        limit: 5000,
        afterId: null,
        afterDateTime: null,
        beforeId: '123e4567-e89b-12d3-a456-426614174000',
        beforeDateTime: null,
      };

      const result = listQueryByUuidTsSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors;
        // Should have errors for both limit and beforeId/beforeDateTime mismatch
        expect(errors.some((e) => e.path.includes('limit'))).toBe(true);
        expect(errors.some((e) => e.path.includes('beforeId'))).toBe(true);
        expect(errors.some((e) => e.path.includes('beforeDateTime'))).toBe(
          true
        );
      }
    });
  });
});
