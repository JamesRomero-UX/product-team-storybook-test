import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type IndicatorItem = ApiListItem<'/api/v1/indicators', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'indicators');

export default {
  key: 'list_indicators',
  noun: 'Indicator',
  display: {
    label: 'List Indicators',
    description: 'Lists indicators in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      sequentialId: 1,
      title: 'System Uptime',
      _zapierLabel: 'System Uptime (IN-1)',
      description: 'Monthly system uptime percentage',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<IndicatorItem> & { _zapierLabel?: string },
  },
} satisfies Search;
