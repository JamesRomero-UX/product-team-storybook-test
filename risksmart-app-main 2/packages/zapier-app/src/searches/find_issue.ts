import type { ApiResponse } from '../types/api.js';
import { createFindSearch } from '../utils/create-find-search.js';

type IssueItem = ApiResponse<'/api/v1/issues/{id}', 'get'>;

export default createFindSearch({
  key: 'find_issue',
  noun: 'Issue',
  entity: 'issues',
  label: 'Find Issue',
  description: 'Finds an issue by its ID.',
  idLabel: 'Issue ID',
  idHelpText: 'The UUID of the issue to find.',
  // dynamic: 'list_issues.id._zapierLabel', // TODO: re-enable when polling triggers ship (Phase 2)
  sample: {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    sequentialId: 1,
    title: 'System Outage',
    description: 'Unexpected system outage affecting production',
    dateOccurred: '2026-01-14T08:00:00Z',
    dateIdentified: '2026-01-14T08:15:00Z',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdBy: 'auth0|abc123',
    updatedBy: 'auth0|abc123',
    owners: ['auth0|abc123'],
    contributors: ['auth0|def456'],
    tags: [],
  } satisfies Partial<IssueItem>,
});
