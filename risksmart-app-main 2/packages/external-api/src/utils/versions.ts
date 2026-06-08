import type { Compat } from '../types/versioning';
import {
  controlItemResponseSchemaVersions,
  controlListResponseSchemaVersions,
} from '../versions/control/schema-registry';
import { applySchemaVersionTransforms } from './schema-versioning';

export const appVersion = `v${process.env.PACKAGE_VERSION || '0.0.1'}`;

// Helper function to apply version transformations to response data using Zod schemas.
export function versionResponse<TLatest, TTarget = TLatest>(
  resourceName: string,
  data: TLatest,
  targetVersion: Compat,
  // added ctx as it might be needed for future transforms.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx: { basePath: string; requestId: string }
): TTarget {
  // Get the appropriate schema registry based on resource
  let schemaVersions;
  switch (resourceName) {
    case 'control':
      schemaVersions = controlItemResponseSchemaVersions;
      break;
    case 'control-list':
      schemaVersions = controlListResponseSchemaVersions;
      break;
    default:
      // Resource doesn't have schema versioning yet so just return data.
      return data as unknown as TTarget;
  }

  return applySchemaVersionTransforms<TLatest, TTarget>(
    data,
    targetVersion,
    schemaVersions
  );
}

// Helper function to apply version transformations to an array of response data.
export function versionResponseList<TLatest, TTarget = TLatest>(
  resourceName: string,
  dataArray: TLatest[],
  targetVersion: Compat,
  ctx: { basePath: string; requestId: string }
): TTarget[] {
  return dataArray.map((item) =>
    versionResponse<TLatest, TTarget>(resourceName, item, targetVersion, ctx)
  );
}
