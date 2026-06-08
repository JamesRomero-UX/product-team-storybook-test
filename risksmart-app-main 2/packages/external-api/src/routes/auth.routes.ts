import express from 'express';

import {
  getServiceContext,
  getServiceContextWithActor,
} from '../http/request/service-context';
import { validateRequest } from '../middleware/validate-request.middleware';
import type { AppClientRequest } from '../schemas/app-clients/app-client.schema';
import {
  appClientItemRequestInputSchema,
  appClientRequestSchema,
} from '../schemas/app-clients/app-client.schema';
import { AuthTokenRequestSchema } from '../schemas/auth.schema';
import type { AppClientsService } from '../services/app-clients/app-clients.service';
import type { TransformClientsListFn } from '../transformers/app-clients/app-client.transformer';
import type { AuthenticatedRequest } from '../types/request';
import {
  createAsyncAuthedHandler,
  createAsyncPublicHandler,
} from '../utils/createHandler';
import { hasAnyMatch } from '../utils/string';
import type { AuthRouterConfig } from './index';

interface AuthRouterProps {
  appClientService: AppClientsService;
  transformAppClientList: TransformClientsListFn;
  config: AuthRouterConfig;
}

export const authRouter = ({
  appClientService,
  transformAppClientList,
  config,
}: AuthRouterProps) => {
  const router = express.Router();
  const { allowedUserRoles } = config;
  const checkForRSUserAccess = (req: AuthenticatedRequest) => {
    // Token must have an allowed role claims.
    const hasuraClaims = req.auth?.['https://hasura.io/jwt/claims'];
    if (
      hasAnyMatch(
        hasuraClaims?.['x-hasura-allowed-roles'] || [],
        allowedUserRoles
      )
    ) {
      return true;
    }

    return false;
  };

  // public get JWT token endpoint.
  router.post(
    '/token',
    createAsyncPublicHandler(async (req, res) => {
      const validBody = AuthTokenRequestSchema.parse(req.body);
      const response = await appClientService.createAppClientToken(validBody);
      res.json(response);
    })
  );

  // fetch a list of client credentials.
  router.get(
    '/clients',
    createAsyncAuthedHandler(
      { requiredScopes: [], extraCheck: checkForRSUserAccess },
      async (req, res) => {
        const ctx = getServiceContext(req);
        const result = await appClientService.getAppClients({
          authToken: ctx.authToken,
          orgId: ctx.orgId,
          tenantId: ctx.tenantId,
        });
        try {
          const responseData = transformAppClientList(result);
          res.json(responseData);
        } catch (err) {
          req.requestLogger.error(
            { event: 'list_response_data_error', err },
            'Error while trying to transform response list data'
          );
          // re-throw to be caught by global error middleware.
          throw err;
        }
      }
    )
  );

  // create client credentials.
  router.post(
    '/clients',
    validateRequest({ body: appClientRequestSchema }),
    createAsyncAuthedHandler<Record<string, never>, AppClientRequest>(
      { requiredScopes: [], extraCheck: checkForRSUserAccess },
      async (req, res) => {
        const result = await appClientService.createAppClient(
          req.body,
          getServiceContextWithActor(req)
        );
        res.json(result.data);
      }
    )
  );

  // delete a client credential by id.
  router.delete(
    '/clients/:clientId',
    validateRequest({ params: appClientItemRequestInputSchema }),
    createAsyncAuthedHandler<{ clientId: string }>(
      { requiredScopes: [], extraCheck: checkForRSUserAccess },
      async (req, res) => {
        const result = await appClientService.removeAppClient(
          req.params,
          getServiceContextWithActor(req)
        );
        res.json(result.data);
      }
    )
  );

  return router;
};
