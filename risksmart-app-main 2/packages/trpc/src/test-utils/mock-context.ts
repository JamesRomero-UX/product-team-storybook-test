import type { Context } from '../context';

/**
 * Creates a mock Context for router unit tests.
 *
 * Router procedures only access `ctx.user` — the Express `req` and `res`
 * objects are carried through the middleware chain but never read by the
 * router logic under test. This helper returns a properly-typed Context
 * with minimal stub objects for req/res.
 *
 * Pass `null` for user to test UNAUTHORIZED rejection.
 */
export function createMockContext(user: Context['user'] | null): Context {
  return { req: {}, res: {}, user } as Context;
}
