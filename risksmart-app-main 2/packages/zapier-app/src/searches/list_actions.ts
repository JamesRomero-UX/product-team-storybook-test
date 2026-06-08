import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type ActionItem = ApiListItem<'/api/v1/actions', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'actions');

export default {
  key: 'list_actions',
  noun: 'Action',
  display: {
    label: 'List Actions',
    description: 'Lists actions in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      sequentialId: 1,
      title: 'Implement MFA',
      _zapierLabel: 'Implement MFA (A-1)',
      description: 'Implement multi-factor authentication for all users',
      status: 'open',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<ActionItem> & { _zapierLabel?: string },
  },
} satisfies Search;
