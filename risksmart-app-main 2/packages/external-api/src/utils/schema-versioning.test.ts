import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import type {
  LatestSchemaDefinition,
  SchemaVersionDefinition,
} from '../types/schema-registry.types';
import type { Compat } from '../types/versioning';
import { CURRENT_API_VERSION } from '../versions/index';
import {
  applySchemaVersionTransforms,
  getSchemaForVersion,
} from './schema-versioning';

describe('schema-versioning utils', () => {
  describe('applySchemaVersionTransforms', () => {
    // Test schemas
    const LatestSchema = z.object({
      id: z.string(),
      name: z.string(),
      newField: z.string(),
    });

    const V2Schema = z.object({
      id: z.string(),
      name: z.string(),
      oldField: z.string(),
    });

    const V1Schema = z.object({
      id: z.string(),
      name: z.string(),
    });

    // Transform from latest to v2 (2025-10-10)
    const TransformToV2 = LatestSchema.transform((data) => {
      const { newField, ...rest } = data;

      return {
        ...rest,
        oldField: newField,
      };
    });

    // Transform from v2 to v1 (2025-09-01)
    const TransformToV1 = V2Schema.transform((data) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { oldField, ...rest } = data;

      return rest;
    });

    const schemaVersions: Record<
      Compat,
      SchemaVersionDefinition<'response'>
    > = {
      '2025-10-10': {
        version: '2025-10-10',
        schemaType: 'response',
        description: 'Renamed newField to oldField',
        outputSchema: V2Schema,
        transformFromPrevious: TransformToV2,
        changes: [
          {
            type: 'breaking',
            description: 'Renamed newField to oldField',
            fields: ['newField', 'oldField'],
            impact: 'response',
          },
        ],
      },
      '2025-09-01': {
        version: '2025-09-01',
        schemaType: 'response',
        description: 'Removed oldField',
        outputSchema: V1Schema,
        transformFromPrevious: TransformToV1,
        changes: [
          {
            type: 'breaking',
            description: 'Removed oldField',
            fields: ['oldField'],
            impact: 'response',
          },
        ],
      },
    };

    it('should return latest data unchanged when requesting current version', () => {
      const latestData = {
        id: '123',
        name: 'Test',
        newField: 'value',
      };

      const result = applySchemaVersionTransforms(
        latestData,
        CURRENT_API_VERSION,
        schemaVersions
      );

      expect(result).toEqual(latestData);
    });

    it('should transform data from latest to version 2025-10-10', () => {
      const latestData = {
        id: '123',
        name: 'Test',
        newField: 'value',
      };

      const result = applySchemaVersionTransforms<
        typeof latestData,
        z.infer<typeof V2Schema>
      >(latestData, '2025-10-10', schemaVersions);

      expect(result).toEqual({
        id: '123',
        name: 'Test',
        oldField: 'value',
      });
    });

    it('should transform data from latest through multiple versions to 2025-09-01', () => {
      const latestData = {
        id: '123',
        name: 'Test',
        newField: 'value',
      };

      const result = applySchemaVersionTransforms<
        typeof latestData,
        z.infer<typeof V1Schema>
      >(latestData, '2025-09-01', schemaVersions);

      expect(result).toEqual({
        id: '123',
        name: 'Test',
      });
    });

    it('should return latest data when target version is not found', () => {
      const latestData = {
        id: '123',
        name: 'Test',
        newField: 'value',
      };

      const result = applySchemaVersionTransforms(
        latestData,
        '2024-01-01' as Compat,
        schemaVersions
      );

      expect(result).toEqual(latestData);
    });

    it('should handle empty schema versions registry', () => {
      const latestData = {
        id: '123',
        name: 'Test',
      };

      const result = applySchemaVersionTransforms(latestData, '2025-10-10', {});

      expect(result).toEqual(latestData);
    });

    it('should throw validation error when data does not match schema', () => {
      const invalidData = {
        id: 123, // Should be string
        name: 'Test',
        newField: 'value',
      };

      expect(() =>
        applySchemaVersionTransforms(invalidData, '2025-10-10', schemaVersions)
      ).toThrow();
    });

    it('should apply transformations in correct order (newest to oldest)', () => {
      const latestData = {
        id: '123',
        name: 'Test',
        newField: 'value',
      };

      // Spy on the transform to verify order
      const results: string[] = [];

      const v2Definition = schemaVersions['2025-10-10'];
      const v1Definition = schemaVersions['2025-09-01'];

      if (!v2Definition || !v1Definition) {
        throw new Error('Missing test schema versions');
      }

      const trackingVersions: Record<
        Compat,
        SchemaVersionDefinition<'response'>
      > = {
        '2025-10-10': {
          version: v2Definition.version,
          schemaType: v2Definition.schemaType,
          description: v2Definition.description,
          outputSchema: v2Definition.outputSchema,
          changes: v2Definition.changes,
          transformFromPrevious: LatestSchema.transform((data) => {
            results.push('v2');
            const { newField, ...rest } = data;

            return {
              ...rest,
              oldField: newField,
            };
          }),
        },
        '2025-09-01': {
          version: v1Definition.version,
          schemaType: v1Definition.schemaType,
          description: v1Definition.description,
          outputSchema: v1Definition.outputSchema,
          changes: v1Definition.changes,
          transformFromPrevious: V2Schema.transform((data) => {
            results.push('v1');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { oldField, ...rest } = data;

            return rest;
          }),
        },
      };

      applySchemaVersionTransforms(latestData, '2025-09-01', trackingVersions);

      expect(results).toEqual(['v2', 'v1']);
    });

    it('should handle complex nested data transformations', () => {
      const NestedLatestSchema = z.object({
        id: z.string(),
        user: z.object({
          name: z.string(),
          email: z.string(),
        }),
      });

      const NestedV1Schema = z.object({
        id: z.string(),
        user: z.object({
          name: z.string(),
        }),
      });

      const NestedTransform = NestedLatestSchema.transform((data) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email, ...rest } = data.user;

        return {
          ...data,
          user: rest,
        };
      });

      const nestedVersions: Record<
        Compat,
        SchemaVersionDefinition<'response'>
      > = {
        '2025-10-10': {
          version: '2025-10-10',
          schemaType: 'response',
          description: 'Removed email from user',
          outputSchema: NestedV1Schema,
          transformFromPrevious: NestedTransform,
          changes: [
            {
              type: 'breaking',
              description: 'Removed email from user',
              fields: ['user.email'],
              impact: 'response',
            },
          ],
        },
      };

      const latestData = {
        id: '123',
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      const result = applySchemaVersionTransforms(
        latestData,
        '2025-10-10',
        nestedVersions
      );

      expect(result).toEqual({
        id: '123',
        user: {
          name: 'John',
        },
      });
    });
  });

  describe('getSchemaForVersion', () => {
    const latestSchema: LatestSchemaDefinition<'response'> = {
      schemaType: 'response',
      schema: z.object({
        id: z.string(),
        name: z.string(),
        newField: z.string(),
      }),
      description: 'Latest schema',
      version: 'latest',
    };

    const v2OutputSchema = z.object({
      id: z.string(),
      name: z.string(),
      oldField: z.string(),
    });

    const v1OutputSchema = z.object({
      id: z.string(),
      name: z.string(),
    });

    const schemaVersions: Record<
      Compat,
      SchemaVersionDefinition<'response'>
    > = {
      '2025-10-10': {
        version: '2025-10-10',
        schemaType: 'response',
        description: 'Version 2 schema',
        outputSchema: v2OutputSchema,
        transformFromPrevious: z.any(),
        changes: [],
      },
      '2025-09-01': {
        version: '2025-09-01',
        schemaType: 'response',
        description: 'Version 1 schema',
        outputSchema: v1OutputSchema,
        transformFromPrevious: z.any(),
        changes: [],
      },
    };

    it('should return latest schema when requesting current version', () => {
      const result = getSchemaForVersion(
        CURRENT_API_VERSION,
        latestSchema,
        schemaVersions
      );

      expect(result).toBe(latestSchema.schema);
    });

    it('should return version-specific output schema for older versions', () => {
      const result = getSchemaForVersion(
        '2025-10-10',
        latestSchema,
        schemaVersions
      );

      expect(result).toBe(v2OutputSchema);
    });

    it('should return oldest version schema when requested', () => {
      const result = getSchemaForVersion(
        '2025-09-01',
        latestSchema,
        schemaVersions
      );

      expect(result).toBe(v1OutputSchema);
    });

    it('should return latest schema when requested version not found', () => {
      const result = getSchemaForVersion(
        '2024-01-01' as Compat,
        latestSchema,
        schemaVersions
      );

      expect(result).toBe(latestSchema.schema);
    });

    it('should handle empty schema versions registry', () => {
      const result = getSchemaForVersion('2025-10-10', latestSchema, {});

      expect(result).toBe(latestSchema.schema);
    });

    it('should return correct schema for each version', () => {
      const v2Result = getSchemaForVersion(
        '2025-10-10',
        latestSchema,
        schemaVersions
      );
      const v1Result = getSchemaForVersion(
        '2025-09-01',
        latestSchema,
        schemaVersions
      );

      expect(v2Result).toBe(v2OutputSchema);
      expect(v1Result).toBe(v1OutputSchema);
      expect(v2Result).not.toBe(v1Result);
    });
  });
});
