import crypto from 'crypto';
import helmet from 'helmet';

import { createPublicMiddleware } from '../utils/createMiddleware';

export const nonceMiddleware = createPublicMiddleware((req, res, next) => {
  // generate a nonce random string and attach to locals.
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

export const docsCSPMiddleware = createPublicMiddleware((req, res, next) => {
  const nonce = res.locals.cspNonce as string;
  const defaults = helmet.contentSecurityPolicy.getDefaultDirectives();
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      ...defaults,
      'script-src': ["'self'", 'https://cdn.redoc.ly', `'nonce-${nonce}'`],
      'script-src-elem': ["'self'", 'https://cdn.redoc.ly', `'nonce-${nonce}'`],
      'img-src': ["'self'", 'data:', 'https://cdn.redoc.ly'],
      'connect-src': ["'self'"],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      'style-src-elem': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    },
  })(req, res, next);
});
