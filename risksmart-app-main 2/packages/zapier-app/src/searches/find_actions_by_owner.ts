import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { fetchAllPages, filterByOwner } from '../utils/pagination.js';

type ActionItem = ApiListItem<'/api/v1/actions', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const { items, isTruncated } = await fetchAllPages({
    z,
    bundle,
    entity: 'actions',
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

  return results;
};

export default {
  key: 'find_actions_by_owner',
  noun: 'Action',
  display: {
    label: 'Find Actions by Owner',
    description: 'Finds all actions owned by a specific user.',
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
        choices: ['open', 'closed', 'overdue'],
        helpText: 'Optionally filter results by status.',
      },
    ],
    perform,
    sample: {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      sequentialId: 1,
      title: 'Implement MFA',
      description: 'Implement multi-factor authentication for all users',
      status: 'open',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      tags: [],
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
    } satisfies Partial<ActionItem>,
  },
} satisfies Search;
