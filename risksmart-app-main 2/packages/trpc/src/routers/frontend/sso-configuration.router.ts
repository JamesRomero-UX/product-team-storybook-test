import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createSsoConfigurationService } from '../../services/frontend/index';
import { Strategy } from '../../services/service.types';
import { logger } from '../../utils/logger';

export const ssoConfigurationRouter = router({
  list: authedProcedure.query(async (req) => {
    const ssoConfigurationService = createSsoConfigurationService();
    logger.debug(
      {
        userId: req.ctx.user.userId,
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      'Fetching SSO configurations'
    );

    return ssoConfigurationService.getSsoConfigurations({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  save: authedProcedure
    .input(
      z.object({
        strategy: z.nativeEnum(Strategy),
        domain: z.string().min(1),
        clientId: z.string().min(1),
        clientSecret: z.string().min(1),
        addOrgConnection: z.boolean(),
        connectionId: z.string().optional(),
        domainAliases: z.array(z.string()).optional(),
      })
    )
    .mutation(async (req) => {
      const ssoConfigurationService = createSsoConfigurationService();

      return ssoConfigurationService.saveSsoConfiguration(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          strategy: req.input.strategy,
          domain: req.input.domain,
          clientId: req.input.clientId,
          clientSecret: req.input.clientSecret,
          addOrgConnection: req.input.addOrgConnection,
          connectionId: req.input.connectionId,
          domainAliases: req.input.domainAliases,
        }
      );
    }),

  delete: authedProcedure
    .input(
      z.object({
        connectionId: z.string().min(1),
      })
    )
    .mutation(async (req) => {
      const ssoConfigurationService = createSsoConfigurationService();

      return ssoConfigurationService.deleteSsoConfiguration(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.connectionId
      );
    }),
});
