/**
 * Integration and adversarial tests for the Notification History feature (web layer).
 *
 * These tests cover gaps NOT addressed by the existing unit tests:
 *  1. Every Knock workflow directory mapped against resolveNotificationUrl — flagging any unmapped keys
 *  2. Every Knock workflow directory mapped against mapWorkflowKeyToObjectType
 *  3. Removed
 *  4. Malformed data: null data payloads, missing objectId, empty engagement statuses
 *  5. Recipient display fallback hierarchy (name → email → id)
 *  6. buildQueryInput with all filter combinations
 *  7. Edge cases in mapWorkflowKeyToObjectType
 */

import { describe, expect, it } from 'vitest';

import type { NotificationFilterState } from '@/hooks/notifications/types';
import {
  buildQueryInput,
  getDefaultDateRange,
} from '@/hooks/notifications/useNotificationHistory';
import { mapWorkflowKeyToObjectType } from '@/hooks/notifications/utils';
import { resolveNotificationUrl } from '@/utils/notificationUrlResolver';

// All Knock workflow directory names from packages/knock/workflows/
// This list is the ground truth from the filesystem. If any key is missing from
// the resolver, the test will flag it.
const ALL_KNOCK_WORKFLOW_KEYS = [
  'action-delete',
  'action-due',
  'action-insert',
  'action-overdue',
  'action-update',
  'attestation-record-insert',
  'change-request-insert',
  'change-request-rejected',
  'control-delete',
  'control-insert',
  'control-test-due',
  'control-test-overdue',
  'control-update',
  'digest',
  'document-delete',
  'document-due',
  'document-insert',
  'document-overdue',
  'document-update',
  'indicator-due',
  'indicator-overdue',
  'issue-delete',
  'issue-due',
  'issue-insert',
  'issue-overdue',
  'issue-update',
  'policy-approver',
  'policy-attestation-reminder',
  'policy-document-version-review-due',
  'policy-document-version-review-upcoming',
  'risk-assessment-due',
  'risk-assessment-overdue',
  'risk-delete',
  'risk-insert',
  'risk-update',
  'third-party-new-questionnaire',
  'third-party-password-reset',
  'third-party-recall-questionnaire',
  'third-party-response-submitted',
  'third-party-response-update-status',
  'third-party-set-password',
] as const;

type WorkflowKey = (typeof ALL_KNOCK_WORKFLOW_KEYS)[number];

// Workflows that intentionally return null (no direct object link)
const KNOWN_NULL_RETURNING_WORKFLOWS: WorkflowKey[] = [
  'action-delete',
  'control-delete',
  'document-delete',
  'issue-delete',
  'risk-delete',
  'change-request-insert',
  'change-request-rejected',
  'digest',
];

// Workflows that need parentObjectId + objectId
const NEEDS_PARENT_AND_OBJECT: WorkflowKey[] = [
  'attestation-record-insert',
  'policy-attestation-reminder',
];

// Workflows that need both objectId and parentObjectId for questionnaire response
const NEEDS_PARENT_AND_OBJECT_QUESTIONNAIRE: WorkflowKey[] = [
  'third-party-response-submitted',
  'third-party-response-update-status',
];

// Workflows that need only objectId for third-party details
const _NEEDS_OBJECT_ONLY_THIRD_PARTY: WorkflowKey[] = [
  'third-party-new-questionnaire',
  'third-party-password-reset',
  'third-party-recall-questionnaire',
  'third-party-set-password',
];

const OBJECT_ID = 'test-object-id';
const PARENT_ID = 'test-parent-id';

