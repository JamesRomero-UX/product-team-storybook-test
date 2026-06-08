import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type ActionItem = ApiResponse<'/api/v1/actions/{id}', 'get'>;

export default createFindSearch({
  key: 'find_action',
  noun: 'Action',
  entity: 'actions',
  label: 'Find Action',
  description: 'Finds an action by its ID.',
  idLabel: 'Action ID',
  idHelpText: 'The UUID of the action to find.',
  // dynamic: 'list_actions.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    sequentialId: 1,
    title: 'Implement MFA',
    description: 'Implement multi-factor authentication for all users',
    status: 'open',
    priority: 1,
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<ActionItem>,
});
