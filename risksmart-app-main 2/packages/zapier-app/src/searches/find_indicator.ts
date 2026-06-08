import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type IndicatorItem = ApiResponse<'/api/v1/indicators/{id}', 'get'>;

export default createFindSearch({
  key: 'find_indicator',
  noun: 'Indicator',
  entity: 'indicators',
  label: 'Find Indicator',
  description: 'Finds an indicator by its ID.',
  idLabel: 'Indicator ID',
  idHelpText: 'The UUID of the indicator to find.',
  // dynamic: 'list_indicators.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    sequentialId: 1,
    title: 'System Uptime',
    description: 'Monthly system uptime percentage',
    type: 'number',
    unit: '%',
    targetValue: '100',
    upperTolerance: null,
    lowerTolerance: null,
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<IndicatorItem>,
});
