import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type ImpactItem = ApiListItem<'/api/v1/impacts', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'impacts');

export default {
  key: 'list_impacts',
  noun: 'Impact',
  display: {
    label: 'List Impacts',
    description: 'Lists impacts in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'e1f2a3b4-c5d6-7890-efab-901234567890',
      sequentialId: 1,
      title: 'Financial Impact',
      _zapierLabel: 'Financial Impact (IM-1)',
      description: 'Financial impact category for risk assessment',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<ImpactItem> & { _zapierLabel?: string },
  },
} satisfies Search;
