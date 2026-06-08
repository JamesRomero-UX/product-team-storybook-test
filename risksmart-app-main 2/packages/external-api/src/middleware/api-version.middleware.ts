import type { NextFunction, Response } from 'express';

import type { AuthenticatedRequest } from '../types/request';
import { isCompat } from '../utils/compat';
import { createMiddleware } from '../utils/createMiddleware';
import { logger } from '../utils/logger';
import {
  CURRENT_API_VERSION,
  SUPPORTED_API_VERSIONS,
  type SupportedApiVersion,
} from '../versions/index';

export const API_VERSION_HEADER = 'Risksmart-Version';

function isSupportedVersion(version: string): version is SupportedApiVersion {
  return (
    isCompat(version) &&
    SUPPORTED_API_VERSIONS.includes(version as SupportedApiVersion)
  );
}

// Internal middleware function that extracts and validates the API version from the request.
function apiVersionMiddlewareHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const headerVersionRaw = req.headers[API_VERSION_HEADER.toLowerCase()];
  const headerVersion = Array.isArray(headerVersionRaw)
    ? headerVersionRaw[0]
    : headerVersionRaw;

  // Pinned version from JWT, if available.
  const pinnedVersion = req.auth?.compat_version;

  const requestedVersion =
    (typeof headerVersion === 'string' && headerVersion) ||
    pinnedVersion ||
    CURRENT_API_VERSION;

  // Validate the version
  if (!isSupportedVersion(requestedVersion)) {
    logger.warn(
      {
        event: 'unsupported_api_version',
        requestedVersion,
        supportedVersions: SUPPORTED_API_VERSIONS,
      },
      'Unsupported API version requested, falling back to current version'
    );

    // Fall back to current version but continue processing
    req.apiVersion = CURRENT_API_VERSION;
  } else {
    req.apiVersion = requestedVersion;
  }

  // Add version to response headers so clients know what version was used
  res.setHeader(API_VERSION_HEADER, req.apiVersion);

  next();
}

/**
 * Middleware that extracts and validates the API version from the request.
 * Ready to use with app.use() without additional wrapping.
 *
 * @example
 * import { apiVersionMiddleware } from './middleware/api-version.middleware';
 *
 * app.use(apiVersionMiddleware);
 */
export const apiVersionMiddleware = createMiddleware(
  apiVersionMiddlewareHandler
);
