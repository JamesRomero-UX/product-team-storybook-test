import { describe, expect, it, vi } from 'vitest';

import { routes } from './handler';

// Mock all processors to avoid database/external dependencies
vi.mock('./processors/aggregation-settings/get', () => ({
  getAggregationSettingsProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/actions/get-register', () => ({
  getActionsRegisterProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
}));
vi.mock('./processors/actions/get-by-id', () => ({
  getActionByIdProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/action-updates/get-by-parent', () => ({
  getActionUpdatesByParentProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
}));
vi.mock('./processors/action-updates/get-by-id', () => ({
  getActionUpdateByIdProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/action-updates/create', () => ({
  createActionUpdateProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 201, body: '{}' }),
}));
vi.mock('./processors/action-updates/delete', () => ({
  deleteActionUpdatesProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 204, body: '' }),
}));
vi.mock('./processors/control-groups/create', () => ({
  createControlGroupProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 201, body: '{}' }),
}));
vi.mock('./processors/control-groups/delete', () => ({
  deleteControlGroupProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 204, body: '' }),
}));
vi.mock(
  './processors/document-assessment-results/get-latest-by-document',
  () => ({
    getLatestDocumentAssessmentResultByDocumentProcessor: vi
      .fn()
      .mockResolvedValue({ statusCode: 200, body: '{}' }),
  })
);
vi.mock('./processors/form-configurations', () => ({
  getFormConfigurationsProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
}));
vi.mock('./processors/impact-ratings/get-oldest-active-by-risk', () => ({
  getOldestActiveImpactRatingByRiskProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/indicator-results/create', () => ({
  createIndicatorResultProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 201, body: '{}' }),
}));
vi.mock('./processors/indicator-results/get-latest-by-indicator', () => ({
  getLatestIndicatorResultByIndicatorProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/issue-updates/create', () => ({
  createIssueUpdateProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 201, body: '{}' }),
}));
vi.mock('./processors/issue-updates/delete', () => ({
  deleteIssueUpdatesProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 204, body: '' }),
}));
vi.mock(
  './processors/obligation-assessment-results/get-latest-by-obligation',
  () => ({
    getLatestObligationAssessmentResultByObligationProcessor: vi
      .fn()
      .mockResolvedValue({ statusCode: 200, body: '{}' }),
  })
);
vi.mock('./processors/obligation-impacts/create', () => ({
  createObligationImpactProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 201, body: '{}' }),
}));
vi.mock('./processors/obligation-impacts/delete', () => ({
  deleteObligationImpactsProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 204, body: '' }),
}));
vi.mock('./processors/form-fields', () => ({
  createFormFieldProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 201, body: '{}' }),
  updateFormFieldProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
  deleteFormFieldProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 204, body: '' }),
}));
vi.mock('./processors/risk-assessment-results/create', () => ({
  createRiskAssessmentResultProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 201, body: '{}' }),
}));
vi.mock('./processors/risk-assessment-results/get-latest-by-risk', () => ({
  getLatestRiskAssessmentResultByRiskProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/risks/create', () => ({
  createRiskProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 201, body: '{}' }),
}));
vi.mock('./processors/test-results/get-latest-by-control', () => ({
  getLatestTestResultByControlProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/schedules/get-by-id', () => ({
  getScheduleByIdProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/schedule-states/get-by-id', () => ({
  getScheduleStateByIdProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/schedule-states/upsert', () => ({
  upsertScheduleStateProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
}));
vi.mock('./processors/controls/create', () => ({
  createControlProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 201, body: '{}' }),
}));
vi.mock('./processors/user-groups', () => ({
  getUserGroupsWithApproversProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
  getUserGroupByIdProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '{}' }),
  getUsersByGroupIdProcessor: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
}));
vi.mock('./processors/my-items', () => ({
  getMyDueActions: vi.fn().mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueAssessments: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueAssessmentActivities: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueAttestationRecords: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueChangeRequests: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueControls: vi.fn().mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueDocuments: vi.fn().mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueIndicators: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueIssues: vi.fn().mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueObligations: vi
    .fn()
    .mockResolvedValue({ statusCode: 200, body: '[]' }),
  getMyDueRisks: vi.fn().mockResolvedValue({ statusCode: 200, body: '[]' }),
}));

// Mock Sentry and logger to avoid side effects
vi.mock('../../../utils/sentry-init', () => ({
  initSentry: vi.fn(),
}));
vi.mock('../../../utils/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    addContext: vi.fn(),
    clearBuffer: vi.fn(),
    resetKeys: vi.fn(),
    appendKeys: vi.fn(),
    addPersistentLogAttributes: vi.fn(),
    removePersistentLogAttributes: vi.fn(),
    setLogLevel: vi.fn(),
  })),
}));

describe('Client API Handler', () => {
  describe('Route definitions', () => {
    it('should contain GET, POST, PUT, and DELETE methods', () => {
      const methods = new Set(routes.map((r) => r.method));
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
    });
  });
});
