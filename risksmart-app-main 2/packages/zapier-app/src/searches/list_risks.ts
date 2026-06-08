import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type RiskItem = ApiListItem<'/api/v1/risks', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'risks');

export default {
  key: 'list_risks',
  noun: 'Risk',
  display: {
    label: 'List Risks',
    description: 'Lists risks in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      sequentialId: 1,
      title: 'Data Breach Risk',
      _zapierLabel: 'Data Breach Risk (R-1)',
      description: 'Risk of unauthorised access to sensitive data',
      tier: 1,
      status: 'active',
      treatment: 'treat',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<RiskItem> & { _zapierLabel?: string },
  },
} satisfies Search;
