import type { Search } from 'zapier-platform-core';

import {
  createSubResourceListSearch,
  linkedItemLabelFn,
} from '../utils/create-sub-resource-list-search.js';

export default createSubResourceListSearch({
  key: 'list_indicator_linked_items',
  parentEntity: 'indicators',
  subResource: 'linked-items',
  noun: 'Linked Item',
  label: 'List Indicator Linked Items',
  description: 'Lists items linked to an indicator.',
  parentIdLabel: 'Indicator ID',
  parentIdHelpText: 'The UUID of the parent indicator.',
  labelFn: linkedItemLabelFn,
  sample: {
    id: 'link-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    linkedItemId: 'risk-b2c3d4e5-f6a7-8901-bcde-f12345678901',
    linkedItemTitle: 'Data Breach Risk',
    linkedItemType: 'risk',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    _zapierLabel: 'Data Breach Risk (risk)',
  },
}) satisfies Search;
