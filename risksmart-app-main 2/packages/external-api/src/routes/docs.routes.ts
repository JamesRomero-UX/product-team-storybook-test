import express from 'express';

import {
  docsCSPMiddleware,
  nonceMiddleware,
} from '../middleware/helmet.middleware';
import { signedURLMiddleware } from '../middleware/signed-route.middleware';
import type { DocumentationService } from '../services/documentation/documentation.service';
import type { Compat } from '../types/versioning';
import { createAsyncAuthedHandler } from '../utils/createHandler';
import { redocInline } from '../utils/redoc-inline';

interface DocsRouterProps {
  docsService: DocumentationService;
}

export const docsRouter = ({ docsService }: DocsRouterProps) => {
  const router = express.Router();
  // Documentation UI endpoint using the OpenAPI spec
  router.get(
    '/',
    signedURLMiddleware({
      signatureVerifyFn: docsService.verifyDocumentationPathSignature,
    }),
    nonceMiddleware,
    docsCSPMiddleware,
    redocInline(docsService.getRedocOptions())
  );

  router.get(
    '/openapi.json',
    createAsyncAuthedHandler(
      { requiredScopes: ['documentation:read'] },
      (req, res) => {
        // Use the API version from the request (set by apiVersionMiddleware or request query string)
        const apiVersionQs = req.query.risksmart_version as Compat | undefined;
        const apiVersion = apiVersionQs ?? req.apiVersion;

        req.requestLogger.info(
          {
            event: 'openapi_document_requested',
            apiVersion,
          },
          'Generating OpenAPI document for version'
        );
        res.json(docsService.getOpenApiDocument(apiVersion));
      }
    )
  );

  return router;
};
