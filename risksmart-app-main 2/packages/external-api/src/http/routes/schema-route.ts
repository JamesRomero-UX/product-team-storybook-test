import type { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import type { RequestHandler } from 'express';

import type { AuthProps } from '../../auth/route-wrapper.auth';
import type { SchemaService } from '../../services/common/schema.service';
import { transformResourceSchema } from '../../transformers/common/resource-schema.transformer';
import { createAsyncAuthedHandler } from '../../utils/createHandler';
import { getServiceContext } from '../request/service-context';

export function createSchemaRouteHandler(
  parentType: (typeof ParentTypes)[keyof typeof ParentTypes],
  authConfig: AuthProps,
  schemaService: SchemaService
): RequestHandler {
  return createAsyncAuthedHandler(authConfig, async (req, res) => {
    const formConfigs = await schemaService.getResourceSchema(
      parentType,
      getServiceContext(req)
    );
    res.json(transformResourceSchema(formConfigs));
  });
}
