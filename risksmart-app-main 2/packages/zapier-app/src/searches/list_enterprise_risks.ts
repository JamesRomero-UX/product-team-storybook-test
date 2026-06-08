import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { listInputFields, performList } from '../utils/list.js';

type EnterpriseRiskItem = ApiListItem<'/api/v1/enterprise-risks', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) =>
  performList(z, bundle, 'enterprise-risks');

export default {
  key: 'list_enterprise_risks',
  noun: 'Enterprise Risk',
  display: {
    label: 'List Enterprise Risks',
    description: 'Lists enterprise risks in RiskSmart.',
  },
  operation: {
    inputFields: listInputFields,
    perform,
    canPaginate: true,
    sample: {
      id: 'd0e1f2a3-b4c5-6789-defa-890123456789',
      sequentialId: 1,
      title: 'Cybersecurity Threat',
      _zapierLabel: 'Cybersecurity Threat (ER-1)',
      description: 'Enterprise-level cybersecurity risk',
      tier: 0,
      treatment: 'treat',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      tags: [],
    } satisfies Partial<EnterpriseRiskItem> & { _zapierLabel?: string },
  },
} satisfies Search;
