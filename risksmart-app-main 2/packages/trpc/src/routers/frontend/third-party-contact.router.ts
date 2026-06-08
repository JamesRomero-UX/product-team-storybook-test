import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createThirdPartyContactService } from '../../services/frontend/index';

const getContactsByThirdPartySchema = z.object({
  thirdPartyId: z.string().uuid(),
  isIncludingRevoked: z.boolean().optional().default(false),
});

const getContactByIdSchema = z.object({
  contactId: z.string().uuid(),
});

export const thirdPartyContactRouter = router({
  /**
   * List contacts for a third party (database only - use REST API getLoginStatus for Auth0 status)
   */
  list: authedProcedure
    .input(getContactsByThirdPartySchema)
    .query(async (req) => {
      const service = createThirdPartyContactService();

      return await service.getContactsByThirdParty(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.thirdPartyId,
        req.input.isIncludingRevoked
      );
    }),

  /**
   * Get a single contact by ID
   */
  getById: authedProcedure.input(getContactByIdSchema).query(async (req) => {
    const service = createThirdPartyContactService();

    return await service.getContactById(
      {
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
        userId: req.ctx.user.userId,
      },
      req.input.contactId
    );
  }),

  /**
   * Get active (non-revoked) contacts for a third party (for questionnaire invite dropdown)
   */
  getActiveContacts: authedProcedure
    .input(z.object({ thirdPartyId: z.string().uuid() }))
    .query(async (req) => {
      const service = createThirdPartyContactService();

      return await service.getActiveContacts(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.thirdPartyId
      );
    }),
});
