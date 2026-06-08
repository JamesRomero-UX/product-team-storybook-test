// OpenAPI utilities for registering resources and generating API documentation

export { authHeaderSchema, uuidParamSchema } from './common-schemas';
export {
  type AuthTokenPathConfig,
  type ChildResourceConfig,
  type MutableChildResourceConfig,
  registerAuthTokenPath,
  registerChildCreatePath,
  registerChildCrudResource,
  registerChildDeletePath,
  registerChildItemPath,
  registerChildListPath,
  registerChildSchemaPath,
  registerChildSingletonPath,
  registerChildUpdatePath,
  registerCrudResource,
  registerItemOnlyResource,
  registerResourceByIdPath,
  registerResourceCreatePath,
  registerResourceDeletePath,
  registerResourceListPath,
  registerResourceSchemaPath,
  registerResourceUpdatePath,
  type ResourceConfig,
} from './resource-registration';
export {
  createCreatedResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from './response-builders';
