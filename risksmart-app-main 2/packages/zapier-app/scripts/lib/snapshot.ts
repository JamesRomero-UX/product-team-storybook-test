/**
 * Shared snapshot generation and breaking-change detection logic.
 *
 * Used by both `generate-api-snapshot.ts` and `validate-api-contract.ts`.
 */

import { generateOpenApiDocument } from '@risksmart-app/external-api/openapi';
import { CURRENT_API_VERSION } from '@risksmart-app/external-api/versions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Paths the Zapier app depends on, keyed by OpenAPI path string. */
export interface SnapshotPaths {
  [path: string]: {
    [method: string]: {
      requestSchema?: Record<string, unknown>;
      responseSchema?: Record<string, unknown>;
    };
  };
}

/** Full contract snapshot persisted to disk. */
export interface ContractSnapshot {
  version: string;
  generatedAt: string;
  paths: SnapshotPaths;
  schemas: Record<string, Record<string, unknown>>;
}

export type BreakingChangeKind =
  | 'removed_field'
  | 'type_changed'
  | 'required_added'
  | 'endpoint_removed';

export interface BreakingChange {
  kind: BreakingChangeKind;
  path: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// Paths the Zapier app consumes (derived from src/actions/ and src/searches/)
// ---------------------------------------------------------------------------

/**
 * Map of OpenAPI paths and HTTP methods that the Zapier app depends on.
 * Kept in sync manually when new actions/searches are added.
 */
export const ZAPIER_WATCHED_ENDPOINTS: Record<string, string[]> = {
  // List endpoints (searches)
  '/api/v1/risks': ['get', 'post'],
  '/api/v1/risks/{id}': ['get', 'put', 'delete'],
  '/api/v1/indicators': ['get', 'post'],
  '/api/v1/indicators/{id}': ['get', 'put', 'delete'],
  '/api/v1/controls': ['get'],
  '/api/v1/controls/{id}': ['get'],
  '/api/v1/actions': ['get'],
  '/api/v1/actions/{id}': ['get'],
  '/api/v1/issues': ['get'],
  '/api/v1/issues/{id}': ['get'],
  '/api/v1/policies': ['get'],
  '/api/v1/policies/{id}': ['get'],
  '/api/v1/assessments': ['get'],
  '/api/v1/assessments/{id}': ['get'],
  '/api/v1/compliance/obligations': ['get'],
  '/api/v1/compliance/obligations/{id}': ['get'],
  '/api/v1/third-parties': ['get'],
  '/api/v1/third-parties/{id}': ['get'],
  '/api/v1/enterprise-risks': ['get'],
  '/api/v1/enterprise-risks/{id}': ['get'],
  '/api/v1/impacts': ['get'],
  '/api/v1/impacts/{id}': ['get'],
  '/api/v1/users/{id}': ['get'],
  // Sub-resource endpoints
  '/api/v1/risks/{riskId}/indicators': ['get'],
  '/api/v1/risks/{riskId}/appetites': ['get'],
  '/api/v1/risks/{riskId}/impacts': ['get'],
  '/api/v1/risks/{riskId}/acceptances': ['get'],
  '/api/v1/risks/{riskId}/approvals': ['get'],
  '/api/v1/risks/{riskId}/linked-items': ['get'],
  '/api/v1/actions/{actionId}/linked-items': ['get'],
  '/api/v1/controls/{controlId}/linked-items': ['get'],
  '/api/v1/indicators/{indicatorId}/linked-items': ['get'],
  '/api/v1/indicators/{indicatorId}/results': ['get'],
  '/api/v1/issues/{issueId}/updates': ['get'],
  '/api/v1/issues/{issueId}/actions': ['get'],
  '/api/v1/issues/{issueId}/linked-items': ['get'],
  '/api/v1/issues/{issueId}/assessment': ['get'],
  '/api/v1/policies/{policyId}/linked-items': ['get'],
  '/api/v1/third-parties/{thirdpartyId}/linked-items': ['get'],
  '/api/v1/obligations/{obligationId}/linked-items': ['get'],
  '/api/v1/enterprise-risks/{enterpriseriskId}/risks': ['get'],
};

// ---------------------------------------------------------------------------
// Snapshot generation
// ---------------------------------------------------------------------------

type OpenApiDoc = {
  info: { version: string };
  paths?: Record<string, Record<string, OpenApiOperation>>;
  components?: { schemas?: Record<string, Record<string, unknown>> };
};

type OpenApiOperation = {
  responses?: Record<
    string,
    { content?: { 'application/json'?: { schema?: Record<string, unknown> } } }
  >;
  requestBody?: {
    content?: { 'application/json'?: { schema?: Record<string, unknown> } };
  };
};

/**
 * Generate a contract snapshot from the current OpenAPI document.
 *
 * The snapshot captures only the paths and schemas that the Zapier app
 * depends on so that diffs are focused and readable.
 */
export function generateSnapshot(): ContractSnapshot {
  const doc = generateOpenApiDocument(
    CURRENT_API_VERSION,
    'https://api.risksmart.com'
  ) as OpenApiDoc;

  const paths: SnapshotPaths = {};

  for (const [pathKey, methods] of Object.entries(ZAPIER_WATCHED_ENDPOINTS)) {
    const pathDef = doc.paths?.[pathKey];
    if (!pathDef) continue;

    paths[pathKey] = {};
    for (const method of methods) {
      const operation = pathDef[method] as OpenApiOperation | undefined;
      if (!operation) continue;

      const responseSchema =
        operation.responses?.['200']?.content?.['application/json']?.schema ??
        operation.responses?.['201']?.content?.['application/json']?.schema ??
        undefined;

      const requestSchema =
        operation.requestBody?.content?.['application/json']?.schema ??
        undefined;

      paths[pathKey][method] = {
        ...(responseSchema ? { responseSchema } : {}),
        ...(requestSchema ? { requestSchema } : {}),
      };
    }
  }

  // Collect referenced component schemas
  const allSchemas = doc.components?.schemas ?? {};
  const schemas: Record<string, Record<string, unknown>> = {};

  // Walk paths to find $ref references and pull in those schemas
  const referencedNames = new Set<string>();
  collectRefs(paths, referencedNames);

  for (const name of referencedNames) {
    if (allSchemas[name]) {
      schemas[name] = allSchemas[name];
    }
  }

  // Also recursively resolve refs from the schemas themselves
  let prevSize = 0;
  while (referencedNames.size > prevSize) {
    prevSize = referencedNames.size;
    for (const name of [...referencedNames]) {
      if (allSchemas[name]) {
        collectRefs(allSchemas[name], referencedNames);
      }
    }
  }

  for (const name of referencedNames) {
    if (allSchemas[name] && !schemas[name]) {
      schemas[name] = allSchemas[name];
    }
  }

  return {
    version: doc.info.version,
    generatedAt: new Date().toISOString(),
    paths,
    schemas,
  };
}

// ---------------------------------------------------------------------------
// Ref collection helper
// ---------------------------------------------------------------------------

function collectRefs(
  obj: unknown,
  refs: Set<string>,
  visited = new WeakSet<object>()
): void {
  if (obj === null || obj === undefined || typeof obj !== 'object') return;
  if (visited.has(obj as object)) return;
  visited.add(obj as object);

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectRefs(item, refs, visited);
    }
    return;
  }

  const record = obj as Record<string, unknown>;
  if (typeof record['$ref'] === 'string') {
    // $ref looks like "#/components/schemas/Risk"
    const match = record['$ref'].match(
      /^#\/components\/schemas\/(.+)$/
    );
    if (match?.[1]) {
      refs.add(match[1]);
    }
  }

  for (const value of Object.values(record)) {
    collectRefs(value, refs, visited);
  }
}

