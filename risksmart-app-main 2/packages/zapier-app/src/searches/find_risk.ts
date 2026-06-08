import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type RiskItem = ApiResponse<'/api/v1/risks/{id}', 'get'>;

export default createFindSearch({
  key: 'find_risk',
  noun: 'Risk',
  entity: 'risks',
  label: 'Find Risk',
  description: 'Finds a risk by its ID.',
  idLabel: 'Risk ID',
  idHelpText: 'The UUID of the risk to find.',
  // dynamic: 'list_risks.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    sequentialId: 1,
    title: 'Data Breach Risk',
    description: 'Risk of unauthorised access to sensitive data',
    tier: 1,
    status: 'active',
    treatment: 'treat',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<RiskItem>,
});
