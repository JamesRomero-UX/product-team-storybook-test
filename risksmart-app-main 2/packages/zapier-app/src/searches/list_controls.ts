import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type ControlItem = ApiListItem<'/api/v1/controls', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'controls');

export default {
  key: 'list_controls',
  noun: 'Control',
  display: {
    label: 'List Controls',
    description: 'Lists controls in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      sequentialId: 1,
      title: 'Access Control Policy',
      _zapierLabel: 'Access Control Policy (C-1)',
      description: 'Role-based access control enforcement',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<ControlItem> & { _zapierLabel?: string },
  },
} satisfies Search;