// ---------------------------------------------------------------------------
// Breaking change detection
// ---------------------------------------------------------------------------

/**
 * Compare an old (committed) snapshot against a freshly generated one and
 * return a list of breaking changes.
 *
 * This is a pure function with no side-effects, making it easy to test.
 */
export function detectBreakingChanges(
  oldSnapshot: ContractSnapshot,
  newSnapshot: ContractSnapshot
): BreakingChange[] {
  const changes: BreakingChange[] = [];

  // 1. Endpoint removal
  for (const [path, methods] of Object.entries(oldSnapshot.paths)) {
    if (!newSnapshot.paths[path]) {
      for (const method of Object.keys(methods)) {
        changes.push({
          kind: 'endpoint_removed',
          path: `${method.toUpperCase()} ${path}`,
          detail: `Endpoint ${method.toUpperCase()} ${path} was removed`,
        });
      }
      continue;
    }

    for (const method of Object.keys(methods)) {
      if (!newSnapshot.paths[path]?.[method]) {
        changes.push({
          kind: 'endpoint_removed',
          path: `${method.toUpperCase()} ${path}`,
          detail: `Endpoint ${method.toUpperCase()} ${path} was removed`,
        });
      }
    }
  }

  // 2. Schema comparison — removed fields and type changes
  for (const [schemaName, oldSchema] of Object.entries(oldSnapshot.schemas)) {
    const newSchema = newSnapshot.schemas[schemaName];
    if (!newSchema) {
      // The schema itself was removed — this is breaking if it was referenced
      changes.push({
        kind: 'removed_field',
        path: `schemas.${schemaName}`,
        detail: `Schema "${schemaName}" was removed entirely`,
      });
      continue;
    }

    detectSchemaFieldChanges(
      oldSchema,
      newSchema,
      `schemas.${schemaName}`,
      changes
    );
  }

  // 3. New required fields in request schemas (POST/PUT)
  for (const [path, methods] of Object.entries(newSnapshot.paths)) {
    for (const [method, operationDef] of Object.entries(methods)) {
      if (method !== 'post' && method !== 'put') continue;
      if (!operationDef.requestSchema) continue;

      const oldOp = oldSnapshot.paths[path]?.[method];
      if (!oldOp?.requestSchema) continue;

      detectNewRequiredFields(
        oldOp.requestSchema,
        operationDef.requestSchema,
        `${method.toUpperCase()} ${path} request`,
        changes,
        oldSnapshot.schemas,
        newSnapshot.schemas
      );
    }
  }

  return changes;
}

