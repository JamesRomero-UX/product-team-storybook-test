import { describe, expect, it } from 'vitest';

import { resolveNotificationUrl } from './notificationUrlResolver';

describe('resolveNotificationUrl', () => {
  const objectId = 'test-object-id';
  const parentObjectId = 'test-parent-id';

  describe('risk workflows', () => {
    it('resolves risk-insert to risk details URL', () => {
      expect(resolveNotificationUrl('risk-insert', { objectId })).toBe(
        `/risks/${objectId}`
      );
    });

    it('resolves risk-update to risk details URL', () => {
      expect(resolveNotificationUrl('risk-update', { objectId })).toBe(
        `/risks/${objectId}`
      );
    });

    it('resolves risk-delete to null', () => {
      expect(resolveNotificationUrl('risk-delete', { objectId })).toBeNull();
    });

    it('resolves risk-assessment-due to risk details URL', () => {
      expect(resolveNotificationUrl('risk-assessment-due', { objectId })).toBe(
        `/risks/${objectId}`
      );
    });

    it('resolves risk-assessment-overdue to risk details URL', () => {
      expect(
        resolveNotificationUrl('risk-assessment-overdue', { objectId })
      ).toBe(`/risks/${objectId}`);
    });
  });

  describe('action workflows', () => {
    it('resolves action-insert to action details URL', () => {
      expect(resolveNotificationUrl('action-insert', { objectId })).toBe(
        `/actions/${objectId}`
      );
    });

    it('resolves action-update to action details URL', () => {
      expect(resolveNotificationUrl('action-update', { objectId })).toBe(
        `/actions/${objectId}`
      );
    });

    it('resolves action-due to action details URL', () => {
      expect(resolveNotificationUrl('action-due', { objectId })).toBe(
        `/actions/${objectId}`
      );
    });

    it('resolves action-overdue to action details URL', () => {
      expect(resolveNotificationUrl('action-overdue', { objectId })).toBe(
        `/actions/${objectId}`
      );
    });

    it('resolves action-delete to null', () => {
      expect(resolveNotificationUrl('action-delete', { objectId })).toBeNull();
    });
  });

  describe('control workflows', () => {
    it('resolves control-insert to control details URL', () => {
      expect(resolveNotificationUrl('control-insert', { objectId })).toBe(
        `/controls/${objectId}`
      );
    });

    it('resolves control-update to control details URL', () => {
      expect(resolveNotificationUrl('control-update', { objectId })).toBe(
        `/controls/${objectId}`
      );
    });

    it('resolves control-delete to null', () => {
      expect(resolveNotificationUrl('control-delete', { objectId })).toBeNull();
    });

    it('resolves control-test-due to control details URL', () => {
      expect(resolveNotificationUrl('control-test-due', { objectId })).toBe(
        `/controls/${objectId}`
      );
    });

    it('resolves control-test-overdue to control details URL', () => {
      expect(resolveNotificationUrl('control-test-overdue', { objectId })).toBe(
        `/controls/${objectId}`
      );
    });
  });

  describe('document workflows', () => {
    it('resolves document-insert to policy details URL', () => {
      expect(resolveNotificationUrl('document-insert', { objectId })).toBe(
        `/policy/${objectId}`
      );
    });

    it('resolves document-update to policy details URL', () => {
      expect(resolveNotificationUrl('document-update', { objectId })).toBe(
        `/policy/${objectId}`
      );
    });

    it('resolves document-due to policy details URL', () => {
      expect(resolveNotificationUrl('document-due', { objectId })).toBe(
        `/policy/${objectId}`
      );
    });

    it('resolves document-overdue to policy details URL', () => {
      expect(resolveNotificationUrl('document-overdue', { objectId })).toBe(
        `/policy/${objectId}`
      );
    });

    it('resolves document-delete to null', () => {
      expect(
        resolveNotificationUrl('document-delete', { objectId })
      ).toBeNull();
    });
  });

  describe('issue workflows', () => {
    it('resolves issue-insert with default issuePath to issue details URL', () => {
      expect(resolveNotificationUrl('issue-insert', { objectId })).toBe(
        `/issues/${objectId}`
      );
    });

    it('resolves issue-update to issue details URL', () => {
      expect(resolveNotificationUrl('issue-update', { objectId })).toBe(
        `/issues/${objectId}`
      );
    });

    it('resolves issue-due to issue details URL', () => {
      expect(resolveNotificationUrl('issue-due', { objectId })).toBe(
        `/issues/${objectId}`
      );
    });

    it('resolves issue-overdue to issue details URL', () => {
      expect(resolveNotificationUrl('issue-overdue', { objectId })).toBe(
        `/issues/${objectId}`
      );
    });

    it('resolves issue-delete to null', () => {
      expect(resolveNotificationUrl('issue-delete', { objectId })).toBeNull();
    });

    it('resolves issue-insert with issuePath=breach-log', () => {
      expect(
        resolveNotificationUrl('issue-insert', {
          objectId,
          issuePath: 'breach-log',
        })
      ).toBe(`/breach-log/${objectId}`);
    });

    it('resolves issue-update with issuePath=gdpr-breach-log', () => {
      expect(
        resolveNotificationUrl('issue-update', {
          objectId,
          issuePath: 'gdpr-breach-log',
        })
      ).toBe(`/gdpr-breach-log/${objectId}`);
    });

    it('resolves issue-due with issuePath=pci-breach-log', () => {
      expect(
        resolveNotificationUrl('issue-due', {
          objectId,
          issuePath: 'pci-breach-log',
        })
      ).toBe(`/pci-breach-log/${objectId}`);
    });

    it('resolves issue-overdue with issuePath=sar-log', () => {
      expect(
        resolveNotificationUrl('issue-overdue', {
          objectId,
          issuePath: 'sar-log',
        })
      ).toBe(`/sar-log/${objectId}`);
    });

    it('resolves issue-insert with issuePath=consumer-duty', () => {
      expect(
        resolveNotificationUrl('issue-insert', {
          objectId,
          issuePath: 'consumer-duty',
        })
      ).toBe(`/consumer-duty/${objectId}`);
    });

    it('resolves issue-update with issuePath=customer-trust', () => {
      expect(
        resolveNotificationUrl('issue-update', {
          objectId,
          issuePath: 'customer-trust',
        })
      ).toBe(`/customer-trust/${objectId}`);
    });

    it('resolves issue-due with issuePath=risk-events', () => {
      expect(
        resolveNotificationUrl('issue-due', {
          objectId,
          issuePath: 'risk-events',
        })
      ).toBe(`/risk-events/${objectId}`);
    });

    it('resolves issue-insert with issuePath=issues', () => {
      expect(
        resolveNotificationUrl('issue-insert', {
          objectId,
          issuePath: 'issues',
        })
      ).toBe(`/issues/${objectId}`);
    });
  });

  describe('indicator workflows', () => {
    it('resolves indicator-due to indicator details URL', () => {
      expect(resolveNotificationUrl('indicator-due', { objectId })).toBe(
        `/indicator/${objectId}`
      );
    });

    it('resolves indicator-overdue to indicator details URL', () => {
      expect(resolveNotificationUrl('indicator-overdue', { objectId })).toBe(
        `/indicator/${objectId}`
      );
    });

    it('returns null for indicator-overdue when objectId is missing', () => {
      expect(resolveNotificationUrl('indicator-overdue', {})).toBeNull();
    });
  });

  describe('policy workflows', () => {
    it('resolves policy-approver to policy details URL', () => {
      expect(resolveNotificationUrl('policy-approver', { objectId })).toBe(
        `/policy/${objectId}`
      );
    });

    it('resolves policy-document-version-review-due to policy details URL', () => {
      expect(
        resolveNotificationUrl('policy-document-version-review-due', {
          objectId,
        })
      ).toBe(`/policy/${objectId}`);
    });

    it('resolves policy-document-version-review-upcoming to policy details URL', () => {
      expect(
        resolveNotificationUrl('policy-document-version-review-upcoming', {
          objectId,
        })
      ).toBe(`/policy/${objectId}`);
    });
  });

  describe('attestation workflows', () => {
    it('resolves policy-attestation-reminder to public policy file URL', () => {
      expect(
        resolveNotificationUrl('policy-attestation-reminder', {
          objectId,
          parentObjectId,
        })
      ).toBe(`/public-policies/${parentObjectId}/files/${objectId}`);
    });

    it('resolves attestation-record-insert to public policy file URL', () => {
      expect(
        resolveNotificationUrl('attestation-record-insert', {
          objectId,
          parentObjectId,
        })
      ).toBe(`/public-policies/${parentObjectId}/files/${objectId}`);
    });

    it('returns null for policy-attestation-reminder when objectId is missing', () => {
      expect(
        resolveNotificationUrl('policy-attestation-reminder', {
          parentObjectId,
        })
      ).toBeNull();
    });

    it('returns null for policy-attestation-reminder when parentObjectId is missing', () => {
      expect(
        resolveNotificationUrl('policy-attestation-reminder', { objectId })
      ).toBeNull();
    });

    it('returns null for attestation-record-insert when objectId is missing', () => {
      expect(
        resolveNotificationUrl('attestation-record-insert', {
          parentObjectId,
        })
      ).toBeNull();
    });

    it('returns null for attestation-record-insert when parentObjectId is missing', () => {
      expect(
        resolveNotificationUrl('attestation-record-insert', { objectId })
      ).toBeNull();
    });
  });

  describe('change request workflows', () => {
    it('resolves change-request-insert to null', () => {
      expect(
        resolveNotificationUrl('change-request-insert', { objectId })
      ).toBeNull();
    });

    it('resolves change-request-rejected to null', () => {
      expect(
        resolveNotificationUrl('change-request-rejected', { objectId })
      ).toBeNull();
    });
  });

  describe('third-party workflows', () => {
    it('resolves third-party-response-submitted to questionnaire response URL', () => {
      expect(
        resolveNotificationUrl('third-party-response-submitted', {
          objectId,
          parentObjectId,
        })
      ).toBe(
        `/third-party/${parentObjectId}/questionnaire-responses/${objectId}`
      );
    });

    it('resolves third-party-response-update-status to questionnaire response URL', () => {
      expect(
        resolveNotificationUrl('third-party-response-update-status', {
          objectId,
          parentObjectId,
        })
      ).toBe(
        `/third-party/${parentObjectId}/questionnaire-responses/${objectId}`
      );
    });

    it('resolves third-party-new-questionnaire to third-party details URL', () => {
      expect(
        resolveNotificationUrl('third-party-new-questionnaire', { objectId })
      ).toBe(`/third-party/${objectId}`);
    });

    it('resolves third-party-set-password to third-party details URL', () => {
      expect(
        resolveNotificationUrl('third-party-set-password', { objectId })
      ).toBe(`/third-party/${objectId}`);
    });

    it('resolves third-party-password-reset to third-party details URL', () => {
      expect(
        resolveNotificationUrl('third-party-password-reset', { objectId })
      ).toBe(`/third-party/${objectId}`);
    });

    it('resolves third-party-recall-questionnaire to third-party details URL', () => {
      expect(
        resolveNotificationUrl('third-party-recall-questionnaire', {
          objectId,
        })
      ).toBe(`/third-party/${objectId}`);
    });

    it('returns null for third-party-response-submitted when objectId is missing', () => {
      expect(
        resolveNotificationUrl('third-party-response-submitted', {
          parentObjectId,
        })
      ).toBeNull();
    });

    it('returns null for third-party-response-update-status when objectId is missing', () => {
      expect(
        resolveNotificationUrl('third-party-response-update-status', {
          parentObjectId,
        })
      ).toBeNull();
    });
  });

  describe('digest workflow', () => {
    it('resolves digest to null', () => {
      expect(resolveNotificationUrl('digest', {})).toBeNull();
    });
  });

  describe('missing objectId', () => {
    it('returns null when objectId is undefined', () => {
      expect(resolveNotificationUrl('risk-insert', {})).toBeNull();
    });

    it('returns null when objectId is missing from data', () => {
      expect(
        resolveNotificationUrl('action-update', { someOtherField: 'value' })
      ).toBeNull();
    });

    it('returns null for issue workflow when objectId is missing', () => {
      expect(
        resolveNotificationUrl('issue-insert', { issuePath: 'breach-log' })
      ).toBeNull();
    });

    it('returns null for indicator workflow when objectId is missing', () => {
      expect(resolveNotificationUrl('indicator-due', {})).toBeNull();
    });
  });

  describe('unknown workflow keys', () => {
    it('returns null for unknown workflow key', () => {
      expect(
        resolveNotificationUrl('unknown-workflow', { objectId })
      ).toBeNull();
    });

    it('returns null for empty workflow key', () => {
      expect(resolveNotificationUrl('', { objectId })).toBeNull();
    });
  });
});
