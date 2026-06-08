import type {
  CreateUserPoolClientCommandInput,
  DeleteUserPoolClientCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
  DeleteUserPoolClientCommand,
  TimeUnitsType,
} from '@aws-sdk/client-cognito-identity-provider';

import { InvalidAuthTokenRequestError } from '../errors/auth.errors';
import type {
  CreateUserPoolClientParams,
  CreateUserPoolClientResult,
  GetClientAccessToken,
  RemoveUserPoolClientParams,
} from '../types/auth-client';
import { logger } from '../utils/logger';

interface CognitoTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
  scope?: string;
}

export class CognitoAuthClient {
  constructor(
    private tokenUrl: string,
    private userPoolId: string,
    private accessTokenExpiryHrs: number,
    private cognitoClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient()
  ) {}

  async getClientAccessToken(params: GetClientAccessToken) {
    const { clientId, clientSecret } = params;
    logger.info(
      { clientId },
      'requesting new access token for client credentials'
    );
    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64'
    );
    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: body.toString(),
    });
    if (!res.ok) {
      if (res.status >= 400 && res.status < 500) {
        throw new InvalidAuthTokenRequestError();
      }
      const errorBody = await res.text();
      logger.error(
        {
          cognitoErrorResponseBody: errorBody,
          clientId,
          statusCode: res.status,
        },
        'Failed to request new client credentials access token'
      );
      throw new Error(
        `Token request failed: ${res.status} ${res.statusText} ${errorBody}`
      );
    }
    const resJson = (await res.json()) as Awaited<CognitoTokenResponse>;

    return {
      accessToken: resJson.access_token,
      expiresIn: resJson.expires_in,
      tokenType: resJson.token_type,
    };
  }

  async removeUserPoolClient(params: RemoveUserPoolClientParams) {
    try {
      const commandInput: DeleteUserPoolClientCommandInput = {
        ClientId: params.clientId,
        UserPoolId: this.userPoolId,
      };
      const command = new DeleteUserPoolClientCommand(commandInput);
      await this.cognitoClient.send(command);

      return {
        clientId: params.clientId,
      };
    } catch (error) {
      logger.error(
        {
          params,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to remove/delete Cognito user pool client'
      );
      throw error;
    }
  }

  async createUserPoolClient(
    params: CreateUserPoolClientParams
  ): Promise<CreateUserPoolClientResult> {
    try {
      const cognitoParams: CreateUserPoolClientCommandInput = {
        UserPoolId: this.userPoolId,
        ClientName: params.clientName.slice(0, 128),
        GenerateSecret: true,
        AllowedOAuthFlowsUserPoolClient: true,
        AllowedOAuthFlows: ['client_credentials'],
        // adds core default scopes.
        AllowedOAuthScopes: [
          'api/v1/core/account:read',
          'api/v1/core/documentation:read',
        ],
        SupportedIdentityProviders: ['COGNITO'],
        AccessTokenValidity: this.accessTokenExpiryHrs,
        TokenValidityUnits: { AccessToken: TimeUnitsType.HOURS },
      };

      const command = new CreateUserPoolClientCommand(cognitoParams);
      const response = await this.cognitoClient.send(command);

      if (
        !response.UserPoolClient?.ClientId ||
        !response.UserPoolClient?.ClientSecret ||
        !response.UserPoolClient?.ClientName
      ) {
        throw new Error(
          'Failed to create Cognito client: missing client ID, Name, or secret'
        );
      }

      logger.info(
        {
          clientId: response.UserPoolClient.ClientId,
          clientName: params.clientName,
          createdAt: response.UserPoolClient.CreationDate?.toISOString(),
        },
        `Successfully created Cognito user pool client: ${params.clientName}`
      );

      return {
        clientId: response.UserPoolClient.ClientId,
        clientSecret: response.UserPoolClient.ClientSecret,
        clientName: response.UserPoolClient.ClientName,
      };
    } catch (error) {
      logger.error(
        {
          clientName: params.clientName,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to create Cognito user pool client'
      );
      throw error;
    }
  }
}
