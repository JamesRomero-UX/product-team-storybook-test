import type { CircuitBreakerPolicy, IPolicy } from 'cockatiel';
import {
  bulkhead,
  circuitBreaker,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleWhen,
  retry,
  wrap,
} from 'cockatiel';

import { BaseApplicationError } from '../errors/base.errors';
import type { AppBreakerPolicyConfig } from '../schemas/app-config/app-config.schema';
import {
  isTRPCClientError,
  isTRPCTransientError,
} from '../trpc/trpc-error-mapping';
import { logger } from '../utils/logger';
import { metrics } from './metrics';

export type ManualBreakerState = 'Auto' | 'ForceOpen' | 'ForceClosed';

export default class CircuitBreaker {
  public policy: IPolicy;
  public manualOverride: ManualBreakerState = 'Auto';
  private breaker: CircuitBreakerPolicy;
  private isolationHandle: { dispose(): void } | null = null;

  constructor(config: AppBreakerPolicyConfig) {
    const handleWhenPolicy = handleWhen((error) => {
      // If it's a BaseApplicationError, check the isTransientFailure flag
      if (error instanceof BaseApplicationError) {
        return error.isTransientFailure;
      }

      // If it's a TRPCClientError, only count server errors (5xx) as transient
      // Client errors (4xx like BAD_REQUEST, NOT_FOUND) should not trip the breaker
      if (isTRPCClientError(error)) {
        return isTRPCTransientError(error);
      }

      // For other errors (network, timeout, etc.), assume they are transient
      return true;
    });
    // Only track transient failures for circuit breaker, not business logic failures
    const breaker = circuitBreaker(handleWhenPolicy, {
      halfOpenAfter: new ExponentialBackoff({
        initialDelay: config.resetTimeoutMs,
        maxDelay: 5 * config.resetTimeoutMs,
      }),
      breaker: new ConsecutiveBreaker(config.threshold),
    });

    // Only retry transient failures, not business logic failures
    const retryPolicy = retry(handleWhenPolicy, {
      maxAttempts: config.retryAttempts,
      backoff: new ExponentialBackoff({
        initialDelay: config.backoffBaseDelayMs,
      }),
    });

    const bulkheadPolicy = bulkhead(config.maxConcurrency, config.maxQueueSize);

    // Update current bulkhead queue size.
    const updateBulkheadQueueSize = () => {
      metrics.bulkheadQueueSize =
        config.maxQueueSize - bulkheadPolicy.queueSlots;
    };

    // Breaker hooks for logging & metrics.
    breaker.onBreak(() => {
      metrics.breakerTrips++;
      metrics.lastTrippedAt = new Date().toISOString();
      metrics.breakerState = 'Open';
      logger.error(metrics, 'Circuit breaker opened');
    });

    breaker.onReset(() => {
      metrics.breakerResets++;
      metrics.breakerState = 'Closed';
      logger.info(metrics, 'Circuit breaker reset');
    });

    breaker.onHalfOpen(() => {
      metrics.halfOpens++;
      metrics.breakerState = 'HalfOpen';
      logger.warn(metrics, 'Circuit breaker half-open');
    });

    bulkheadPolicy.onReject(() => {
      metrics.bulkheadRejects++;
      updateBulkheadQueueSize();
      logger.warn(metrics, 'Bulkhead queue full');
    });

    bulkheadPolicy.onSuccess(({ duration }) => {
      logger.debug(
        { duration },
        `bulkhead call successfully ran in ${duration}ms`
      );
      updateBulkheadQueueSize();
    });

    retryPolicy.onRetry((ctx) => {
      metrics.retries++;
      logger.warn(
        { attempt: ctx.attempt, delay: ctx.delay, metrics },
        'Retrying request due to transient failure'
      );
    });

    this.breaker = breaker;
    this.policy = wrap(retryPolicy, breaker, bulkheadPolicy);
  }

  // Manual breaker override function
  public setBreakerOverride(state: ManualBreakerState) {
    switch (state) {
      case 'ForceClosed':
        metrics.breakerState = 'Closed';
        this.setManualOverrideState('ForceClosed');
        logger.info(
          { manualOverride: state },
          'Circuit breaker manually closed, breaker bypassed.'
        );
        break;
      // Hold breaker open, short circuits to return Errors.
      case 'ForceOpen':
        if (this.isolationHandle) {
          this.isolationHandle.dispose();
        }
        // Isolate the breaker (force it open)
        this.isolationHandle = this.breaker.isolate();
        metrics.breakerState = 'Open';
        this.setManualOverrideState('ForceOpen');
        logger.info(
          { manualOverride: state },
          'Circuit breaker manually forced open'
        );
        break;
      // Resets breaker to normal operation.
      case 'Auto':
        if (this.isolationHandle) {
          this.isolationHandle.dispose();
          this.isolationHandle = null;
        }
        this.setManualOverrideState('Auto');
        logger.info(
          { manualOverride: state },
          'Circuit breaker returned to automatic mode'
        );
        break;
    }
  }

  private setManualOverrideState(state: ManualBreakerState) {
    this.manualOverride = state;
  }
}
