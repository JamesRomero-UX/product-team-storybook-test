import type { z } from 'zod';

import type {
  LatestSchemaDefinition,
  SchemaVersionDefinition,
} from '../types/schema-registry.types';
import type { Compat } from '../types/versioning';
import { CURRENT_API_VERSION } from '../versions/index';

// Applies schema transformations by chaining Zod transforms from latest to target version.
export function applySchemaVersionTransforms<TLatest, TTarget = TLatest>(
  latestData: TLatest,
  targetVersion: Compat,
  schemaVersions: Record<Compat, SchemaVersionDefinition<'response'>>
): TTarget {
  // If requesting current/latest version, return as-is
  if (targetVersion === CURRENT_API_VERSION) {
    return latestData as unknown as TTarget;
  }
  // Get ordered versions (newest to oldest)
  const orderedVersions = Object.keys(schemaVersions)
    .sort()
    .reverse() as Compat[];
  // Find target version index
  const targetIdx = orderedVersions.indexOf(targetVersion);

  if (targetIdx === -1) {
    // Target version not found, return latest
    return latestData as unknown as TTarget;
  }

  // Apply transformations: latest > first version > n(version) > target
  let transformed: unknown = latestData;
  for (let i = 0; i <= targetIdx; i++) {
    const version = orderedVersions[i];
    if (!version) {
      continue;
    }
    const versionDef = schemaVersions[version];
    if (!versionDef) {
      continue;
    }
    // Apply the Zod transform & validate.
    transformed = versionDef.transformFromPrevious.parse(transformed);
  }

  return transformed as TTarget;
}

// Get the appropriate schema for OpenAPI generation based on version.
export function getSchemaForVersion(
  apiVersion: Compat,
  latestSchema: LatestSchemaDefinition<'response'>,
  schemaVersions: Record<Compat, SchemaVersionDefinition<'response'>>
): z.ZodType {
  if (apiVersion === CURRENT_API_VERSION) {
    return latestSchema.schema;
  }
  const versionDef = schemaVersions[apiVersion];

  return versionDef?.outputSchema || latestSchema.schema;
}
