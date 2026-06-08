import type { Search } from 'zapier-platform-core';

import { createSubResourceListSearch } from '../utils/create-sub-resource-list-search.js';

export default createSubResourceListSearch({
  key: 'list_risk_appetites',
  parentEntity: 'risks',
  subResource: 'appetites',
  noun: 'Appetite',
  label: 'List Risk Appetites',
  description: 'Lists appetite statements for a risk.',
  parentIdLabel: 'Risk ID',
  parentIdHelpText: 'The UUID of the parent risk.',
  sample: {
    id: 'apt-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    sequentialId: 1,
    statement: 'Low tolerance for data breach risk',
    lowerAppetite: 1,
    upperAppetite: 3,
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    _zapierLabel: 'apt-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  },
}) satisfies Search;
