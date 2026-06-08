import type { RequestHandler } from 'express';

import { riskSmartLogoData } from '../docs/logo-data';
import { createPublicHandler } from './createHandler';

interface RedocInlineLogo {
  /** data URI (e.g., 'data:image/svg+xml;base64,....') or a regular URL */
  image: string;
  altText?: string;
  backgroundColor?: string;
  gutter?: string | number;
  href?: string;
}

interface RedocInlineOptions {
  title?: string;
  spec: object;
  head?: string;
  redocOptions?: Record<string, unknown>;
  logo?: RedocInlineLogo;
}

export function redocInline(opts: RedocInlineOptions): RequestHandler {
  const { title = 'API Docs', spec, head = '', redocOptions = {} } = opts;

  const safeSpec = JSON.stringify(spec).replace(/</g, '\\u003c');
  const safeOpts = JSON.stringify(redocOptions);

  return createPublicHandler((req, res) => {
    const nonce = res.locals.cspNonce ?? '';
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    ${head}
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        html, body { margin: 0; padding: 0; height: 100%; }
        .header-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background-color: #14143a;
          padding: 16px 24px;
          display: flex;
          align-items: center;
        }
        #redoc {
          margin-top: 65px;
        }
        .header-bar img {
          height: 33.6px;
          width: auto;
        }
        .redoc-wrap { margin: 0 !important; padding: 0 !important; }
        .redoc-wrap .right-panel .content-type,
        .redoc-wrap .right-panel .content-type *,
        .redoc-wrap .right-panel .content-type input { color:#FFF !important; }

        .redoc-wrap .response-tabs .tab-item {
          border: 1px solid #00DECB !important;
          background-color: transparent !important;
          color: #00DECB !important;
          border-radius: 6px !important;
          font-weight: 600;
        }
        .redoc-wrap .response-tabs .tab-item.active {
          background-color: #00DECB !important;
          color: #0B1020 !important;
        }
        .redoc-wrap .response-tabs .tab-item:hover:not(.active) {
          background-color: rgba(0, 222, 203, 0.1) !important;
        }
      </style>
  </head>
  <body>
    <header class="header-bar">
      <img src="${riskSmartLogoData}" alt="RiskSmart" />
    </header>
    <div id="redoc"></div>
    <script nonce=${nonce ?? ''} src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    <script nonce=${nonce ?? ''}>
      const spec = ${safeSpec};
      const options = ${safeOpts};
      Redoc.init(spec, options, document.getElementById('redoc'));
    </script>
  </body>
</html>`);
  });
}
