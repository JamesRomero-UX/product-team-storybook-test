import { vi } from 'vitest';

import type { RelationshipTuple, RoleAssignment } from '../types';

interface MockResponseOptions {
  status?: number;
  statusText?: string;
  ok?: boolean;
  body?: unknown;
  jsonError?: Error;
  url?: string;
  headers?: [string, string][] | Record<string, string> | Headers;
}

/**
 * Creates a complete mock Response object that implements the full Response interface
 * Used for testing HTTP fetch operations without relying on actual network calls
 */
export function createMockResponse({
  status = 200,
  statusText = 'OK',
  ok = status >= 200 && status < 300,
  body = {},
  jsonError,
  url = 'https://api.permit.io/v2/test',
  headers = {},
}: MockResponseOptions = {}): Response {
  const mockHeaders = new Headers(headers);

  const mockResponse = {
    ok,
    status,
    statusText,
    headers: mockHeaders,
    redirected: false,
    type: 'basic' as const,
    url,
    clone: vi.fn().mockReturnThis(),
    body: null,
    bodyUsed: false,
    // Core methods that tests actually use
    json: jsonError
      ? vi.fn().mockRejectedValue(jsonError)
      : vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
    // Additional Response methods for completeness
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    blob: vi
      .fn()
      .mockResolvedValue(
        new Blob([JSON.stringify(body)], { type: 'application/json' })
      ),
    bytes: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
    formData: vi.fn().mockResolvedValue(new FormData()),
  } as unknown as Response;

  return mockResponse;
}

/**
 * Creates a mock error response for testing HTTP error scenarios
 */
export function createMockErrorResponse(
  status: number,
  statusText: string,
  body?: unknown,
  jsonError?: Error
): Response {
  return createMockResponse({
    status,
    statusText,
    ok: false,
    body,
    jsonError,
  });
}

/**
 * Creates a mock success response for testing successful HTTP scenarios
 */
export function createMockSuccessResponse(
  body: unknown = {},
  status = 200
): Response {
  return createMockResponse({
    status,
    statusText: status === 200 ? 'OK' : status === 201 ? 'Created' : 'Success',
    ok: true,
    body,
  });
}

/**
 * Common response bodies used across tests
 */
export const mockResponseBodies = {
  permitKeyScope: {
    organization_id: 'test-org',
    project_id: 'test-project',
    environment_id: 'test-env',
  },
  serverError: {
    error: 'Server error',
  },
  validationError: {
    error: 'Validation failed',
    details: ['Field is required'],
  },
  userExists: {
    data: [
      {
        key: 'test-user',
        email: 'test@example.com',
      },
    ],
  },
  userNotExists: {
    data: [],
  },
  resourceInstance: [
    {
      key: 'test-group',
      resource: 'user_group',
      tenant: 'test-org',
    },
  ],
  emptyArray: [],
  emptyObject: {},
  gatewayError: {
    error: 'Bad gateway',
  },
  serviceUnavailable: {
    error: 'Service unavailable',
  },
  rateLimitError: {
    error: 'Rate limit exceeded',
  },
  authError: {
    error: 'Invalid token',
  },
  forbiddenError: {
    error: 'Access denied',
  },
  notFoundError: {
    error: 'Resource not found',
  },
  badRequestError: {
    error: 'Invalid request',
  },
} as const;

/**
 * Creates a mock error for testing scenarios where fetch throws instead of returning an error response
 */
export function createMockHttpError(
  status: number,
  statusText: string,
  body?: unknown
): Error & { status: number; body: unknown } {
  const error = new Error(`HTTP ${status}: ${statusText}`) as Error & {
    status: number;
    body: unknown;
  };
  error.status = status;
  error.body = body || {};

  return error;
}

interface CreateMockRelationshipTupleOptions {
  id?: string;
  subject?: string;
  relation?: string;
  object?: string;
  subjectId?: string;
  relationId?: string;
  objectId?: string;
  tenantId?: string;
  organizationId?: string;
  projectId?: string;
  environmentId?: string;
  createdAt?: string;
  updatedAt?: string;
  overrides?: Record<string, unknown>;
}

/**
 * Creates a mock RelationshipTuple for testing
 * All fields have sensible defaults that can be overridden via the options parameter
 */
export function createMockRelationshipTuple(
  options: CreateMockRelationshipTupleOptions = {}
): RelationshipTuple {
  const { overrides, ...rest } = options;

  return {
    id: rest.id ?? 'test-tuple-id',
    subject: rest.subject ?? 'parent_type:parent-1',
    relation: rest.relation ?? 'rs_parent',
    object: rest.object ?? 'rs_node:test-object-id',
    subject_id: rest.subjectId ?? 'test_subject-id',
    relation_id: rest.relationId ?? 'rs_parent',
    object_id: rest.objectId ?? 'test-object-id',
    tenant_id: rest.tenantId ?? 'test-org',
    organization_id: rest.organizationId ?? 'test-org-id',
    project_id: rest.projectId ?? 'test-project-id',
    environment_id: rest.environmentId ?? 'test-env-id',
    created_at: rest.createdAt ?? '2023-01-01T00:00:00Z',
    updated_at: rest.updatedAt ?? '2023-01-01T00:00:00Z',
    ...overrides,
  };
}

interface CreateMockRoleAssignmentOptions {
  id?: string;
  user?: string;
  role?: string;
  tenant?: string;
  resourceInstance?: string;
  resourceId?: string;
  resource?: string;
  organizationId?: string;
  projectId?: string;
  environmentId?: string;
  createdAt?: string;
  overrides?: Record<string, unknown>;
}

/**
 * Creates a mock RoleAssignment for testing
 * All fields have sensible defaults that can be overridden via the options parameter
 */
export function createMockRoleAssignment(
  options: CreateMockRoleAssignmentOptions = {}
): RoleAssignment {
  const { overrides, ...rest } = options;

  return {
    id: rest.id ?? 'test-role-assignment-id',
    user: rest.user ?? 'test-user',
    role: rest.role ?? 'Owner',
    tenant: rest.tenant ?? 'test-org',
    resource_instance: rest.resourceInstance ?? 'rs_node:test-object-id',
    resource_id: rest.resourceId ?? 'test-resource-id',
    resource: rest.resource ?? 'rs_node',
    organization_id: rest.organizationId ?? 'test-org-id',
    project_id: rest.projectId ?? 'test-project-id',
    environment_id: rest.environmentId ?? 'test-env-id',
    created_at: rest.createdAt ?? '2023-01-01T00:00:00Z',
    ...overrides,
  };
}
