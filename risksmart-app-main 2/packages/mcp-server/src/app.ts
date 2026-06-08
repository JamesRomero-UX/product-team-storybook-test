import './utils/tracer'; // Must be first — dd-trace patches modules at import time
import 'dotenv/config';

import { createServer } from './server';
import { getEnv } from './utils/environment';
import { logger } from './utils/logger';

const mcpServerUrl = getEnv('MCP_SERVER_URL');
const port = parseInt(getEnv('PORT', '8022'), 10);

logger.info(
  {
    port,
    mcpServerUrl,
    auth0Domain: getEnv('AUTH0_DOMAIN', '(not set)'),
    trpcBaseUrl: getEnv('TRPC_SERVICE_BASE_URL', '(not set)'),
    hasManagementCreds: !!(
      process.env.AUTH0_MANAGEMENT_CLIENT_ID &&
      process.env.AUTH0_MANAGEMENT_CLIENT_SECRET
    ),
  },
  'MCP server starting with config'
);

const server = createServer();

server
  .start({
    transportType: 'httpStream',
    httpStream: {
      port,
      host: '0.0.0.0',
      endpoint: '/mcp',
    },
  })
  .then(() => {
    logger.info({ port, mcpServerUrl }, 'MCP server started');
  })
  .catch((err: unknown) => {
    logger.fatal({ err }, 'MCP server failed to start');
    process.exit(1);
  });
