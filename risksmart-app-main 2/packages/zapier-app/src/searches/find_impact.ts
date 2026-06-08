import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type ImpactItem = ApiResponse<'/api/v1/impacts/{id}', 'get'>;

export default createFindSearch({
  key: 'find_impact',
  noun: 'Impact',
  entity: 'impacts',
  label: 'Find Impact',
  description: 'Finds an impact by its ID.',
  idLabel: 'Impact ID',
  idHelpText: 'The UUID of the impact to find.',
  // dynamic: 'list_impacts.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'e1f2a3b4-c5d6-7890-efab-901234567890',
    sequentialId: 1,
    title: 'Financial Impact',
    description: 'Financial impact category for risk assessment',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<ImpactItem>,
});
