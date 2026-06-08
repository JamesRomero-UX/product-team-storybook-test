import type { Search } from 'zapier-platform-core';

import { createSubResourceListSearch } from '../utils/create-sub-resource-list-search.js';

export default createSubResourceListSearch({
  key: 'list_risk_acceptances',
  parentEntity: 'risks',
  subResource: 'acceptances',
  noun: 'Acceptance',
  label: 'List Risk Acceptances',
  description: 'Lists acceptance records for a risk.',
  parentIdLabel: 'Risk ID',
  parentIdHelpText: 'The UUID of the parent risk.',
  sample: {
    id: 'acc-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    sequentialId: 1,
    title: 'Q1 Risk Acceptance',
    description: 'Accepted for Q1 operations',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: [],
    tags: [],
    _zapierLabel: 'Q1 Risk Acceptance',
  },
}) satisfies Search;
