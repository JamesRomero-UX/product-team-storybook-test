/**
 * Custom middleware that fixes CORS headers for Storybook composition.
 *
 * Storybook's built-in /index.json handler sets Access-Control-Allow-Origin: *
 * but the manager fetches with credentials: "include". Per the CORS spec,
 * wildcard origins are not allowed when credentials are included — the server
 * must echo the specific requesting origin and set Allow-Credentials: true.
 *
 * Two layers of CORS fixing:
 * 1. Set headers BEFORE next() so Vite-served files (.tsx modules) get CORS
 *    headers for cross-origin dynamic imports.
 * 2. Wrap res.end() to overwrite headers AFTER Storybook route handlers
 *    (like /index.json) that set Access-Control-Allow-Origin: *.
 */
// @ts-ignore
export default function middleware(app) {
  // @ts-ignore
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin) {
      // Set CORS headers early for Vite-served files (dynamic imports)
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Also wrap res.end() to fix headers after Storybook route handlers
      // that overwrite Access-Control-Allow-Origin with *
      const origEnd = res.end;
      // @ts-ignore
      res.end = function (...args) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return origEnd.apply(this, args);
      };
    }

    if (req.method === 'OPTIONS') {
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Accept, Content-Type, Authorization'
        );
      }
      res.statusCode = 200;
      res.end();
      return;
    }

    next();
  });
}
