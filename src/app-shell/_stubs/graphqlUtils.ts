export const evictField = (..._args: any[]) => {};

// HasuraErrorCodes / isPermissionError are referenced by FormInner.tsx in
// the dev repo's form engine. We stub them with no-op values — the
// templates we ship don't trigger error paths, and the form engine
// itself is intentionally deferred.
export enum HasuraErrorCodes {
  PermissionError = 'permission-error',
  UnexpectedError = 'unexpected',
  ConstraintError = 'constraint-violation',
  ValidationFailed = 'validation-failed',
}
export const isPermissionError = (_e: unknown) => false;

export default { evictField, HasuraErrorCodes, isPermissionError };
