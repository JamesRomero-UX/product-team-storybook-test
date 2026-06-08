import { mapWorkflowKeyToObjectType } from './utils';

describe('mapWorkflowKeyToObjectType', () => {
  describe('prefix mapping without translation function', () => {
    it('maps risk- prefix to Risk', () => {
      expect(mapWorkflowKeyToObjectType('risk-insert')).toBe('Risk');
      expect(mapWorkflowKeyToObjectType('risk-update')).toBe('Risk');
      expect(mapWorkflowKeyToObjectType('risk-delete')).toBe('Risk');
      expect(mapWorkflowKeyToObjectType('risk-assessment-due')).toBe('Risk');
    });

    it('maps action- prefix to Action', () => {
      expect(mapWorkflowKeyToObjectType('action-insert')).toBe('Action');
      expect(mapWorkflowKeyToObjectType('action-due')).toBe('Action');
      expect(mapWorkflowKeyToObjectType('action-overdue')).toBe('Action');
    });

    it('maps control- prefix to Control', () => {
      expect(mapWorkflowKeyToObjectType('control-insert')).toBe('Control');
      expect(mapWorkflowKeyToObjectType('control-test-due')).toBe('Control');
    });

    it('maps document- prefix to Document', () => {
      expect(mapWorkflowKeyToObjectType('document-insert')).toBe('Document');
      expect(mapWorkflowKeyToObjectType('document-due')).toBe('Document');
    });

    it('maps policy- prefix to Document', () => {
      expect(mapWorkflowKeyToObjectType('policy-approver')).toBe('Document');
      expect(
        mapWorkflowKeyToObjectType('policy-document-version-review-due')
      ).toBe('Document');
    });

    it('maps issue- prefix to Issue', () => {
      expect(mapWorkflowKeyToObjectType('issue-insert')).toBe('Issue');
      expect(mapWorkflowKeyToObjectType('issue-overdue')).toBe('Issue');
    });

    it('maps indicator- prefix to Indicator', () => {
      expect(mapWorkflowKeyToObjectType('indicator-due')).toBe('Indicator');
      expect(mapWorkflowKeyToObjectType('indicator-overdue')).toBe('Indicator');
    });

    it('maps third-party- prefix to Third Party', () => {
      expect(mapWorkflowKeyToObjectType('third-party-new-questionnaire')).toBe(
        'Third Party'
      );
      expect(mapWorkflowKeyToObjectType('third-party-password-reset')).toBe(
        'Third Party'
      );
    });

    it('maps change-request- prefix to Request', () => {
      expect(mapWorkflowKeyToObjectType('change-request-insert')).toBe(
        'Request'
      );
      expect(mapWorkflowKeyToObjectType('change-request-rejected')).toBe(
        'Request'
      );
    });

    it('maps attestation- prefix to Attestation', () => {
      expect(mapWorkflowKeyToObjectType('attestation-record-insert')).toBe(
        'Attestation'
      );
    });
  });

  describe('special cases', () => {
    it('maps policy-attestation-reminder to Attestation (not Document)', () => {
      expect(mapWorkflowKeyToObjectType('policy-attestation-reminder')).toBe(
        'Attestation'
      );
    });

    it('maps digest to Digest', () => {
      expect(mapWorkflowKeyToObjectType('digest')).toBe('Digest');
    });

    it('returns Other for unknown workflow key', () => {
      expect(mapWorkflowKeyToObjectType('unknown-workflow')).toBe('Other');
    });

    it('returns Other for empty string', () => {
      expect(mapWorkflowKeyToObjectType('')).toBe('Other');
    });

    it('is case-sensitive (RISK-INSERT returns Other)', () => {
      expect(mapWorkflowKeyToObjectType('RISK-INSERT')).toBe('Other');
    });
  });

  describe('with translation function', () => {
    const mockT = (key: string): string => {
      const translations: Record<string, string> = {
        risk: 'risk',
        action: 'action',
        control: 'control',
        document: 'document',
        issue: 'issue',
        indicator: 'indicator',
        third_party: 'third party',
        request: 'request',
        attestation: 'attestation',
      };

      return translations[key] ?? key;
    };

    it('capitalises the translated label', () => {
      expect(mapWorkflowKeyToObjectType('risk-insert', mockT)).toBe('Risk');
      expect(mapWorkflowKeyToObjectType('action-due', mockT)).toBe('Action');
      expect(
        mapWorkflowKeyToObjectType('third-party-set-password', mockT)
      ).toBe('Third party');
    });

    it('still returns Digest for digest key even with translation fn', () => {
      expect(mapWorkflowKeyToObjectType('digest', mockT)).toBe('Digest');
    });

    it('still returns Other for unknown key even with translation fn', () => {
      expect(mapWorkflowKeyToObjectType('unknown', mockT)).toBe('Other');
    });
  });
});
