import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type PolicyItem = ApiResponse<'/api/v1/policies/{id}', 'get'>;

export default createFindSearch({
  key: 'find_policy',
  noun: 'Policy',
  entity: 'policies',
  label: 'Find Policy',
  description: 'Finds a policy by its ID.',
  idLabel: 'Policy ID',
  idHelpText: 'The UUID of the policy to find.',
  // dynamic: 'list_policies.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
    sequentialId: 1,
    title: 'Data Protection Policy',
    description:
      'Policy governing the handling and protection of sensitive data',
    type: 'policy',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<PolicyItem>,
});
