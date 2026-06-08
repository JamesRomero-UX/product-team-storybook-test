import type { RedocConfig } from '../../config/redoc.config';
import { generateOpenApiDocument } from '../../schemas/openapi.schema';
import type { ServiceConfig } from '../../types/service';
import type { Compat } from '../../types/versioning';
import { b64url, ub64url } from '../../utils/buffer';
import { generateSignature, validateSignature } from '../../utils/crypto';
import { buildBaseUrl, normalizeUrlPath } from '../../utils/string';
import { CURRENT_API_VERSION } from '../../versions/index';

export type DocumentationService = ReturnType<typeof documentationService>;

export interface DocumentationServiceConfig extends ServiceConfig {
  docsSigningKey: string;
  docsExpiryHrs: number;
  redocDefaultTheme: RedocConfig['defaultTheme'];
  appDomain: string;
}

export function documentationService(config: DocumentationServiceConfig) {
  const { basePath, docsExpiryHrs, docsSigningKey, appDomain } = config;
  const normalizedBasePath = normalizeUrlPath(basePath);
  const docsPath = `${normalizedBasePath}/docs`;
  const apiBaseUrl = buildBaseUrl(appDomain);

  const createSigPayload = (expiry: number) => `GET:${docsPath}:${expiry}`;

  const getSignedDocumentationPath = () => {
    const expiresAt = Date.now() + docsExpiryHrs * 3600 * 1000;
    const sigPayload = createSigPayload(expiresAt);
    const signature = b64url(generateSignature(sigPayload, docsSigningKey));

    return { signedDocsPath: `${docsPath}?sig=${signature}&exp=${expiresAt}` };
  };

  const verifyDocumentationPathSignature = (
    signature: string,
    expiry: number
  ): boolean => {
    const unencodedSig = ub64url(signature);
    const sigPayload = createSigPayload(expiry);
    const isValidSignature = validateSignature(
      sigPayload,
      unencodedSig,
      docsSigningKey
    );
    if (!isValidSignature) {
      return false;
    }
    // then check supplied expiry
    const currentTs = Date.now();
    if (expiry <= currentTs) {
      return false;
    }

    return true;
  };

  // Generate latest OpenAPI spec for the docs UI
  const latestOpenApiSpec = generateOpenApiDocument(
    CURRENT_API_VERSION,
    apiBaseUrl
  );

  const getRedocOptions = () => ({
    title: 'Developers Documentation',
    spec: latestOpenApiSpec,
    redocOptions: {
      theme: config.redocDefaultTheme,
      scrollYOffset: 0,
      hideDownloadButton: false,
      expandResponses: '200,201',
      onlyRequiredInSamples: true,
      disableSearch: true,
      hideSchemaTitles: true,
    },
  });

  // Get OpenAPI document for a specific API version.
  // Generates the appropriate schema based on the requested version.
  const getOpenApiDocument = (apiVersion: Compat = CURRENT_API_VERSION) => {
    return generateOpenApiDocument(apiVersion, apiBaseUrl);
  };

  return {
    getSignedDocumentationPath,
    verifyDocumentationPathSignature,
    getRedocOptions,
    getOpenApiDocument,
  };
}
