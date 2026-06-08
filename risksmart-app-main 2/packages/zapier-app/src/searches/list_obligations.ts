import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type ObligationItem = ApiListItem<'/api/v1/compliance/obligations', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'compliance/obligations');

export default {
  key: 'list_obligations',
  noun: 'Obligation',
  display: {
    label: 'List Obligations',
    description: 'Lists compliance obligations in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'b8c9d0e1-f2a3-4567-bcde-678901234567',
      sequentialId: 1,
      title: 'GDPR Article 30',
      _zapierLabel: 'GDPR Article 30 (O-1)',
      description: 'Maintain records of processing activities',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<ObligationItem> & { _zapierLabel?: string },
  },
} satisfies Search;
