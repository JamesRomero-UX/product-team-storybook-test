import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { fetchAllPages, filterByOwner } from '../utils/pagination.js';

type RiskItem = ApiListItem<'/api/v1/risks', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const { items, isTruncated } = await fetchAllPages({
    z,
    bundle,
    entity: 'risks',
  });

  if (isTruncated) {
    z.console.log(
      'Warning: results were truncated. Owner filtering may be incomplete.'
    );
  }

  let results = filterByOwner(items, String(bundle.inputData.owner_id));

  if (bundle.inputData.status) {
    results = results.filter((item) => item.status === bundle.inputData.status);
  }

  if (bundle.inputData.tier) {
    const tier = Number(bundle.inputData.tier);
    results = results.filter((item) => item.tier === tier);
  }

  return results;
};

export default {
  key: 'find_risks_by_owner',
  noun: 'Risk',
  display: {
    label: 'Find Risks by Owner',
    description: 'Finds all risks owned by a specific user.',
  },
  operation: {
    inputFields: [
      {
        key: 'owner_id',
        label: 'Owner ID',
        type: 'string' as const,
        required: true,
        helpText:
          'The user ID of the owner (e.g. auth0|abc123). Use "Find User" to look up the ID.',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string' as const,
        required: false,
        choices: ['active', 'emerging', 'monitored', 'retired'],
        helpText: 'Optionally filter results by status.',
      },
      {
        key: 'tier',
        label: 'Tier',
        type: 'integer' as const,
        required: false,
        choices: ['1', '2', '3'],
        helpText: 'Optionally filter results by tier.',
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
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      tags: [],
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
    } satisfies Partial<RiskItem>,
  },
} satisfies Search;
