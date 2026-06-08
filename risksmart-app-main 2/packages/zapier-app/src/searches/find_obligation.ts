import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type ObligationItem = ApiResponse<'/api/v1/compliance/obligations/{id}', 'get'>;

export default createFindSearch({
  key: 'find_obligation',
  noun: 'Obligation',
  entity: 'compliance/obligations',
  label: 'Find Obligation',
  description: 'Finds an obligation by its ID.',
  idLabel: 'Obligation ID',
  idHelpText: 'The UUID of the obligation to find.',
  // dynamic: 'list_obligations.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'b8c9d0e1-f2a3-4567-bcde-678901234567',
    sequentialId: 1,
    title: 'GDPR Article 30',
    description: 'Maintain records of processing activities',
    type: 'regulatory',
    interpretation: 'Must maintain up-to-date processing records',
    adherence: 'compliant',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<ObligationItem>,
});
