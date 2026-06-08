import type { IPolicy } from 'cockatiel';

// Wrapper for protecting unsafe calls with a breaker policy.
export function withPolicy<TArgs extends unknown[], TResult>(
  policy: IPolicy,
  fn: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => policy.execute(() => fn(...args));
}
