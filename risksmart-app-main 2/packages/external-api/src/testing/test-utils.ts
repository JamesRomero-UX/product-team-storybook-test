import type { Response } from 'express';
import { vi } from 'vitest';

import type { AuthenticatedRequest } from '../types/request';
import { createRequestLogger } from '../utils/logger';

export function createMockRequest(
  overrides: Partial<AuthenticatedRequest> = {}
): AuthenticatedRequest {
  const mockRequest = {
    method: 'GET',
    path: '/test',
    headers: {},
    body: {},
    query: {},
    params: {},
    requestId: 'test-request-id',
    tenantId: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'test-user-id',
    requestLogger: createRequestLogger({
      requestId: 'test-request-id',
      tenantId: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'test-user-id',
      method: 'GET',
      path: '/test',
      timestamp: new Date().toISOString(),
    }),
    startTime: Date.now(),
    ...overrides,
  } as AuthenticatedRequest;

  return mockRequest;
}

export function createMockResponse(): Response {
  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    statusCode: 200,
  } as unknown as Response;

  return mockResponse;
}

export function createMockNext() {
  return vi.fn();
}

export const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';

export const mockJwtToken =
  // no-dd-sa
  'eyJraWQiOiJjMjJkMTA3ZTg1MTNmMWQ0MmEwZjY4MzU4MTVmZDg4MjM4MDlhN2QzNDYwNTJjM2RkNGE4ODgyOWM0NzU2N2JjMDc1NDJkODRmYTYwNjdkOCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMyMzIiLCJpYXQiOjE3NjgzMDYyMjIsImV4cCI6MTYxNjgzMDYyMjIsIm5iZiI6MTc2ODMwNjIxMiwic2NvcGUiOiJyaXNrczpyZWFkIHJpc2tzOndyaXRlIGF1dGgtY2xpZW50OnJlYWQgYXV0aC1jbGllbnQ6d3JpdGUiLCJhdWQiOiJjbGllbnQtb25lIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwicGVybWlzc2lvbnMiOiJyaXNrczpyZWFkLHJpc2tzOndyaXRlIiwidGVuYW50X2lkIjoiYWJjMTIzIiwib3JnX2lkIjoiYWJjMTIzIiwic3ViIjoiYXV0aDB8dGVzdF91c2VyXzEyMyIsImF6cCI6ImNsaWVudC1vbmUiLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiUmlza01hbmFnZXIiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiUmlza01hbmFnZXIiLCJ4LWhhc3VyYS1sb2dvIjoiZGVmYXVsdCIsIngtaGFzdXJhLXRheG9ub215IjoiZGVmYXVsdCIsIngtaGFzdXJhLWZlYXR1cmVzIjoibm90aWZpY2F0aW9ucyxyZXBvcnRzLGNvbXBsaWFuY2UscG9saWN5LG5vdGlmaWNhdGlvbi1wcmVmZXJlbmNlcyxpbXBhY3RzLGFwcHJvdmVycyxhdHRlc3RhdGlvbnMsaW50ZXJuYWxfYXVkaXQsY29tcGxpYW5jZV9tb25pdG9yaW5nLG11bHRpX3JlcG9ydGluZyxteV9pdGVtc19kYXNoYm9hcmQsZW50ZXJwcmlzZV9yaXNrLHBlcm1pdCxhaWVfY2hhdCxtb2R1bGVzLHRycGMiLCJ4LWhhc3VyYS1vcmctaWQiOiJhYmMxMjMiLCJ4LWhhc3VyYS10ZW5hbnQtbmFtZSI6Ik11bHRpVGVuYW50IiwieC1oYXN1cmEtdXNlci1pZCI6ImF1dGgwfHRlc3RfdXNlcl8xMjMifSwiY2xhaW1zX3JvbGVzIjpbIlJpc2tNYW5hZ2VyIl19.imLzl-JkHvR9M7JbSNQ7Dd99ZHGtXQS217i3eR7_3cDgv2fRt-IJOfZAMN-QnCO7ODwnx-WmqNVrFz0m8-v-KTnnQ_LKdmkhiO24EOxtUyLmTi65EbIpca72UKIVIawGh7Qk0ZzzDJ8JO6XWa4IQbMS4q7X2Qg_NYgZ_weyL9lmUEPEJPxC6A5AG6-fyAxoMTrViAzD98dBvO7ooWcemCH01cRLS4IJtx4yDsXBzzicPMft-HiKt_e9oH9TL-b7Wb3dHGZhsb0y3tN7WXmDTuLo9HycQTAjDvq8ogyEalKC-HOWBxs0Ki044xarVN2ceGmhWIJ3rNtdXRXuZnNtbgg';
export const sampleRisk = {
  id: '456e7890-e12b-34c5-d678-901234567890',
  title: 'Test Risk',
  description: 'This is a test risk',
  severity: 'medium' as const,
  status: 'open' as const,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  tenantId: mockTenantId,
};
