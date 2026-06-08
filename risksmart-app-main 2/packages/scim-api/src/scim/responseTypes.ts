import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import type { ScimError } from './types';

const scimErrorSchema = (status: string, detail?: string): ScimError => ({
  schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
  detail,
  status,
});

const scimBadRequestSchema = (detail?: string): ScimError => ({
  schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
  detail: detail,
  status: '400',
});

const scimNotFoundSchema = (detail?: string): ScimError => ({
  schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
  detail: detail,
  status: '404',
});

const scimInternalServerErrorSchema = (detail?: string): ScimError => ({
  schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
  detail: detail ?? 'Internal server error.',
  status: '500',
});

const scimConflictSchema = (detail?: string): ScimError => ({
  schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
  detail: detail,
  status: '409',
});

const scimUnauthorizedSchema = (detail?: string): ScimError => ({
  schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
  detail:
    detail ??
    'The access token provided is expired, revoked, malformed, or invalid for other reasons',
  status: '401',
});

const headers = {
  'Content-Type': 'application/scim+json',
};

export const scimErrorResponse = (
  statusCode = 500,
  detail?: string
): APIGatewayProxyStructuredResultV2 => ({
  statusCode: statusCode ?? 500,
  headers,
  body: JSON.stringify(scimErrorSchema(statusCode.toString(), detail)),
});

export const BadRequestResponse = (
  detail?: string
): APIGatewayProxyStructuredResultV2 => ({
  statusCode: 400,
  headers,
  body: JSON.stringify(scimBadRequestSchema(detail)),
});

export const NotFoundResponse = (
  detail?: string
): APIGatewayProxyStructuredResultV2 => ({
  statusCode: 404,
  headers,
  body: JSON.stringify(scimNotFoundSchema(detail)),
});

export const InternalServerErrorResponse = (
  detail?: string
): APIGatewayProxyStructuredResultV2 => ({
  statusCode: 500,
  headers,
  body: JSON.stringify(scimInternalServerErrorSchema(detail)),
});

export const ConflictResponse = (
  detail?: string
): APIGatewayProxyStructuredResultV2 => ({
  statusCode: 409,
  headers,
  body: JSON.stringify(scimConflictSchema(detail)),
});

export const UnauthorizedResponse = (
  detail?: string
): APIGatewayProxyStructuredResultV2 => ({
  statusCode: 401,
  headers,
  body: JSON.stringify(scimUnauthorizedSchema(detail)),
});
