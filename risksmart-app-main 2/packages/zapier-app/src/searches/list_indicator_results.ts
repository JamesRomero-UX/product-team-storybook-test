import type { Search } from 'zapier-platform-core';

import {
  createSubResourceListSearch,
  indicatorResultLabelFn,
} from '../utils/create-sub-resource-list-search.js';

export default createSubResourceListSearch({
  key: 'list_indicator_results',
  parentEntity: 'indicators',
  subResource: 'results',
  noun: 'Indicator Result',
  label: 'List Indicator Results',
  description: 'Lists results for an indicator.',
  parentIdLabel: 'Indicator ID',
  parentIdHelpText: 'The UUID of the parent indicator.',
  labelFn: indicatorResultLabelFn,
  sample: {
    id: 'res-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Monthly revenue check',
    resultDate: '2026-01-15T10:30:00Z',
    targetValueText: 'Above threshold',
    targetValueNumber: 100,
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    _zapierLabel: 'Monthly revenue check (2026-01-15T10:30:00Z)',
  },
}) satisfies Search;
