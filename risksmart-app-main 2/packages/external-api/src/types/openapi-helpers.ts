import type { components, paths } from '../generated/openapi';

export type { components, paths } from '../generated/openapi';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** Extract the success (200 or 201) JSON response body for a given path + method. */
export type ApiResponse<
  Path extends keyof paths,
  Method extends HttpMethod,
> = paths[Path] extends { [M in Method]: infer Op }
  ? Op extends { responses: infer R }
    ? R extends { 200: { content: { 'application/json': infer Body } } }
      ? Body
      : R extends { 201: { content: { 'application/json': infer Body } } }
        ? Body
        : never
    : never
  : never;

/** Extract the JSON request body for a given path + method. */
export type ApiRequestBody<
  Path extends keyof paths,
  Method extends HttpMethod,
> = paths[Path] extends { [M in Method]: infer Op }
  ? Op extends {
      requestBody: { content: { 'application/json': infer Body } };
    }
    ? Body
    : never
  : never;

/** Extract a named component schema. */
export type ApiSchema<Name extends keyof components['schemas']> =
  components['schemas'][Name];

/** Extract the item type from a paginated list response (the element of `data[]`). */
export type ApiListItem<Path extends keyof paths, Method extends HttpMethod> =
  ApiResponse<Path, Method> extends { data: (infer Item)[] } ? Item : never;
