import type { Bundle, Search, ZObject } from 'zapier-platform-core';

import type { ApiResponse } from '../types/api.js';
import { getEntityUrl } from '../utils/api.js';
import { fetchAllPages } from '../utils/pagination.js';

type IssueItem = ApiResponse<'/api/v1/issues/{id}', 'get'>;

const perform = async (z: ZObject, bundle: Bundle) => {
  const issueId = bundle.inputData.id;
  const response = await z.request({
    url: `${getEntityUrl(bundle, 'issues')}/${issueId}`,
    skipThrowForStatus: true,
  });

  if (response.status === 404) {
    return [];
  }
  response.throwForStatus();

  // Zapier platform types response.data as `{}`; cast to a looser type for safe spread below.
  const issue = response.data as Record<string, unknown>;

  const [causes, consequences, linkedItems] = await Promise.all([
    fetchAllPages({ z, bundle, entity: `issues/${issueId}/causes` }),
    fetchAllPages({ z, bundle, entity: `issues/${issueId}/consequences` }),
    fetchAllPages({ z, bundle, entity: `issues/${issueId}/linked-items` }),
  ]);

  return [
    {
      ...issue,
      causes: causes.items,
      consequences: consequences.items,
      linkedItems: linkedItems.items,
    },
  ];
};

export default {
  key: 'get_issue_details',
  noun: 'Issue',
  display: {
    label: 'Get Issue Details',
    description:
      'Gets an issue with its causes, consequences, and linked items.',
  },
  operation: {
    inputFields: [
      {
        key: 'id',
        label: 'Issue ID',
        type: 'string' as const,
        required: true,
        // dynamic: 'list_issues.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
        helpText: 'The UUID of the issue to retrieve details for.',
      },
    ],
    perform,
    sample: {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      sequentialId: 1,
      title: 'System Outage',
      description: 'Unexpected system outage affecting production',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
      causes: [{ id: 'cause-1', title: 'Hardware failure' }],
      consequences: [{ id: 'cons-1', title: 'Revenue loss' }],
      linkedItems: [{ id: 'link-1', title: 'Related risk' }],
    } satisfies Partial<IssueItem> & Record<string, unknown>,
  },
} satisfies Search;
