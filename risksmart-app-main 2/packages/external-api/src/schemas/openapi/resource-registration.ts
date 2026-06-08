import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { toLowercaseNoSpaces } from '../../utils/string';
import { CustomAttributesResponseCompactSchema } from '../common/custom-fields.schema';
import { z } from '../openapi.zod';
import {
  baseErrorResponses,
  type VersionedSchemas,
} from '../openapi-registry-builder';
import { baseQuerySchema } from '../route-query.schema';
import { authHeaderSchema, uuidParamSchema } from './common-schemas';
import {
  createCreatedResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from './response-builders';

export interface ResourceConfig {
  name: string;
  pluralName: string;
  tag: string;
  itemSchema: z.ZodType;
  listSchema: z.ZodType;
  querySchema?: z.AnyZodObject;
  pathPrefix?: string;
  mixedIdType?: boolean;
  excludeCustomFields?: boolean;
  createSchema?: z.ZodType;
  updateSchema?: z.ZodType;
  deleteEnabled?: boolean;
  schemaEnabled?: boolean;
}

export interface ChildResourceConfig {
  parentName: string;
  parentPluralName: string;
  childName: string;
  childPluralName: string;
  tag: string;
  listSchema: z.ZodType;
  itemSchema?: z.ZodType;
  querySchema?: z.AnyZodObject;
  parentPathPrefix?: string;
  mixedIdType?: boolean;
  excludeCustomFields?: boolean;
  schemaEnabled?: boolean;
}

function buildCollectionPath(config: ResourceConfig): string {
  const basePath = config.pathPrefix ?? '';

  return `/api/v1${basePath}/${config.pluralName.toLowerCase()}`;
}

function buildItemPath(config: ResourceConfig): string {
  return `${buildCollectionPath(config)}/{id}`;
}

function buildChildCollectionPath(
  config: Pick<
    ChildResourceConfig,
    'parentPathPrefix' | 'parentPluralName' | 'childPluralName'
  >,
  parentIdParam: string
): string {
  const basePath = config.parentPathPrefix ?? '';

  return `/api/v1${basePath}/${config.parentPluralName.toLowerCase()}/{${parentIdParam}}/${config.childPluralName.toLowerCase()}`;
}

function buildChildItemPath(
  config: Pick<
    ChildResourceConfig,
    'parentPathPrefix' | 'parentPluralName' | 'childPluralName'
  >,
  parentIdParam: string,
  childIdParam: string
): string {
  return `${buildChildCollectionPath(config, parentIdParam)}/{${childIdParam}}`;
}

// Helper to extend item schema with customFields for OpenAPI documentation
function extendSchemaWithCustomFields(itemSchema: z.ZodType): z.ZodType {
  // Make the customFields properties optional since they may not be present on all responses
  const optionalCustomFieldsSchema =
    CustomAttributesResponseCompactSchema.partial();
  const customFields = z.object({ customFields: optionalCustomFieldsSchema });

  if (itemSchema instanceof z.ZodObject) {
    return itemSchema.merge(customFields);
  }

  return z.intersection(itemSchema, customFields);
}

// Registers a list endpoint for a resource (GET /api/v1/resources)
export function registerResourceListPath(
  registry: OpenAPIRegistry,
  config: ResourceConfig,
  schemas: VersionedSchemas
) {
  registry.registerPath({
    method: 'get',
    path: buildCollectionPath(config),
    description: `Get all ${config.pluralName.toLowerCase()}`,
    summary: `List ${config.pluralName.toLowerCase()}`,
    tags: [config.tag],
    request: {
      query: config.querySchema ?? baseQuerySchema,
      headers: authHeaderSchema,
    },
    responses: {
      ...createSuccessResponse(
        `List of ${config.pluralName.toLowerCase()}`,
        config.listSchema
      ),
      ...createValidationErrorResponse(schemas),
      ...baseErrorResponses(config.pluralName, false),
    },
  });
}

// Registers a get-by-id endpoint for a resource (GET /api/v1/resources/{id})
export function registerResourceByIdPath(
  registry: OpenAPIRegistry,
  config: ResourceConfig
) {
  const responseSchema = config.excludeCustomFields
    ? config.itemSchema
    : extendSchemaWithCustomFields(config.itemSchema);

  registry.registerPath({
    method: 'get',
    path: buildItemPath(config),
    description: `Get a specific ${config.name.toLowerCase()} by ID`,
    summary: `Get ${config.name.toLowerCase()} by ID`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(config.mixedIdType ?? false),
      headers: authHeaderSchema,
    },
    responses: {
      ...createSuccessResponse(`${config.name} found`, responseSchema),
      ...baseErrorResponses(config.name),
    },
  });
}

