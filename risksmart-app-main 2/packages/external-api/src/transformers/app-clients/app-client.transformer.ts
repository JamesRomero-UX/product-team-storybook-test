import type {
  AppClientCreate,
  AppClientRequest,
} from '../../schemas/app-clients/app-client.schema';
import {
  appClientCreateSchema,
  appClientListResponse,
} from '../../schemas/app-clients/app-client.schema';
import type { GetAppClientsResponse } from '../../services/app-clients/app-clients.service';
import type { Compat } from '../../types/versioning';

// Exclude internal/system scopes that do not need to be exposed to external clients
const EXCLUDED_SCOPE_RESOURCE_REGEX = /\bauth-client\b|documentation|account/i;
interface CreateClientProps {
  createdAt: number;
  createdBy: string;
  role: 'rs-external' | 'rs-internal';
  compatVersion: Compat;
  orgId: string;
  tenantId: string;
  rateLimitProfile: AppClientCreate['rateLimitProfile'];
}

export function mapClientDataToCreateSchema(
  clientData: AppClientRequest,
  props: CreateClientProps
): AppClientCreate {
  const mappedData: AppClientCreate = {
    name: clientData.name,
    ...props,
    scopes: clientData.scopes,
    updatedAt: props.createdAt,
    updatedBy: props.createdBy,
    status: 'active',
  };

  return appClientCreateSchema.parse(mappedData);
}

export const transformClientsListQueryResponse = (
  result: GetAppClientsResponse
) => {
  const { data, metadata } = result;
  const { allowedScopes, clientLimit, signedDocsPath } = metadata;
  // filter out any allowed but non resource scopes in response.
  const filteredScopes = allowedScopes.filter(
    ({ name }) => !EXCLUDED_SCOPE_RESOURCE_REGEX.test(name)
  );
  // filter out any non active clients from data.
  const activeTransformedClients = data
    .filter(({ status }) => status === 'active')
    .map((client) => ({
      compatVersion: client.compatVersion,
      createdAt: client.createdAt,
      name: client.clientName,
      clientKey: client.clientId,
      status: client.status,
      scopes: client.scopes.length ? client.scopes.split(',') : [],
      rateLimitProfile: client.rateLimitProfile,
    }));

  return appClientListResponse.parse({
    data: activeTransformedClients,
    metadata: {
      orgMaxClients: clientLimit,
      allowedScopes: filteredScopes,
      documentationPath: signedDocsPath,
    },
  });
};

export type TransformClientsListFn = typeof transformClientsListQueryResponse;
