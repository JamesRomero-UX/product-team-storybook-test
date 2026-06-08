import { authedProcedure, router } from '../../../init';
import {
  assertReadNode,
  assertReadSettings,
  assertUpdateSettings,
  getKnockTenant,
} from './auth';
import {
  enrichMessages,
  fetchDigestActivities,
  listBatchMessages,
} from './history-service';
import { resolveKnockConfig } from './knock-client';
import {
  getTenantPreferences,
  setTenantPreferences,
} from './preferences-service';
import {
  digestActivitiesInputSchema,
  listBatchInputSchema,
} from './types/history';
import { tenantPreferenceSetInputSchema } from './types/preferences';

export const notificationsRouter = router({
  history: router({
    listBatch: authedProcedure
      .input(listBatchInputSchema)
      .query(async ({ ctx, input }) => {
        if (!input.objectId) {
          await assertReadSettings(ctx.user);
        } else {
          await assertReadNode(ctx.user, input.objectId);
        }

        const config = resolveKnockConfig();
        const response = await listBatchMessages(
          config,
          input,
          getKnockTenant(ctx.user)
        );
        response.items = await enrichMessages(config, response.items);

        // Exclude digest messages from entity-level views (they can't be reliably filtered by object)
        if (input.objectId) {
          response.items = response.items.filter(
            (m) => m.source?.key !== 'digest' && m.workflow !== 'digest'
          );
        }

        return response;
      }),

    getDigestActivities: authedProcedure
      .input(digestActivitiesInputSchema)
      .query(async ({ ctx, input }) => {
        await assertReadSettings(ctx.user);

        const config = resolveKnockConfig();

        return fetchDigestActivities(
          config,
          input.messageId,
          getKnockTenant(ctx.user)
        );
      }),
  }),

  preferences: router({
    get: authedProcedure.query(async ({ ctx }) => {
      await assertReadSettings(ctx.user);
      const config = resolveKnockConfig();
      const tenant = getKnockTenant(ctx.user);

      return getTenantPreferences(config, tenant);
    }),

    set: authedProcedure
      .input(tenantPreferenceSetInputSchema)
      .mutation(async ({ ctx, input }) => {
        await assertUpdateSettings(ctx.user);
        const config = resolveKnockConfig();
        const tenant = getKnockTenant(ctx.user);
        await setTenantPreferences(config, tenant, input);
      }),
  }),
});
