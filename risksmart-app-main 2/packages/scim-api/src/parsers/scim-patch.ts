import { mapScimAttributeToHasura } from 'src/scim/mappings';
import type { ScimPatchOperation } from 'src/scim/types';

export const parse = (operations: ScimPatchOperation[]) => {
  const updates: Record<string, unknown> = {};

  for (const op of operations) {
    if (op.op.toLowerCase() === 'remove' && !op.value) {
      // Handle remove by setting to null if value is not specified
      updates[mapScimAttributeToHasura(op.path!)] = null;
    } else if (op.op.toLowerCase() === 'replace' && !op.path) {
      if (typeof op.value === 'object' && op.value !== null) {
        for (const key of Object.keys(op.value)) {
          updates[mapScimAttributeToHasura(key)] =
            op.value[key as keyof typeof op.value];
        }
      }
    } else {
      // Assume add and replace operations provide a value directly
      updates[mapScimAttributeToHasura(op.path!)] = op.value;
    }
  }
  if ('Status' in updates) {
    if (
      updates['Status'] === true ||
      updates['Status'] === 'True' ||
      updates['Status'] === 'true'
    ) {
      updates['Status'] = 'active';
    } else if (
      updates['Status'] === false ||
      updates['Status'] === 'False' ||
      updates['Status'] === 'false'
    ) {
      updates['Status'] = 'archived';
    }
  }

  console.debug('updates', updates);

  return updates;
};
