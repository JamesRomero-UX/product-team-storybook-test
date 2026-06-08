import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createFormConfigurationBackendService } from '../../services/backend/index';

const formConfigurationService = createFormConfigurationBackendService();

export const formConfigurationRouter = router({
  getByParentTypes: backendProcedure
    .input(
      z.object({
        parentTypes: z
          .array(z.nativeEnum(ParentTypes))
          .min(1)
          .max(Object.keys(ParentTypes).length),
      })
    )
    .query((req) => {
      return formConfigurationService.getByParentTypes(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.parentTypes
      );
    }),
});
