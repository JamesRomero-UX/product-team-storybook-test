import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type ThirdPartyItem = ApiListItem<'/api/v1/third-parties', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'third-parties');

export default {
  key: 'list_third_parties',
  noun: 'Third Party',
  display: {
    label: 'List Third Parties',
    description: 'Lists third parties in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'c9d0e1f2-a3b4-5678-cdef-789012345678',
      sequentialId: 1,
      title: 'Acme Cloud Services',
      _zapierLabel: 'Acme Cloud Services (TP-1)',
      description: 'Cloud infrastructure provider',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<ThirdPartyItem> & { _zapierLabel?: string },
  },
} satisfies Search;
