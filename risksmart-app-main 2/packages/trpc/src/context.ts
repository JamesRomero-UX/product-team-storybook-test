import { TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';

import { logger } from './utils/logger';

const knownBackendServices = ['external-api'];

const allowedPaths = [
  '/frontend.aiFeedback.submitWorkflowFeedback',
  '/frontend.aiFeedback.submitAiAssistantFeedback',
];

export interface Context {
  req: Request;
  res: Response;
  user: {
    orgId: string;
    userId: string;
    tenant: string;
    isBackend: boolean;
    features: string[];
  };
}
export const createContext = ({
  req,
  res,
}: CreateExpressContextOptions): Context => {
  function getUserFromHeader() {
    if (
      req?.headers?.authorization &&
      req.headers.authorization.split(' ').length == 2
    ) {
      logger.debug('decoding user');
      const token = req.headers.authorization.split(' ')[1]!;
      const hasuraNamespace = 'https://hasura.io/jwt/claims';
      const tenantNameSessionKey = 'x-hasura-tenant-name';
      const claimsFromToken = jwtDecode<{
        org_id?: string;
        tenant_id: string;
        source_service?: string;
        [hasuraNamespace]: {
          'x-hasura-features': string;
          'x-hasura-default-role': string;
          'x-hasura-allowed-roles': string[];
          'x-hasura-user-id': string;
          'x-hasura-org-id': string;
          'x-hasura-logo'?: string;
          [tenantNameSessionKey]: string;
        };
      }>(token);
      const hasuraClaims = claimsFromToken[hasuraNamespace] || {};
      const fromBackendService = knownBackendServices.includes(
        claimsFromToken.source_service || ''
      );
      const features = hasuraClaims['x-hasura-features']?.split(',') || [];
      const orgId = hasuraClaims['x-hasura-org-id'] || claimsFromToken.org_id;
      const userId = hasuraClaims['x-hasura-user-id'];
      // Normalize tenant to lowercase for consistency (legacy tokens may have PascalCase)
      const tenant = (
        hasuraClaims['x-hasura-tenant-name'] || claimsFromToken.tenant_id
      )?.toLowerCase();
      if (!orgId || !tenant || (userId && fromBackendService)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized',
          cause: 'No auth headers',
        });
      }

      if (
        !features.includes('trpc') &&
        fromBackendService === false &&
        !allowedPaths.includes(req.path)
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to use this feature',
          cause: 'Feature not enabled',
        });
      }

      return {
        orgId,
        userId,
        tenant,
        isBackend: fromBackendService,
        features,
      };
    }

    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You are not authorized',
      cause: 'No auth headers',
    });
  }
  const user = getUserFromHeader();

  return {
    req,
    res,
    user,
  };
};