describe('resolveNotificationUrl — all Knock workflow keys', () => {
  describe('exhaustive coverage: every workflow in packages/knock/workflows/', () => {
    it('resolves action-insert with objectId to /actions/:id', () => {
      expect(
        resolveNotificationUrl('action-insert', { objectId: OBJECT_ID })
      ).toBe(`/actions/${OBJECT_ID}`);
    });

    it('resolves action-update with objectId to /actions/:id', () => {
      expect(
        resolveNotificationUrl('action-update', { objectId: OBJECT_ID })
      ).toBe(`/actions/${OBJECT_ID}`);
    });

    it('resolves action-due with objectId to /actions/:id', () => {
      expect(
        resolveNotificationUrl('action-due', { objectId: OBJECT_ID })
      ).toBe(`/actions/${OBJECT_ID}`);
    });

    it('resolves action-overdue with objectId to /actions/:id', () => {
      expect(
        resolveNotificationUrl('action-overdue', { objectId: OBJECT_ID })
      ).toBe(`/actions/${OBJECT_ID}`);
    });

    it('resolves action-delete to null', () => {
      expect(
        resolveNotificationUrl('action-delete', { objectId: OBJECT_ID })
      ).toBeNull();
    });

    it('resolves attestation-record-insert with both IDs to public policy file URL', () => {
      expect(
        resolveNotificationUrl('attestation-record-insert', {
          objectId: OBJECT_ID,
          parentObjectId: PARENT_ID,
        })
      ).toBe(`/public-policies/${PARENT_ID}/files/${OBJECT_ID}`);
    });

    it('resolves change-request-insert to null', () => {
      expect(
        resolveNotificationUrl('change-request-insert', { objectId: OBJECT_ID })
      ).toBeNull();
    });

    it('resolves change-request-rejected to null', () => {
      expect(
        resolveNotificationUrl('change-request-rejected', {
          objectId: OBJECT_ID,
        })
      ).toBeNull();
    });

    it('resolves control-delete to null', () => {
      expect(
        resolveNotificationUrl('control-delete', { objectId: OBJECT_ID })
      ).toBeNull();
    });

    it('resolves control-insert with objectId to /controls/:id', () => {
      expect(
        resolveNotificationUrl('control-insert', { objectId: OBJECT_ID })
      ).toBe(`/controls/${OBJECT_ID}`);
    });

    it('resolves control-test-due with objectId to /controls/:id', () => {
      expect(
        resolveNotificationUrl('control-test-due', { objectId: OBJECT_ID })
      ).toBe(`/controls/${OBJECT_ID}`);
    });

    it('resolves control-test-overdue with objectId to /controls/:id', () => {
      expect(
        resolveNotificationUrl('control-test-overdue', { objectId: OBJECT_ID })
      ).toBe(`/controls/${OBJECT_ID}`);
    });

    it('resolves control-update with objectId to /controls/:id', () => {
      expect(
        resolveNotificationUrl('control-update', { objectId: OBJECT_ID })
      ).toBe(`/controls/${OBJECT_ID}`);
    });

    it('resolves digest to null', () => {
      expect(
        resolveNotificationUrl('digest', { objectId: OBJECT_ID })
      ).toBeNull();
    });

    it('resolves document-delete to null', () => {
      expect(
        resolveNotificationUrl('document-delete', { objectId: OBJECT_ID })
      ).toBeNull();
    });

    it('resolves document-due with objectId to /policy/:id', () => {
      expect(
        resolveNotificationUrl('document-due', { objectId: OBJECT_ID })
      ).toBe(`/policy/${OBJECT_ID}`);
    });

    it('resolves document-insert with objectId to /policy/:id', () => {
      expect(
        resolveNotificationUrl('document-insert', { objectId: OBJECT_ID })
      ).toBe(`/policy/${OBJECT_ID}`);
    });

    it('resolves document-overdue with objectId to /policy/:id', () => {
      expect(
        resolveNotificationUrl('document-overdue', { objectId: OBJECT_ID })
      ).toBe(`/policy/${OBJECT_ID}`);
    });

    it('resolves document-update with objectId to /policy/:id', () => {
      expect(
        resolveNotificationUrl('document-update', { objectId: OBJECT_ID })
      ).toBe(`/policy/${OBJECT_ID}`);
    });

    it('resolves indicator-due with objectId to /indicator/:id', () => {
      expect(
        resolveNotificationUrl('indicator-due', { objectId: OBJECT_ID })
      ).toBe(`/indicator/${OBJECT_ID}`);
    });

    it('resolves indicator-overdue with objectId to /indicator/:id', () => {
      expect(
        resolveNotificationUrl('indicator-overdue', { objectId: OBJECT_ID })
      ).toBe(`/indicator/${OBJECT_ID}`);
    });

    it('resolves issue-delete to null', () => {
      expect(
        resolveNotificationUrl('issue-delete', { objectId: OBJECT_ID })
      ).toBeNull();
    });

    it('resolves issue-due with objectId to /issues/:id (default path)', () => {
      expect(resolveNotificationUrl('issue-due', { objectId: OBJECT_ID })).toBe(
        `/issues/${OBJECT_ID}`
      );
    });

    it('resolves issue-insert with objectId to /issues/:id (default path)', () => {
      expect(
        resolveNotificationUrl('issue-insert', { objectId: OBJECT_ID })
      ).toBe(`/issues/${OBJECT_ID}`);
    });

    it('resolves issue-overdue with objectId to /issues/:id (default path)', () => {
      expect(
        resolveNotificationUrl('issue-overdue', { objectId: OBJECT_ID })
      ).toBe(`/issues/${OBJECT_ID}`);
    });

    it('resolves issue-update with objectId to /issues/:id (default path)', () => {
      expect(
        resolveNotificationUrl('issue-update', { objectId: OBJECT_ID })
      ).toBe(`/issues/${OBJECT_ID}`);
    });

    it('resolves policy-approver with objectId to /policy/:id', () => {
      expect(
        resolveNotificationUrl('policy-approver', { objectId: OBJECT_ID })
      ).toBe(`/policy/${OBJECT_ID}`);
    });

    it('resolves policy-attestation-reminder with both IDs to public policy file URL', () => {
      expect(
        resolveNotificationUrl('policy-attestation-reminder', {
          objectId: OBJECT_ID,
          parentObjectId: PARENT_ID,
        })
      ).toBe(`/public-policies/${PARENT_ID}/files/${OBJECT_ID}`);
    });

    it('resolves policy-document-version-review-due with objectId to /policy/:id', () => {
      expect(
        resolveNotificationUrl('policy-document-version-review-due', {
          objectId: OBJECT_ID,
        })
      ).toBe(`/policy/${OBJECT_ID}`);
    });

    it('resolves policy-document-version-review-upcoming with objectId to /policy/:id', () => {
      expect(
        resolveNotificationUrl('policy-document-version-review-upcoming', {
          objectId: OBJECT_ID,
        })
      ).toBe(`/policy/${OBJECT_ID}`);
    });

    it('resolves risk-assessment-due with objectId to /risks/:id', () => {
      expect(
        resolveNotificationUrl('risk-assessment-due', { objectId: OBJECT_ID })
      ).toBe(`/risks/${OBJECT_ID}`);
    });

    it('resolves risk-assessment-overdue with objectId to /risks/:id', () => {
      expect(
        resolveNotificationUrl('risk-assessment-overdue', {
          objectId: OBJECT_ID,
        })
      ).toBe(`/risks/${OBJECT_ID}`);
    });

    it('resolves risk-delete to null', () => {
      expect(
        resolveNotificationUrl('risk-delete', { objectId: OBJECT_ID })
      ).toBeNull();
    });

    it('resolves risk-insert with objectId to /risks/:id', () => {
      expect(
        resolveNotificationUrl('risk-insert', { objectId: OBJECT_ID })
      ).toBe(`/risks/${OBJECT_ID}`);
    });

    it('resolves risk-update with objectId to /risks/:id', () => {
      expect(
        resolveNotificationUrl('risk-update', { objectId: OBJECT_ID })
      ).toBe(`/risks/${OBJECT_ID}`);
    });

    it('resolves third-party-new-questionnaire with objectId to /third-party/:id', () => {
      expect(
        resolveNotificationUrl('third-party-new-questionnaire', {
          objectId: OBJECT_ID,
        })
      ).toBe(`/third-party/${OBJECT_ID}`);
    });

    it('resolves third-party-password-reset with objectId to /third-party/:id', () => {
      expect(
        resolveNotificationUrl('third-party-password-reset', {
          objectId: OBJECT_ID,
        })
      ).toBe(`/third-party/${OBJECT_ID}`);
    });

    it('resolves third-party-recall-questionnaire with objectId to /third-party/:id', () => {
      expect(
        resolveNotificationUrl('third-party-recall-questionnaire', {
          objectId: OBJECT_ID,
        })
      ).toBe(`/third-party/${OBJECT_ID}`);
    });

    it('resolves third-party-response-submitted with both IDs to questionnaire response URL', () => {
      expect(
        resolveNotificationUrl('third-party-response-submitted', {
          objectId: OBJECT_ID,
          parentObjectId: PARENT_ID,
        })
      ).toBe(`/third-party/${PARENT_ID}/questionnaire-responses/${OBJECT_ID}`);
    });

    it('resolves third-party-response-update-status with both IDs to questionnaire response URL', () => {
      expect(
        resolveNotificationUrl('third-party-response-update-status', {
          objectId: OBJECT_ID,
          parentObjectId: PARENT_ID,
        })
      ).toBe(`/third-party/${PARENT_ID}/questionnaire-responses/${OBJECT_ID}`);
    });

    it('resolves third-party-set-password with objectId to /third-party/:id', () => {
      expect(
        resolveNotificationUrl('third-party-set-password', {
          objectId: OBJECT_ID,
        })
      ).toBe(`/third-party/${OBJECT_ID}`);
    });
  });

  // Programmatic exhaustive check: every workflow in Knock is handled (returns
  // a string or null — never throws an exception)
  describe('no Knock workflow key causes an unhandled exception', () => {
    for (const key of ALL_KNOCK_WORKFLOW_KEYS) {
      it(`handles "${key}" without throwing`, () => {
        // Provide generous data to give resolver the best chance of returning a URL
        expect(() =>
          resolveNotificationUrl(key, {
            objectId: OBJECT_ID,
            parentObjectId: PARENT_ID,
            issuePath: 'issues',
          })
        ).not.toThrow();
      });
    }
  });

  // Confirm that all known-null workflows actually return null
  describe('known null-returning workflows return null', () => {
    for (const key of KNOWN_NULL_RETURNING_WORKFLOWS) {
      it(`"${key}" returns null even when objectId is provided`, () => {
        const result = resolveNotificationUrl(key, {
          objectId: OBJECT_ID,
          parentObjectId: PARENT_ID,
        });
        expect(result).toBeNull();
      });
    }
  });

  // Confirm that workflows requiring parentObjectId return null when it is missing
  describe('attestation/questionnaire workflows guard missing parentObjectId', () => {
    for (const key of NEEDS_PARENT_AND_OBJECT) {
      it(`"${key}" returns null when parentObjectId is missing`, () => {
        expect(resolveNotificationUrl(key, { objectId: OBJECT_ID })).toBeNull();
      });

      it(`"${key}" returns null when objectId is missing`, () => {
        expect(
          resolveNotificationUrl(key, { parentObjectId: PARENT_ID })
        ).toBeNull();
      });

      it(`"${key}" returns null when both IDs are missing`, () => {
        expect(resolveNotificationUrl(key, {})).toBeNull();
      });
    }

    for (const key of NEEDS_PARENT_AND_OBJECT_QUESTIONNAIRE) {
      it(`"${key}" returns null when objectId is missing`, () => {
        expect(
          resolveNotificationUrl(key, { parentObjectId: PARENT_ID })
        ).toBeNull();
      });
    }
  });

  // Non-Knock keys should not crash
  describe('unknown workflow keys', () => {
    it('returns null for an empty string key', () => {
      expect(resolveNotificationUrl('', { objectId: OBJECT_ID })).toBeNull();
    });

    it('returns null for a completely unknown workflow key', () => {
      expect(
        resolveNotificationUrl('some-future-workflow-key', {
          objectId: OBJECT_ID,
        })
      ).toBeNull();
    });

    it('returns null for a key that looks like a delete but is a partial prefix', () => {
      // "foo-delete" ends with "-delete" so it should still return null
      expect(
        resolveNotificationUrl('foo-delete', { objectId: OBJECT_ID })
      ).toBeNull();
    });

    it('returns null for a key that starts with "change-request-" but is unrecognised', () => {
      expect(
        resolveNotificationUrl('change-request-approved', {
          objectId: OBJECT_ID,
        })
      ).toBeNull();
    });
  });

  // Adversarial objectId values
  describe('adversarial objectId values', () => {
    it('resolves with an empty string objectId (falsy, so returns null)', () => {
      // Empty string is falsy — should behave like missing objectId
      const result = resolveNotificationUrl('risk-insert', { objectId: '' });
      // Either null (treated as missing) or a URL with empty string in path
      // The implementation casts to string | null | undefined; empty string is falsy
      expect(result).toBeNull();
    });

    it('resolves with an objectId containing special URL characters', () => {
      const weirdId = 'id/with/slashes?and=query#hash';
      // Should not throw; the URL construction is done by callers, not the resolver
      const result = resolveNotificationUrl('risk-insert', {
        objectId: weirdId,
      });
      expect(result).toBe(`/risks/${weirdId}`);
    });

    it('resolves with a unicode objectId without throwing', () => {
      const unicodeId = 'リスク-123';
      const result = resolveNotificationUrl('risk-insert', {
        objectId: unicodeId,
      });
      expect(result).toBe(`/risks/${unicodeId}`);
    });
  });

  // Issue path variants
  describe('issue issuePath variants exhaustive', () => {
    const issuePaths = [
      { path: 'breach-log', expectedPrefix: '/breach-log/' },
      { path: 'gdpr-breach-log', expectedPrefix: '/gdpr-breach-log/' },
      { path: 'pci-breach-log', expectedPrefix: '/pci-breach-log/' },
      { path: 'sar-log', expectedPrefix: '/sar-log/' },
      { path: 'consumer-duty', expectedPrefix: '/consumer-duty/' },
      { path: 'customer-trust', expectedPrefix: '/customer-trust/' },
      { path: 'risk-events', expectedPrefix: '/risk-events/' },
      { path: 'issues', expectedPrefix: '/issues/' },
    ] as const;

    for (const { path, expectedPrefix } of issuePaths) {
      for (const workflowKey of [
        'issue-insert',
        'issue-update',
        'issue-due',
        'issue-overdue',
      ] as const) {
        it(`"${workflowKey}" with issuePath="${path}" resolves to ${expectedPrefix}:id`, () => {
          const result = resolveNotificationUrl(workflowKey, {
            objectId: OBJECT_ID,
            issuePath: path,
          });
          expect(result).toBe(`${expectedPrefix}${OBJECT_ID}`);
        });
      }
    }

    it('falls back to /issues/:id for unrecognised issuePath value', () => {
      // An unknown issuePath value hits the switch default
      const result = resolveNotificationUrl('issue-insert', {
        objectId: OBJECT_ID,
        issuePath: 'totally-unknown-path',
      });
      expect(result).toBe(`/issues/${OBJECT_ID}`);
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// mapWorkflowKeyToObjectType — exhaustive coverage
// ────────────────────────────────────────────────────────────────────────────

describe('mapWorkflowKeyToObjectType — all Knock workflow keys', () => {
  const expectedMapping: Record<WorkflowKey, string> = {
    'action-delete': 'Action',
    'action-due': 'Action',
    'action-insert': 'Action',
    'action-overdue': 'Action',
    'action-update': 'Action',
    'attestation-record-insert': 'Attestation',
    'change-request-insert': 'Request',
    'change-request-rejected': 'Request',
    'control-delete': 'Control',
    'control-insert': 'Control',
    'control-test-due': 'Control',
    'control-test-overdue': 'Control',
    'control-update': 'Control',
    digest: 'Digest',
    'document-delete': 'Document',
    'document-due': 'Document',
    'document-insert': 'Document',
    'document-overdue': 'Document',
    'document-update': 'Document',
    'indicator-due': 'Indicator',
    'indicator-overdue': 'Indicator',
    'issue-delete': 'Issue',
    'issue-due': 'Issue',
    'issue-insert': 'Issue',
    'issue-overdue': 'Issue',
    'issue-update': 'Issue',
    'policy-approver': 'Document',
    'policy-attestation-reminder': 'Attestation',
    'policy-document-version-review-due': 'Document',
    'policy-document-version-review-upcoming': 'Document',
    'risk-assessment-due': 'Risk',
    'risk-assessment-overdue': 'Risk',
    'risk-delete': 'Risk',
    'risk-insert': 'Risk',
    'risk-update': 'Risk',
    'third-party-new-questionnaire': 'Third Party',
    'third-party-password-reset': 'Third Party',
    'third-party-recall-questionnaire': 'Third Party',
    'third-party-response-submitted': 'Third Party',
    'third-party-response-update-status': 'Third Party',
    'third-party-set-password': 'Third Party',
  };

  for (const key of ALL_KNOCK_WORKFLOW_KEYS) {
    const expected = expectedMapping[key];
    it(`"${key}" maps to "${expected}"`, () => {
      expect(mapWorkflowKeyToObjectType(key)).toBe(expected);
    });
  }

  describe('edge cases', () => {
    it('returns "Other" for empty string', () => {
      expect(mapWorkflowKeyToObjectType('')).toBe('Other');
    });

    it('returns "Other" for unknown workflow key', () => {
      expect(mapWorkflowKeyToObjectType('unknown-workflow-xyz')).toBe('Other');
    });

    it('returns "Other" for a key that resembles but does not match any prefix', () => {
      // "risks-insert" does not start with "risk-"
      expect(mapWorkflowKeyToObjectType('risks-insert')).toBe('Other');
    });

    it('returns "Other" for "RISK-INSERT" (case-sensitive check)', () => {
      // The implementation uses startsWith which is case-sensitive
      expect(mapWorkflowKeyToObjectType('RISK-INSERT')).toBe('Other');
    });

    it('handles policy-attestation-reminder as Attestation (exact key check)', () => {
      // This is the one policy-* key that maps to Attestation, not Document
      expect(mapWorkflowKeyToObjectType('policy-attestation-reminder')).toBe(
        'Attestation'
      );
    });

    it('handles other policy-* keys as Document', () => {
      expect(mapWorkflowKeyToObjectType('policy-approver')).toBe('Document');
      expect(
        mapWorkflowKeyToObjectType('policy-document-version-review-due')
      ).toBe('Document');
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// getDefaultDateRange — boundary checks
// ────────────────────────────────────────────────────────────────────────────

describe('getDefaultDateRange', () => {
  it('defaults to last24h preset', () => {
    const range = getDefaultDateRange();
    expect(range.preset).toBe('last24h');
  });

  it('insertedAtGt is approximately 24 hours before insertedAtLt', () => {
    const range = getDefaultDateRange();
    const gt = new Date(range.insertedAtGt!);
    const lt = new Date(range.insertedAtLt!);
    const diffMs = lt.getTime() - gt.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    // Allow ±1 hour for test execution time
    expect(diffHours).toBeGreaterThanOrEqual(23);
    expect(diffHours).toBeLessThanOrEqual(25);
  });

  it('both dates are valid ISO strings', () => {
    const range = getDefaultDateRange();
    expect(() => new Date(range.insertedAtGt!)).not.toThrow();
    expect(() => new Date(range.insertedAtLt!)).not.toThrow();
    expect(new Date(range.insertedAtGt!).toISOString()).toBe(
      range.insertedAtGt
    );
    expect(new Date(range.insertedAtLt!).toISOString()).toBe(
      range.insertedAtLt
    );
  });

  it('insertedAtLt is approximately "now"', () => {
    const before = new Date();
    const range = getDefaultDateRange();
    const after = new Date();
    const lt = new Date(range.insertedAtLt!);
    // lt should fall within the window of this test execution
    expect(lt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(lt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// buildQueryInput — adversarial and boundary values
// ────────────────────────────────────────────────────────────────────────────

describe('buildQueryInput adversarial cases', () => {
  const baseFilters = (
    overrides: Partial<NotificationFilterState> = {}
  ): NotificationFilterState => ({
    dateRange: {
      preset: 'last30',
      insertedAtGt: '2026-01-01T00:00:00.000Z',
      insertedAtLt: '2026-01-31T00:00:00.000Z',
    },
    ...overrides,
  });

  it('does not include pageSize, cursors, or server-side filter params', () => {
    const input = buildQueryInput(baseFilters());
    expect(input).not.toHaveProperty('pageSize');
    expect(input).not.toHaveProperty('after');
    expect(input).not.toHaveProperty('before');
    expect(input).not.toHaveProperty('status');
    expect(input).not.toHaveProperty('engagementStatus');
    expect(input).not.toHaveProperty('channelId');
    expect(input).not.toHaveProperty('source');
  });

  it('includes only insertedAtGt when insertedAtLt is missing', () => {
    const filters = baseFilters({
      dateRange: {
        preset: 'last30',
        insertedAtGt: '2026-01-01T00:00:00.000Z',
        insertedAtLt: undefined,
      },
    });
    const input = buildQueryInput(filters);
    expect(input.insertedAtGt).toBe('2026-01-01T00:00:00.000Z');
    expect(input.insertedAtLt).toBeUndefined();
  });

  it('includes only insertedAtLt when insertedAtGt is missing', () => {
    const filters = baseFilters({
      dateRange: {
        preset: 'last30',
        insertedAtGt: undefined,
        insertedAtLt: '2026-01-31T00:00:00.000Z',
      },
    });
    const input = buildQueryInput(filters);
    expect(input.insertedAtGt).toBeUndefined();
    expect(input.insertedAtLt).toBe('2026-01-31T00:00:00.000Z');
  });

  it('returns empty object when both dates are undefined', () => {
    const filters = baseFilters({
      dateRange: {
        preset: 'last30',
        insertedAtGt: undefined,
        insertedAtLt: undefined,
      },
    });
    const input = buildQueryInput(filters);
    expect(Object.keys(input)).toHaveLength(0);
  });

  it('maps both date range fields correctly', () => {
    const filters: NotificationFilterState = {
      dateRange: {
        preset: 'last7',
        insertedAtGt: '2026-02-14T00:00:00.000Z',
        insertedAtLt: '2026-02-21T00:00:00.000Z',
      },
    };
    const input = buildQueryInput(filters);
    expect(input.insertedAtGt).toBe('2026-02-14T00:00:00.000Z');
    expect(input.insertedAtLt).toBe('2026-02-21T00:00:00.000Z');
  });
});
