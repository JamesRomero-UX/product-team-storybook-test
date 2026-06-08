import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiResponse } from '../types/api.js';
import { getEntityUrl } from '../utils/api.js';
import { fetchAllPages } from '../utils/pagination.js';

type RiskItem = ApiResponse<'/api/v1/risks/{id}', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const riskId = bundle.inputData.id;
  const response = await z.request({
    url: `${getEntityUrl(bundle, 'risks')}/${riskId}`,
    skipThrowForStatus: true,
  });

  if (response.status === 404) {
    return [];
  }
  response.throwForStatus();

  // Zapier platform types response.data as `{}`; cast to a looser type for safe spread below.
  const risk = response.data as Record<string, unknown>;

  const [controls, actions, ratings] = await Promise.all([
    fetchAllPages({ z, bundle, entity: `risks/${riskId}/controls` }),
    fetchAllPages({ z, bundle, entity: `risks/${riskId}/actions` }),
    fetchAllPages({ z, bundle, entity: `risks/${riskId}/ratings` }),
  ]);

  return [
    {
      ...risk,
      controls: controls.items,
      actions: actions.items,
      ratings: ratings.items,
    },
  ];
};

export default {
  key: 'get_risk_overview',
  noun: 'Risk',
  display: {
    label: 'Get Risk Overview',
    description: 'Gets a risk with its controls, actions, and ratings.',
  },
  operation: {
    inputFields: [
      {
        key: 'id',
        label: 'Risk ID',
        type: 'string' as const,
        required: true,
        // dynamic: 'list_risks.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
        helpText: 'The UUID of the risk to retrieve an overview for.',
      },
    ],
    perform,
    sample: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      sequentialId: 1,
      title: 'Data Breach Risk',
      description: 'Risk of unauthorised access to sensitive data',
      tier: 1,
      status: 'active',
      treatment: 'treat',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      controls: [{ id: 'ctrl-1', title: 'Access controls' }],
      actions: [{ id: 'act-1', title: 'Implement MFA' }],
      ratings: [{ id: 'rat-1', likelihood: 3, impact: 4 }],
    } satisfies Partial<RiskItem> & Record<string, unknown>,
  },
} satisfies Search;
