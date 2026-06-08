import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type AssessmentItem = ApiListItem<'/api/v1/assessments', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'assessments');

export default {
  key: 'list_assessments',
  noun: 'Assessment',
  display: {
    label: 'List Assessments',
    description: 'Lists assessments in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
      sequentialId: 1,
      title: 'Q1 Risk Assessment',
      _zapierLabel: 'Q1 Risk Assessment (ASMT-1)',
      description: 'Quarterly risk assessment for Q1 2026',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<AssessmentItem> & { _zapierLabel?: string },
  },
} satisfies Search;
