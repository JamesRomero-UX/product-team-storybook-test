import { describe, expect, it } from 'vitest';
import type { ZodError } from 'zod';
import { z } from 'zod';

import {
  base64urlNoPad,
  entityIdValue,
  extendSchema,
  isoDateTimeValue,
  providerIdOrUuid,
  referencedResourceSchema,
  serializeZodError,
  tagSchema,
} from './schemas';

describe('schemas utils', () => {
  describe('extendSchema', () => {
    it('should extend a base schema with additional fields', () => {
      const baseSchema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const extendedSchema = extendSchema(baseSchema, {
        email: z.string().email(),
      });

      const result = extendedSchema.parse({
        name: 'John',
        age: 30,
        email: 'john@example.com',
      });

      expect(result).toEqual({
        name: 'John',
        age: 30,
        email: 'john@example.com',
      });
    });

    it('should validate the extended schema correctly', () => {
      const baseSchema = z.object({
        id: z.string(),
      });

      const extendedSchema = extendSchema(baseSchema, {
        count: z.number().positive(),
      });

      expect(() =>
        extendedSchema.parse({
          id: 'test',
          count: -5,
        })
      ).toThrow();
    });

    it('should override base schema fields when extending', () => {
      const baseSchema = z.object({
        value: z.string(),
      });

      const extendedSchema = extendSchema(baseSchema, {
        value: z.number(),
      });

      const result = extendedSchema.parse({
        value: 42,
      });

      expect(result.value).toBe(42);
    });
  });

  describe('base64urlNoPad', () => {
    it('should accept valid base64url strings without padding', () => {
      expect(base64urlNoPad.parse('abc123')).toBe('abc123');
      expect(base64urlNoPad.parse('ABC-_xyz')).toBe('ABC-_xyz');
      expect(base64urlNoPad.parse('ab')).toBe('ab'); // length % 4 === 2
      expect(base64urlNoPad.parse('abc')).toBe('abc'); // length % 4 === 3
      expect(base64urlNoPad.parse('abcd')).toBe('abcd'); // length % 4 === 0
    });

    it('should accept valid base64url characters only', () => {
      expect(
        base64urlNoPad.parse(
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
        )
      ).toBeTruthy();
    });

    it('should reject empty strings', () => {
      expect(() => base64urlNoPad.parse('')).toThrow(
        'Must be a non-empty base64url string'
      );
    });

    it('should reject strings with padding', () => {
      expect(() => base64urlNoPad.parse('abc=')).toThrow(
        "Must be base64url (no '=')"
      );
      expect(() => base64urlNoPad.parse('ab==')).toThrow(
        "Must be base64url (no '=')"
      );
      expect(() => base64urlNoPad.parse('a===')).toThrow(
        "Must be base64url (no '=')"
      );
    });

    it('should reject strings with invalid characters', () => {
      expect(() => base64urlNoPad.parse('abc+')).toThrow(
        "Must be base64url (no '=')"
      );
      expect(() => base64urlNoPad.parse('abc/')).toThrow(
        "Must be base64url (no '=')"
      );
      expect(() => base64urlNoPad.parse('abc@')).toThrow(
        "Must be base64url (no '=')"
      );
      expect(() => base64urlNoPad.parse('abc#')).toThrow(
        "Must be base64url (no '=')"
      );
      expect(() => base64urlNoPad.parse('abc ')).toThrow(
        "Must be base64url (no '=')"
      );
    });

    it('should reject strings with invalid length (length % 4 === 1)', () => {
      expect(() => base64urlNoPad.parse('abcde')).toThrow(
        'Invalid base64/base64url length'
      );
      expect(() => base64urlNoPad.parse('abcdefghi')).toThrow(
        'Invalid base64/base64url length'
      );
    });

    it('should accept valid length strings (length % 4 === 0, 2, or 3)', () => {
      expect(base64urlNoPad.parse('ab')).toBe('ab'); // length % 4 === 2
      expect(base64urlNoPad.parse('abc')).toBe('abc'); // length % 4 === 3
      expect(base64urlNoPad.parse('abcd')).toBe('abcd'); // length % 4 === 0
    });
  });

  describe('serializeZodError', () => {
    it('should serialize zod error with single field error', () => {
      const schema = z.object({
        name: z.string(),
      });

      try {
        schema.parse({ name: 123 });
      } catch (error) {
        const serialized = serializeZodError(error as ZodError);
        expect(serialized).toEqual([
          {
            field: 'name',
            message: 'Expected string, received number',
          },
        ]);
      }
    });

    it('should serialize zod error with multiple field errors', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      });

      try {
        schema.parse({ name: 123, age: 'not a number', email: 'invalid' });
      } catch (error) {
        const serialized = serializeZodError(error as ZodError);
        expect(serialized).toHaveLength(3);
        expect(serialized[0]).toEqual({
          field: 'name',
          message: 'Expected string, received number',
        });
        expect(serialized[1]).toEqual({
          field: 'age',
          message: 'Expected number, received string',
        });
        expect(serialized[2]).toEqual({
          field: 'email',
          message: 'Invalid email',
        });
      }
    });

    it('should serialize nested field errors', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
        }),
      });

      try {
        schema.parse({ user: { name: 123 } });
      } catch (error) {
        const serialized = serializeZodError(error as ZodError);
        expect(serialized).toEqual([
          {
            field: 'user.name',
            message: 'Expected string, received number',
          },
        ]);
      }
    });

    it('should serialize array field errors', () => {
      const schema = z.object({
        tags: z.array(z.string()),
      });

      try {
        schema.parse({ tags: [123, 456] });
      } catch (error) {
        const serialized = serializeZodError(error as ZodError);
        expect(serialized).toHaveLength(2);
        expect(serialized[0]?.field).toBe('tags.0');
        expect(serialized[1]?.field).toBe('tags.1');
      }
    });
  });

  describe('entityIdValue', () => {
    it('should accept valid UUIDs', () => {
      expect(entityIdValue.parse('123e4567-e89b-12d3-a456-426614174000')).toBe(
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(entityIdValue.parse('550e8400-e29b-41d4-a716-446655440000')).toBe(
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('should reject invalid UUID formats', () => {
      expect(() => entityIdValue.parse('not-a-uuid')).toThrow();
      expect(() => entityIdValue.parse('123e4567-e89b-12d3-a456')).toThrow();
      expect(() =>
        entityIdValue.parse('123e4567e89b12d3a456426614174000')
      ).toThrow();
      expect(() => entityIdValue.parse('')).toThrow();
    });

    it('should reject UUIDs with invalid characters', () => {
      expect(() =>
        entityIdValue.parse('123e4567-e89b-12d3-a456-42661417400g')
      ).toThrow();
    });
  });

  describe('isoDateTimeValue', () => {
    it('should accept valid ISO datetime strings with offset', () => {
      expect(isoDateTimeValue.parse('2023-01-01T00:00:00.000Z')).toBe(
        '2023-01-01T00:00:00.000Z'
      );
      expect(isoDateTimeValue.parse('2023-12-31T23:59:59.999+00:00')).toBe(
        '2023-12-31T23:59:59.999+00:00'
      );
      expect(isoDateTimeValue.parse('2023-06-15T12:30:45.123-05:00')).toBe(
        '2023-06-15T12:30:45.123-05:00'
      );
    });

    it('should reject datetime strings without offset', () => {
      expect(() => isoDateTimeValue.parse('2023-01-01T00:00:00')).toThrow();
      expect(() => isoDateTimeValue.parse('2023-01-01T00:00:00.000')).toThrow();
    });

    it('should reject invalid datetime formats', () => {
      expect(() => isoDateTimeValue.parse('2023-01-01')).toThrow();
      expect(() => isoDateTimeValue.parse('not-a-date')).toThrow();
      expect(() => isoDateTimeValue.parse('')).toThrow();
    });
  });

  describe('providerIdOrUuid', () => {
    it('should accept valid provider-scoped user IDs', () => {
      expect(providerIdOrUuid.parse('auth0|user123')).toBe('auth0|user123');
      expect(providerIdOrUuid.parse('google|abc123')).toBe('google|abc123');
      expect(providerIdOrUuid.parse('provider|id')).toBe('provider|id');
    });

    it('should accept IDs with multiple pipe characters', () => {
      expect(providerIdOrUuid.parse('auth0|user|123')).toBe('auth0|user|123');
    });

    it('should accept IDs with SYSTEM as the value', () => {
      expect(providerIdOrUuid.parse('SYSTEM')).toBe('SYSTEM');
    });

    it('should accept random string id', () => {
      expect(providerIdOrUuid.parse('auth0user123')).toBe('auth0user123');
    });

    it('should reject IDs with number', () => {
      expect(() => providerIdOrUuid.parse(1234)).toThrow();
    });

    it('should reject empty strings', () => {
      expect(() => providerIdOrUuid.parse('')).toThrow();
    });
  });

  describe('tagSchema', () => {
    it('should accept valid tag objects', () => {
      const tag = {
        name: 'test-tag',
        description: 'A test tag',
      };
      expect(tagSchema.parse(tag)).toEqual(tag);
    });

    it('should reject tags without name', () => {
      expect(() =>
        tagSchema.parse({
          description: 'A test tag',
        })
      ).toThrow();
    });

    it('should reject tags without description', () => {
      expect(() =>
        tagSchema.parse({
          name: 'test-tag',
        })
      ).toThrow();
    });

    it('should accept empty strings for name and description', () => {
      const tag = {
        name: '',
        description: '',
      };
      expect(tagSchema.parse(tag)).toEqual(tag);
    });
  });

  describe('referencedResourceSchema', () => {
    it('should accept valid referenced resource objects', () => {
      const resource = {
        type: 'risk',
        id: 'auth0|user123',
        href: 'https://example.com/risks/123',
      };
      expect(referencedResourceSchema.parse(resource)).toEqual(resource);
    });

    it('should validate the id field using providerIdOrUuid schema', () => {
      expect(
        referencedResourceSchema.parse({
          type: 'risk',
          id: 'invalid-id-without-pipe',
          href: 'https://example.com/risks/123',
        })
      ).toStrictEqual({
        type: 'risk',
        id: 'invalid-id-without-pipe',
        href: 'https://example.com/risks/123',
      });
    });

    it('should reject resources without required fields', () => {
      expect(() =>
        referencedResourceSchema.parse({
          type: 'risk',
          id: 'auth0|user123',
        })
      ).toThrow();

      expect(() =>
        referencedResourceSchema.parse({
          type: 'risk',
          href: 'https://example.com/risks/123',
        })
      ).toThrow();

      expect(() =>
        referencedResourceSchema.parse({
          id: 'auth0|user123',
          href: 'https://example.com/risks/123',
        })
      ).toThrow();
    });

    it('should accept any string for type and href', () => {
      const resource = {
        type: '',
        id: 'provider|id',
        href: '',
      };
      expect(referencedResourceSchema.parse(resource)).toEqual(resource);
    });
  });
});
