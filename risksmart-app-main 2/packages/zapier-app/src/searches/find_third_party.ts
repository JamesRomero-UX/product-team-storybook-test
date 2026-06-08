import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type ThirdPartyItem = ApiResponse<'/api/v1/third-parties/{id}', 'get'>;

export default createFindSearch({
  key: 'find_third_party',
  noun: 'Third Party',
  entity: 'third-parties',
  label: 'Find Third Party',
  description: 'Finds a third party by its ID.',
  idLabel: 'Third Party ID',
  idHelpText: 'The UUID of the third party to find.',
  // dynamic: 'list_third_parties.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'c9d0e1f2-a3b4-5678-cdef-789012345678',
    sequentialId: 1,
    title: 'Acme Cloud Services',
    description: 'Cloud infrastructure provider',
    companyName: 'Acme Cloud Services Ltd',
    type: 'vendor',
    status: 'active',
    criticality: 3,
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<ThirdPartyItem>,
});
