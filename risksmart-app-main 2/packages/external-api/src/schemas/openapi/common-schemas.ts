import { entityIdValue, providerIdOrUuid } from '../../utils/schemas';
import { z } from '../openapi.zod';

// Common request schemas used across OpenAPI path definitions

// Authorization header schema used in all authenticated requests
export const authHeaderSchema = z.object({
  Authorization: z.string(),
});

// UUID parameter schema used for ID-based resource lookups
export const uuidParamSchema = (
  useMixedIdType = false,
  ...paramNames: string[]
) => {
  const params = paramNames.length > 0 ? paramNames : ['id'];
  const schema: Record<string, typeof providerIdOrUuid> = {};

  for (const paramName of params) {
    schema[paramName] = useMixedIdType ? providerIdOrUuid : entityIdValue;
  }

  return z.object(schema);
};