// ---------------------------------------------------------------------------
// Helpers for deep schema comparison
// ---------------------------------------------------------------------------

function resolveSchema(
  schema: Record<string, unknown>,
  allSchemas: Record<string, Record<string, unknown>>
): Record<string, unknown> {
  if (typeof schema['$ref'] === 'string') {
    const match = (schema['$ref'] as string).match(
      /^#\/components\/schemas\/(.+)$/
    );
    if (match?.[1] && allSchemas[match[1]]) {
      return allSchemas[match[1]];
    }
  }
  return schema;
}

function detectSchemaFieldChanges(
  oldSchema: Record<string, unknown>,
  newSchema: Record<string, unknown>,
  path: string,
  changes: BreakingChange[]
): void {
  const oldProps = oldSchema['properties'] as
    | Record<string, Record<string, unknown>>
    | undefined;
  const newProps = newSchema['properties'] as
    | Record<string, Record<string, unknown>>
    | undefined;

  if (oldProps && newProps) {
    for (const fieldName of Object.keys(oldProps)) {
      if (!newProps[fieldName]) {
        changes.push({
          kind: 'removed_field',
          path: `${path}.properties.${fieldName}`,
          detail: `Field "${fieldName}" was removed from ${path}`,
        });
        continue;
      }

      // Check type change
      const oldType = oldProps[fieldName]?.['type'];
      const newType = newProps[fieldName]?.['type'];
      if (oldType && newType && oldType !== newType) {
        changes.push({
          kind: 'type_changed',
          path: `${path}.properties.${fieldName}`,
          detail: `Field "${fieldName}" type changed from "${String(oldType)}" to "${String(newType)}" in ${path}`,
        });
      }

      // Recurse into nested property schemas (handles objects and arrays within properties)
      detectSchemaFieldChanges(
        oldProps[fieldName],
        newProps[fieldName],
        `${path}.properties.${fieldName}`,
        changes
      );
    }
  }

  // Also check allOf/oneOf/anyOf items
  for (const combinator of ['allOf', 'oneOf', 'anyOf'] as const) {
    const oldItems = oldSchema[combinator] as
      | Record<string, unknown>[]
      | undefined;
    const newItems = newSchema[combinator] as
      | Record<string, unknown>[]
      | undefined;
    if (oldItems && newItems) {
      const len = Math.min(oldItems.length, newItems.length);
      for (let i = 0; i < len; i++) {
        detectSchemaFieldChanges(
          oldItems[i],
          newItems[i],
          `${path}.${combinator}[${i}]`,
          changes
        );
      }
    }
  }

  // Check items (for array schemas)
  if (oldSchema['items'] && newSchema['items']) {
    detectSchemaFieldChanges(
      oldSchema['items'] as Record<string, unknown>,
      newSchema['items'] as Record<string, unknown>,
      `${path}.items`,
      changes
    );
  }
}

function detectNewRequiredFields(
  oldRequestSchema: Record<string, unknown>,
  newRequestSchema: Record<string, unknown>,
  path: string,
  changes: BreakingChange[],
  oldSchemas: Record<string, Record<string, unknown>>,
  newSchemas: Record<string, Record<string, unknown>>
): void {
  const oldResolved = resolveSchema(oldRequestSchema, oldSchemas);
  const newResolved = resolveSchema(newRequestSchema, newSchemas);

  const oldRequired = new Set(
    (oldResolved['required'] as string[] | undefined) ?? []
  );
  const newRequired =
    (newResolved['required'] as string[] | undefined) ?? [];

  for (const field of newRequired) {
    if (!oldRequired.has(field)) {
      changes.push({
        kind: 'required_added',
        path: `${path}.required`,
        detail: `New required field "${field}" was added to ${path}`,
      });
    }
  }
}
