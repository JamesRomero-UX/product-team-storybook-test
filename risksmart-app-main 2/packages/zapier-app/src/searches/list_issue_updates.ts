import type { Search } from 'zapier-platform-core';

import { createSubResourceListSearch } from '../utils/create-sub-resource-list-search.js';

export default createSubResourceListSearch({
  key: 'list_issue_updates',
  parentEntity: 'issues',
  subResource: 'updates',
  noun: 'Issue Update',
  label: 'List Issue Updates',
  description: 'Lists updates for an issue.',
  parentIdLabel: 'Issue ID',
  parentIdHelpText: 'The UUID of the parent issue.',
  sample: {
    id: 'upd-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'Status Update',
    description: 'Investigation ongoing',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    _zapierLabel: 'Status Update',
  },
}) satisfies Search;
