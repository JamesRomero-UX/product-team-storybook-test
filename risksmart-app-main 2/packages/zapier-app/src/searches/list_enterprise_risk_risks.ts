import type { Search } from 'zapier-platform-core';

import { createSubResourceListSearch } from '../utils/create-sub-resource-list-search.js';

export default createSubResourceListSearch({
  key: 'list_enterprise_risk_risks',
  parentEntity: 'enterprise-risks',
  subResource: 'risks',
  noun: 'Risk',
  label: 'List Enterprise Risk Risks',
  description: 'Lists risks under an enterprise risk.',
  parentIdLabel: 'Enterprise Risk ID',
  parentIdHelpText: 'The UUID of the parent enterprise risk.',
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
    contributors: [],
    tags: [],
    _zapierLabel: 'Data Breach Risk',
  },
}) satisfies Search;
