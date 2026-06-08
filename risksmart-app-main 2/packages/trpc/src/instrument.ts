import * as Sentry from '@sentry/node';
import { eventLoopBlockIntegration } from '@sentry/node-native';
Sentry.init({
  dsn: process.env['SENTRY_DSN'],
  integrations: [eventLoopBlockIntegration({ threshold: 1000 })],
  environment: process.env['SENTRY_ENVIRONMENT'] ?? 'development',
  release: `trpc@${process.env['TRPC_CONTAINER_BUILD']}`,
  tracesSampler: ({ name }) => {
    // Ignore healthz requests
    if (name.includes('/healthz')) {
      return 0;
    }
    // Ignore all permit proxy events
    if (name.includes('/{*splat}')) {
      return 0;
    }

    return 1;
  },
  beforeSendTransaction: (transaction) => {
    // Additional filtering for transactions that might bypass tracesSampler
    if (
      transaction.transaction &&
      (transaction.transaction.includes('/{*splat}') ||
        transaction.transaction.includes('/healthy') ||
        transaction.transaction.includes('/healthz'))
    ) {
      return null;
    }

    return transaction;
  },
  beforeSend: (event) => {
    // Filter out spans related to health checks and proxy routes
    if (event.spans) {
      event.spans = event.spans.filter((span) => {
        const description = span.description || '';
        const route = span.data?.['http.route'] || '';
        const target = span.data?.['http.target'] || '';

        // Filter out health check spans
        return !(
          target === '/healthy' ||
          target === '/healthz' ||
          route === '/{*splat}' ||
          description.includes('/{*splat}')
        );
      });
    }

    return event;
  },
});
