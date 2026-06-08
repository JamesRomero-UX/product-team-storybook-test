import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
} from 'aws-lambda';
import { jwtDecode } from 'jwt-decode';

import { getOrgMeta } from './services/orgUtilities';

export const getOrgId = (evt: APIGatewayProxyEventV2) =>
  getJwt(evt).claims.org_id as string;

export const getJwt = (evt: APIGatewayProxyEventV2) =>
  (evt as APIGatewayProxyEventV2WithJWTAuthorizer).requestContext.authorizer
    .jwt;

const hasuraNamespace = 'https://hasura.io/jwt/claims';
export const tenantNameSessionKey = 'x-hasura-tenant-name';

export const getHasuraClaims = (evt: APIGatewayProxyEventV2) => {
  // the format in requestContext.authorizer is difficult to parse
  return jwtDecode<{
    [hasuraNamespace]: {
      'x-hasura-default-role': string;
      'x-hasura-allowed-roles': string[];
      'x-hasura-user-id': string;
      'x-hasura-org-id': string;
      'x-hasura-logo'?: string;
      [tenantNameSessionKey]: string;
    };
  }>(evt.headers.authorization!)[hasuraNamespace];
};

const getEnabledFeatures = async (evt: APIGatewayProxyEventV2) => {
  const claims = getHasuraClaims(evt);
  const orgData = await getOrgMeta({
    orgKey: claims['x-hasura-org-id'],
    tenant: claims['x-hasura-tenant-name'],
  });

  return (orgData.features || '').split(',');
};

export type Feature = 'reports' | 'dashboard';

export const hasFeature = async (
  evt: APIGatewayProxyEventV2,
  feature: Feature
) => {
  const features = await getEnabledFeatures(evt);

  return features.includes(feature);
};

export const getTenantNameFromClaims = (evt: APIGatewayProxyEventV2) => {
  const hasuraClaims = getHasuraClaims(evt);

  return hasuraClaims[tenantNameSessionKey];
};

export const isMultiTenant = (evt: APIGatewayProxyEventV2) => {
  return isMultiTenantName(getTenantNameFromClaims(evt));
};
export const isMultiTenantName = (name: string) => {
  return name === 'MultiTenant';
};

export const getUserIdFromClaims = (evt: APIGatewayProxyEventV2) => {
  const hasuraClaims = getHasuraClaims(evt);

  return hasuraClaims['x-hasura-user-id'];
};
