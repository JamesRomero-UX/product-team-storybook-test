import * as Sentry from '@sentry/node';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import type { Context } from './context';
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  })
);
export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
const sentrifiedProcedure = t.procedure.use(sentryMiddleware);
export const publicProcedure = sentrifiedProcedure;
export const authedProcedure = sentrifiedProcedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return opts.next({
      ctx: {
        user: ctx.user,
      },
    });
  }
);
export const backendProcedure = authedProcedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;
    if (ctx.user.isBackend !== true) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return opts.next({
      ctx: {
        user: ctx.user,
      },
    });
  }
);
