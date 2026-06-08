import './utils/tracer';

import app from './app';
import { logStartup } from './utils/logger';

const port = parseInt(process.env.PORT || '3030', 10);
const env = process.env.NODE_ENV || 'development';
const appEnv = process.env.APP_ENVIRONMENT || 'unknown';

// Start server
app.listen(port, () => {
  logStartup({
    port,
    env,
    appEnv,
  });
});
