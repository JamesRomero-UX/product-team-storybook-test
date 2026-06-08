import type { Search } from 'zapier-platform-core';

import { createSubResourceListSearch } from '../utils/create-sub-resource-list-search.js';

export default createSubResourceListSearch({
  key: 'list_issue_actions',
  parentEntity: 'issues',
  subResource: 'actions',
  noun: 'Action',
  label: 'List Issue Actions',
  description: 'Lists actions associated with an issue.',
  parentIdLabel: 'Issue ID',
  parentIdHelpText: 'The UUID of the parent issue.',
  sample: {
    id: 'act-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    sequentialId: 1,
    title: 'Investigate Root Cause',
    description: 'Determine the root cause of the issue',
    status: 'open',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: [],
    tags: [],
    _zapierLabel: 'Investigate Root Cause',
  },
}) satisfies Search;