// Registers a create endpoint for a resource (POST /api/v1/resources)
export function registerResourceCreatePath(
  registry: OpenAPIRegistry,
  config: ResourceConfig & { createSchema: z.ZodType },
  schemas: VersionedSchemas
) {
  registry.registerPath({
    method: 'post',
    path: buildCollectionPath(config),
    description: `Create a new ${config.name.toLowerCase()}`,
    summary: `Create ${config.name.toLowerCase()}`,
    tags: [config.tag],
    request: {
      headers: authHeaderSchema,
      body: {
        content: {
          'application/json': {
            schema: config.createSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      ...createCreatedResponse(
        `${config.name} created successfully`,
        schemas.mutationResponse
      ),
      ...createValidationErrorResponse(schemas),
      ...baseErrorResponses(config.name, false),
    },
  });
}

// Registers an update endpoint for a resource (PUT /api/v1/resources/{id})
export function registerResourceUpdatePath(
  registry: OpenAPIRegistry,
  config: ResourceConfig & { updateSchema: z.ZodType },
  schemas: VersionedSchemas
) {
  registry.registerPath({
    method: 'put',
    path: buildItemPath(config),
    description: `Update a specific ${config.name.toLowerCase()} by ID`,
    summary: `Update ${config.name.toLowerCase()}`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(config.mixedIdType ?? false),
      headers: authHeaderSchema,
      body: {
        content: {
          'application/json': {
            schema: config.updateSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      ...createSuccessResponse(
        `${config.name} updated successfully`,
        schemas.mutationResponse
      ),
      ...createValidationErrorResponse(schemas),
      ...baseErrorResponses(config.name),
    },
  });
}

// Registers a delete endpoint for a resource (DELETE /api/v1/resources/{id})
export function registerResourceDeletePath(
  registry: OpenAPIRegistry,
  config: ResourceConfig,
  schemas: VersionedSchemas
) {
  registry.registerPath({
    method: 'delete',
    path: buildItemPath(config),
    description: `Delete a specific ${config.name.toLowerCase()} by ID`,
    summary: `Delete ${config.name.toLowerCase()}`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(config.mixedIdType ?? false),
      headers: authHeaderSchema,
    },
    responses: {
      ...createSuccessResponse(
        `${config.name} deleted successfully`,
        schemas.mutationResponse
      ),
      ...createValidationErrorResponse(schemas),
      ...baseErrorResponses(config.name),
    },
  });
}

// Registers a schema endpoint for a resource (GET /api/v1/resources/schema)
export function registerResourceSchemaPath(
  registry: OpenAPIRegistry,
  config: Pick<ResourceConfig, 'name' | 'pluralName' | 'tag' | 'pathPrefix'>,
  schemaResponseSchema: z.ZodType
) {
  const basePath = config.pathPrefix ?? '';
  const schemaPath = `/api/v1${basePath}/${config.pluralName.toLowerCase()}/schema`;

  registry.registerPath({
    method: 'get',
    path: schemaPath,
    description: `Returns the custom field schema for ${config.pluralName.toLowerCase()}, including field definitions, types, and validation rules.`,
    summary: `Get ${config.name.toLowerCase()} custom field schema`,
    tags: [config.tag],
    request: { headers: authHeaderSchema },
    responses: {
      ...createSuccessResponse(
        `Custom field schema for ${config.pluralName.toLowerCase()}`,
        schemaResponseSchema
      ),
      ...baseErrorResponses(config.pluralName, false),
    },
  });
}

// Registers both list and get-by-id endpoints for a CRUD resource
// Optionally registers create, update, delete, and schema endpoints when configured
export function registerCrudResource(
  registry: OpenAPIRegistry,
  config: ResourceConfig,
  schemas: VersionedSchemas
) {
  registerResourceListPath(registry, config, schemas);
  registerResourceByIdPath(registry, config);

  if (config.schemaEnabled && schemas.resourceSchemaResponse) {
    registerResourceSchemaPath(
      registry,
      config,
      schemas.resourceSchemaResponse
    );
  }
  if (config.createSchema) {
    registerResourceCreatePath(
      registry,
      { ...config, createSchema: config.createSchema },
      schemas
    );
  }
  if (config.updateSchema) {
    registerResourceUpdatePath(
      registry,
      { ...config, updateSchema: config.updateSchema },
      schemas
    );
  }
  if (config.deleteEnabled) {
    registerResourceDeletePath(registry, config, schemas);
  }
}

// Registers only a get-by-id endpoint for resources without list endpoints
export function registerItemOnlyResource(
  registry: OpenAPIRegistry,
  config: Omit<ResourceConfig, 'listSchema' | 'querySchema'>
) {
  registerResourceByIdPath(registry, config as ResourceConfig);
}

// Registers a child list endpoint for nested resources
// Example: GET /api/v1/risks/{riskId}/controls
export function registerChildListPath(
  registry: OpenAPIRegistry,
  config: ChildResourceConfig,
  schemas: VersionedSchemas
) {
  const parentIdParam = `${toLowercaseNoSpaces(config.parentName)}Id`;
  const fullPath = buildChildCollectionPath(config, parentIdParam);

  registry.registerPath({
    method: 'get',
    path: fullPath,
    description: `Get all ${config.childPluralName.toLowerCase()} for a specific ${config.parentName.toLowerCase()}`,
    summary: `List ${config.parentName.toLowerCase()} ${config.childPluralName.toLowerCase()}`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(config.mixedIdType ?? false, parentIdParam),
      query: config.querySchema ?? baseQuerySchema,
      headers: authHeaderSchema,
    },
    responses: {
      ...createSuccessResponse(
        `List of ${config.childPluralName.toLowerCase()} for ${config.parentName.toLowerCase()}`,
        config.listSchema
      ),
      ...createValidationErrorResponse(schemas),
      ...baseErrorResponses(config.childPluralName, false),
    },
  });

  // If itemSchema is provided, also register the child item endpoint
  if (config.itemSchema) {
    registerChildItemPath(
      registry,
      config as ChildResourceConfig & { itemSchema: z.ZodType }
    );
  }
}

// Registers a child item endpoint for nested resources
// Example: GET /api/v1/risks/{riskId}/controls/{controlId}
export function registerChildItemPath(
  registry: OpenAPIRegistry,
  config: Required<Pick<ChildResourceConfig, 'itemSchema'>> &
    ChildResourceConfig
) {
  const parentIdParam = `${toLowercaseNoSpaces(config.parentName)}Id`;
  const childIdParam = `${toLowercaseNoSpaces(config.childName)}Id`;
  const fullPath = buildChildItemPath(config, parentIdParam, childIdParam);

  const responseSchema = config.excludeCustomFields
    ? config.itemSchema
    : extendSchemaWithCustomFields(config.itemSchema);

  registry.registerPath({
    method: 'get',
    path: fullPath,
    description: `Get a specific ${config.childName.toLowerCase()} for a ${config.parentName.toLowerCase()}`,
    summary: `Get ${config.parentName.toLowerCase()} ${config.childName.toLowerCase()} by ID`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(
        config.mixedIdType ?? false,
        parentIdParam,
        childIdParam
      ),
      headers: authHeaderSchema,
    },
    responses: {
      ...createSuccessResponse(`${config.childName} found`, responseSchema),
      ...baseErrorResponses(config.childName),
    },
  });
}

// Registers a singleton child endpoint for nested resources (no child ID needed)
// Example: GET /api/v1/issues/{issueId}/assessment
// Optionally registers POST and PUT on the same path when createSchema/updateSchema are provided.
export function registerChildSingletonPath(
  registry: OpenAPIRegistry,
  config: Required<Pick<ChildResourceConfig, 'itemSchema'>> &
    Omit<ChildResourceConfig, 'listSchema'> & {
      createSchema?: z.ZodType;
      updateSchema?: z.ZodType;
    },
  schemas?: VersionedSchemas
) {
  const parentIdParam = `${toLowercaseNoSpaces(config.parentName)}Id`;
  const fullPath = buildChildCollectionPath(config, parentIdParam);

  const responseSchema = config.excludeCustomFields
    ? config.itemSchema
    : extendSchemaWithCustomFields(config.itemSchema);

  registry.registerPath({
    method: 'get',
    path: fullPath,
    description: `Get the ${config.childName.toLowerCase()} for a specific ${config.parentName.toLowerCase()}`,
    summary: `Get ${config.parentName.toLowerCase()} ${config.childName.toLowerCase()}`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(config.mixedIdType ?? false, parentIdParam),
      headers: authHeaderSchema,
    },
    responses: {
      ...createSuccessResponse(
        `${config.childName} for ${config.parentName.toLowerCase()}`,
        responseSchema
      ),
      ...baseErrorResponses(config.childName),
    },
  });

  // POST reuses registerChildCreatePath — it builds the same buildChildCollectionPath.
  if (config.createSchema && schemas) {
    registerChildCreatePath(
      registry,
      { ...config, listSchema: z.never(), createSchema: config.createSchema },
      schemas
    );
  }

  // PUT uses registerChildSingletonUpdatePath — unlike registerChildUpdatePath it does
  // NOT append /{childId}, keeping the path identical to the GET/POST above.
  if (config.updateSchema && schemas) {
    registerChildSingletonUpdatePath(
      registry,
      { ...config, listSchema: z.never(), updateSchema: config.updateSchema },
      schemas
    );
  }

  if (config.schemaEnabled && schemas?.resourceSchemaResponse) {
    registerChildSchemaPath(
      registry,
      config as MutableChildResourceConfig,
      schemas.resourceSchemaResponse
    );
  }
}

export interface MutableChildResourceConfig extends ChildResourceConfig {
  createSchema?: z.ZodType;
  updateSchema?: z.ZodType;
  deleteEnabled?: boolean;
}

// Registers a schema endpoint for a child resource
// Example: GET /api/v1/risks/appetites/schema
export function registerChildSchemaPath(
  registry: OpenAPIRegistry,
  config: Pick<
    MutableChildResourceConfig,
    | 'parentName'
    | 'parentPathPrefix'
    | 'parentPluralName'
    | 'childName'
    | 'childPluralName'
    | 'tag'
  >,
  schemaResponseSchema: z.ZodType
) {
  const basePath = config.parentPathPrefix ?? '';
  const schemaPath = `/api/v1${basePath}/${config.parentPluralName.toLowerCase()}/${config.childPluralName.toLowerCase()}/schema`;

  registry.registerPath({
    method: 'get',
    path: schemaPath,
    description: `Returns the custom field schema for ${config.childPluralName.toLowerCase()}.`,
    summary: `Get ${config.childName.toLowerCase()} custom field schema`,
    tags: [config.tag],
    request: { headers: authHeaderSchema },
    responses: {
      ...createSuccessResponse(
        `Custom field schema for ${config.childPluralName.toLowerCase()}`,
        schemaResponseSchema
      ),
      ...baseErrorResponses(config.childPluralName, false),
    },
  });
}

// Registers a child create endpoint for nested resources
// Example: POST /api/v1/indicators/{indicatorId}/results
export function registerChildCreatePath(
  registry: OpenAPIRegistry,
  config: MutableChildResourceConfig & { createSchema: z.ZodType },
  schemas: VersionedSchemas
) {
  const parentIdParam = `${toLowercaseNoSpaces(config.parentName)}Id`;
  const fullPath = buildChildCollectionPath(config, parentIdParam);

  registry.registerPath({
    method: 'post',
    path: fullPath,
    description: `Create a new ${config.childName.toLowerCase()} for a specific ${config.parentName.toLowerCase()}`,
    summary: `Create ${config.parentName.toLowerCase()} ${config.childName.toLowerCase()}`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(config.mixedIdType ?? false, parentIdParam),
      headers: authHeaderSchema,
      body: {
        content: {
          'application/json': {
            schema: config.createSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      ...createCreatedResponse(
        `${config.childName} created successfully`,
        schemas.mutationResponse
      ),
      ...createValidationErrorResponse(schemas),
      ...baseErrorResponses(config.childName, false),
    },
  });
}

// Registers a child update endpoint for nested resources
// Example: PUT /api/v1/indicators/{indicatorId}/results/{resultId}
export function registerChildUpdatePath(
  registry: OpenAPIRegistry,
  config: MutableChildResourceConfig & { updateSchema: z.ZodType },
  schemas: VersionedSchemas
) {
  const parentIdParam = `${toLowercaseNoSpaces(config.parentName)}Id`;
  const childIdParam = `${toLowercaseNoSpaces(config.childName)}Id`;
  const fullPath = buildChildItemPath(config, parentIdParam, childIdParam);

  registry.registerPath({
    method: 'put',
    path: fullPath,
    description: `Update a specific ${config.childName.toLowerCase()} for a ${config.parentName.toLowerCase()}`,
    summary: `Update ${config.parentName.toLowerCase()} ${config.childName.toLowerCase()}`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(
        config.mixedIdType ?? false,
        parentIdParam,
        childIdParam
      ),
      headers: authHeaderSchema,
      body: {
        content: {
          'application/json': {
            schema: config.updateSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      ...createSuccessResponse(
        `${config.childName} updated successfully`,
        schemas.mutationResponse
      ),
      ...createValidationErrorResponse(schemas),
      ...baseErrorResponses(config.childName),
    },
  });
}

// Registers a singleton child update endpoint (no child ID in path)
// Example: PUT /api/v1/issues/{issueId}/assessment
// Contrast with registerChildUpdatePath which appends /{childId} to the path.
export function registerChildSingletonUpdatePath(
  registry: OpenAPIRegistry,
  config: MutableChildResourceConfig & { updateSchema: z.ZodType },
  schemas: VersionedSchemas
) {
  const parentIdParam = `${toLowercaseNoSpaces(config.parentName)}Id`;
  const fullPath = buildChildCollectionPath(config, parentIdParam);

  registry.registerPath({
    method: 'put',
    path: fullPath,
    description: `Update the ${config.childName.toLowerCase()} for a specific ${config.parentName.toLowerCase()}`,
    summary: `Update ${config.parentName.toLowerCase()} ${config.childName.toLowerCase()}`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(config.mixedIdType ?? false, parentIdParam),
      headers: authHeaderSchema,
      body: {
        content: {
          'application/json': {
            schema: config.updateSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      ...createSuccessResponse(
        `${config.childName} updated successfully`,
        schemas.mutationResponse
      ),
      ...createValidationErrorResponse(schemas),
      ...baseErrorResponses(config.childName),
    },
  });
}

// Registers a child delete endpoint for nested resources
// Example: DELETE /api/v1/indicators/{indicatorId}/results/{resultId}
export function registerChildDeletePath(
  registry: OpenAPIRegistry,
  config: MutableChildResourceConfig,
  schemas: VersionedSchemas
) {
  const parentIdParam = `${toLowercaseNoSpaces(config.parentName)}Id`;
  const childIdParam = `${toLowercaseNoSpaces(config.childName)}Id`;
  const fullPath = buildChildItemPath(config, parentIdParam, childIdParam);

  // skip adding delete if toggled off in config.
  if (config.deleteEnabled === false) {
    return;
  }
  registry.registerPath({
    method: 'delete',
    path: fullPath,
    description: `Delete a specific ${config.childName.toLowerCase()} for a ${config.parentName.toLowerCase()}`,
    summary: `Delete ${config.parentName.toLowerCase()} ${config.childName.toLowerCase()}`,
    tags: [config.tag],
    request: {
      params: uuidParamSchema(
        config.mixedIdType ?? false,
        parentIdParam,
        childIdParam
      ),
      headers: authHeaderSchema,
    },
    responses: {
      ...createSuccessResponse(
        `${config.childName} deleted successfully`,
        schemas.mutationResponse
      ),
      ...createValidationErrorResponse(schemas),
      ...baseErrorResponses(config.childName),
    },
  });
}

// Registers list, item, and optional mutation endpoints for a child resource.
// Equivalent to registerCrudResource but for nested resource paths.
export function registerChildCrudResource(
  registry: OpenAPIRegistry,
  config: MutableChildResourceConfig,
  schemas: VersionedSchemas
) {
  registerChildListPath(registry, config, schemas);

  if (config.schemaEnabled && schemas.resourceSchemaResponse) {
    registerChildSchemaPath(registry, config, schemas.resourceSchemaResponse);
  }

  if (config.createSchema) {
    registerChildCreatePath(
      registry,
      { ...config, createSchema: config.createSchema },
      schemas
    );
  }
  if (config.updateSchema) {
    registerChildUpdatePath(
      registry,
      { ...config, updateSchema: config.updateSchema },
      schemas
    );
  }
  if (config.deleteEnabled) {
    registerChildDeletePath(registry, config, schemas);
  }
}

export interface AuthTokenPathConfig {
  requestSchema: z.ZodType;
  responseSchema: z.ZodType;
}

// Registers the auth token endpoint (POST /api/v1/auth/token)
// This is a public endpoint that does not require authentication
export function registerAuthTokenPath(
  registry: OpenAPIRegistry,
  config: AuthTokenPathConfig,
  schemas: VersionedSchemas
) {
  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/token',
    description:
      'Authenticate using client credentials to obtain an access token',
    summary: 'Get access token',
    tags: ['Authentication'],
    security: [], // No authentication required - this is a public endpoint
    request: {
      body: {
        content: {
          'application/json': {
            schema: config.requestSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      ...createSuccessResponse(
        'Access token generated successfully',
        config.responseSchema
      ),
      ...createValidationErrorResponse(schemas),
      401: {
        description: 'Invalid client credentials',
        content: {
          'application/json': {
            schema: schemas.errorResponse,
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: schemas.errorResponse,
          },
        },
      },
    },
  });
}
