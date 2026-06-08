import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type PolicyItem = ApiListItem<'/api/v1/policies', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'policies');

export default {
  key: 'list_policies',
  noun: 'Policy',
  display: {
    label: 'List Policies',
    description: 'Lists policies in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
      sequentialId: 1,
      title: 'Data Protection Policy',
      _zapierLabel: 'Data Protection Policy (D-1)',
      description:
        'Policy governing the handling and protection of sensitive data',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<PolicyItem> & { _zapierLabel?: string },
  },
} satisfies Search;
