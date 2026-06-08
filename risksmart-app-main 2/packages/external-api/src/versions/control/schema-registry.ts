import {
  ControlItemResponseSchema,
  ControlListResponseSchema,
} from '../../schemas/risks/control.schema';
import {
  ControlItemResponseSchema_v2025_09_01,
  ControlItemResponseSchema_v2025_10_10,
  ControlItemTransform_to_v2025_09_01,
  ControlItemTransform_to_v2025_10_10,
  ControlListResponseSchema_v2025_09_01,
  ControlListResponseSchema_v2025_10_10,
  ControlListTransform_to_v2025_10_10,
} from '../../schemas/versions/control.schemas';
import type {
  LatestSchemaDefinition,
  SchemaVersionDefinition,
} from '../../types/schema-registry.types';
import type { Compat } from '../../types/versioning';

// Latest Control Item response schema (unversioned, always current)
export const controlItemResponseSchemaLatest: LatestSchemaDefinition<'response'> =
  {
    schemaType: 'response',
    schema: ControlItemResponseSchema,
    description: 'Latest Control item response schema',
    version: 'latest',
  };

// Control item response schema versions.
export const controlItemResponseSchemaVersions: Record<
  Compat,
  SchemaVersionDefinition<'response'>
> = {
  '2025-10-10': {
    version: '2025-10-10',
    schemaType: 'response',
    description: 'Renamed updatedBy to modifiedBy for consistency',
    outputSchema: ControlItemResponseSchema_v2025_10_10,
    transformFromPrevious: ControlItemTransform_to_v2025_10_10,
    changes: [
      {
        type: 'breaking',
        description: 'Renamed `updatedBy` field to `modifiedBy`',
        fields: ['updatedBy', 'modifiedBy'],
        impact: 'response',
      },
      {
        type: 'breaking',
        description: 'Renamed `links.updatedBy` to `links.modifiedBy`',
        fields: ['links.updatedBy', 'links.modifiedBy'],
        impact: 'response',
      },
    ],
  },
  '2025-09-01': {
    version: '2025-09-01',
    schemaType: 'response',
    description: 'Removed ancestorContributors to simplify response',
    outputSchema: ControlItemResponseSchema_v2025_09_01,
    transformFromPrevious: ControlItemTransform_to_v2025_09_01,
    changes: [
      {
        type: 'breaking',
        description: 'Removed `ancestorContributors` field from response',
        fields: ['ancestorContributors'],
        impact: 'response',
      },
    ],
  },
};

// Latest Control List response schema (unversioned, always current)
export const controlListResponseSchemaLatest: LatestSchemaDefinition<'response'> =
  {
    schemaType: 'response',
    schema: ControlListResponseSchema,
    description: 'Latest Control list response schema',
    version: 'latest',
  };

// Control list response schema versions
export const controlListResponseSchemaVersions: Record<
  Compat,
  SchemaVersionDefinition<'response'>
> = {
  '2025-10-10': {
    version: '2025-10-10',
    schemaType: 'response',
    description: 'Renamed updatedBy to modifiedBy for consistency',
    outputSchema: ControlListResponseSchema_v2025_10_10,
    transformFromPrevious: ControlListTransform_to_v2025_10_10,
    changes: [
      {
        type: 'breaking',
        description: 'Renamed `updatedBy` field to `modifiedBy`',
        fields: ['updatedBy', 'modifiedBy'],
        impact: 'response',
      },
      {
        type: 'breaking',
        description: 'Renamed `links.updatedBy` to `links.modifiedBy`',
        fields: ['links.updatedBy', 'links.modifiedBy'],
        impact: 'response',
      },
    ],
  },
  '2025-09-01': {
    version: '2025-09-01',
    schemaType: 'response',
    description: 'No changes for list response',
    outputSchema: ControlListResponseSchema_v2025_09_01,
    transformFromPrevious: ControlListResponseSchema_v2025_10_10.transform(
      (data) => data
    ),
    changes: [],
  },
};
