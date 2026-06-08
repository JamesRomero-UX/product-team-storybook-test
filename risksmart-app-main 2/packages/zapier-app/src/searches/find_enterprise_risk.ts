import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type EnterpriseRiskItem = ApiResponse<'/api/v1/enterprise-risks/{id}', 'get'>;

export default createFindSearch({
  key: 'find_enterprise_risk',
  noun: 'Enterprise Risk',
  entity: 'enterprise-risks',
  label: 'Find Enterprise Risk',
  description: 'Finds an enterprise risk by its ID.',
  idLabel: 'Enterprise Risk ID',
  idHelpText: 'The UUID of the enterprise risk to find.',
  // dynamic: 'list_enterprise_risks.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'd0e1f2a3-b4c5-6789-defa-890123456789',
    sequentialId: 1,
    title: 'Cybersecurity Threat',
    description: 'Enterprise-level cybersecurity risk',
    tier: 0,
    treatment: 'treat',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<EnterpriseRiskItem>,
});
