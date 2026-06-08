import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type IssueItem = ApiListItem<'/api/v1/issues', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'issues');

export default {
  key: 'list_issues',
  noun: 'Issue',
  display: {
    label: 'List Issues',
    description: 'Lists issues in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      sequentialId: 1,
      title: 'System Outage',
      _zapierLabel: 'System Outage (I-1)',
      description: 'Unexpected system outage affecting production',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<IssueItem> & { _zapierLabel?: string },
  },
} satisfies Search;
