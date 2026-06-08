import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiListItem } from '../types/api.js';
import { fetchAllPages, filterByOwner } from '../utils/pagination.js';

type IssueItem = ApiListItem<'/api/v1/issues', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const { items, isTruncated } = await fetchAllPages({
    z,
    bundle,
    entity: 'issues',
  });

  if (isTruncated) {
    z.console.log(
      'Warning: results were truncated. Owner filtering may be incomplete.'
    );
  }

  const results = filterByOwner(items, String(bundle.inputData.owner_id));

  return results;
};

export default {
  key: 'find_issues_by_owner',
  noun: 'Issue',
  display: {
    label: 'Find Issues by Owner',
    description: 'Finds all issues owned by a specific user.',
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
    ],
    perform,
    sample: {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      sequentialId: 1,
      title: 'System Outage',
      description: 'Unexpected system outage affecting production',
      owners: ['auth0|abc123'],
      contributors: ['auth0|def456'],
      createdBy: 'auth0|abc123',
      updatedBy: 'auth0|abc123',
      tags: [],
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
    } satisfies Partial<IssueItem>,
  },
} satisfies Search;
