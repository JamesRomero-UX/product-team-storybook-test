import type { Search } from 'zapier-platform-core';

import {
  createSubResourceListSearch,
  linkedItemLabelFn,
} from '../utils/create-sub-resource-list-search.js';

export default createSubResourceListSearch({
  key: 'list_risk_linked_items',
  parentEntity: 'risks',
  subResource: 'linked-items',
  noun: 'Linked Item',
  label: 'List Risk Linked Items',
  description: 'Lists items linked to a risk.',
  parentIdLabel: 'Risk ID',
  parentIdHelpText: 'The UUID of the parent risk.',
  labelFn: linkedItemLabelFn,
  sample: {
    id: 'link-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    linkedItemId: 'ctrl-b2c3d4e5-f6a7-8901-bcde-f12345678901',
    linkedItemTitle: 'Access Control Policy',
    linkedItemType: 'policy',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    _zapierLabel: 'Access Control Policy (policy)',
  },
}) satisfies Search;
