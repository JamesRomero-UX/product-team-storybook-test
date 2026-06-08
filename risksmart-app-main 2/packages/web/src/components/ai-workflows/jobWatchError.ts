// no-dd-sa
import type { FailureStatus } from '@/components/ai-workflows/useJobMonitor';

export class JobWatchError extends Error {
  constructor(
    public readonly failureType: FailureStatus,
    message?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}
