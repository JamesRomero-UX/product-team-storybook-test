import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IssueAssessmentResponse as ClientIssueAssessmentResponse } from '../../clients/client.interface';
import { transformIssueAssessmentItem } from './issue-assessment.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  idToResourceReference: vi.fn(),
}));

describe('issue-assessment.transformer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up default mock implementations
    const { idToResourceReference } = await import('../../utils/transforms');

    vi.mocked(idToResourceReference).mockImplementation(
      (id, type, hrefPrefix) => ({
        id,
        type,
        href: `${hrefPrefix}/${id}`,
      })
    );
  });

  const baseMockIssueAssessment = {
    Id: '123e4567-e89b-12d3-a456-426614174000',
    ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
    IssueType: 'breach',
    Severity: 3,
    TargetCloseDate: '2024-12-31T00:00:00.000Z',
    ActualCloseDate: '2024-06-15T00:00:00.000Z',
    Status: 'closed',
    CertifiedIndividual: 'provider|user123',
    RegulatoryBreach: true,
    RegulationsBreached: 'GDPR Article 5',
    Reportable: true,
    Rationale: 'Data processing violation',
    IssueCausedByThirdParty: false,
    ThirdPartyResponsible: null,
    IssueCausedBySystemIssue: true,
    SystemResponsible: 'CRM System',
    PolicyBreach: true,
    PoliciesBreached: 'Data Protection Policy',
    PolicyOwner: 'provider|user456',
    PolicyOwnerCommentary: 'Needs immediate review',
    CreatedByUser: 'provider|user789',
    CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
    ModifiedByUser: 'provider|user999',
    ModifiedAtTimestamp: '2024-01-15T00:00:00.000Z',
    Meta: null,
    CustomAttributeData: null,
    Type: 'issue_assessment',
    certifiedIndividual: null,
    policyOwner: null,
    departments: [],
  } as NonNullable<ClientIssueAssessmentResponse>['issueAssessment'];

  describe('transformIssueAssessmentItem', () => {
    describe('happy path', () => {
      it('should transform a valid issue assessment with all fields populated', () => {
        const result = transformIssueAssessmentItem(baseMockIssueAssessment, {
          basePath: '/api/v1',
        });

        expect(result).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000',
          parentIssueId: '456e4567-e89b-12d3-a456-426614174001',
          issueType: 'breach',
          severity: 3,
          targetCloseDate: '2024-12-31T00:00:00.000Z',
          actualCloseDate: '2024-06-15T00:00:00.000Z',
          status: 'closed',
          certifiedIndividual: 'provider|user123',
          regulatoryBreach: true,
          regulationsBreached: 'GDPR Article 5',
          reportable: true,
          rationale: 'Data processing violation',
          issueCausedByThirdParty: false,
          thirdPartyResponsible: null,
          issueCausedBySystemIssue: true,
          systemResponsible: 'CRM System',
          policyBreach: true,
          policiesBreached: 'Data Protection Policy',
          policyOwner: 'provider|user456',
          policyOwnerCommentary: 'Needs immediate review',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z',
          createdBy: 'provider|user789',
          updatedBy: 'provider|user999',
          links: {
            self: {
              href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001/assessment',
            },
            createdBy: {
              id: 'provider|user789',
              type: 'user',
              href: '/api/v1/users/provider|user789',
            },
            updatedBy: {
              id: 'provider|user999',
              type: 'user',
              href: '/api/v1/users/provider|user999',
            },
            certifiedIndividual: {
              id: 'provider|user123',
              type: 'user',
              href: '/api/v1/users/provider|user123',
            },
            policyOwner: {
              id: 'provider|user456',
              type: 'user',
              href: '/api/v1/users/provider|user456',
            },
            parents: [
              {
                id: '456e4567-e89b-12d3-a456-426614174001',
                type: 'issue',
                href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001',
              },
            ],
          },
        });
      });

      it('should handle issue assessment with different base path', () => {
        const result = transformIssueAssessmentItem(baseMockIssueAssessment, {
          basePath: '/api/v2',
        });

        expect(result.links.self.href).toBe(
          '/api/v2/issues/456e4567-e89b-12d3-a456-426614174001/assessment'
        );
        expect(result.links.createdBy?.href).toBe(
          '/api/v2/users/provider|user789'
        );
        expect(result.links.parents[0]?.href).toBe(
          '/api/v2/issues/456e4567-e89b-12d3-a456-426614174001'
        );
      });
    });

    describe('null and optional field handling', () => {
      it('should handle null CertifiedIndividual', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          CertifiedIndividual: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.certifiedIndividual).toBeNull();
        expect(result.links.certifiedIndividual).toBeNull();
      });

      it('should handle null PolicyOwner', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          PolicyOwner: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.policyOwner).toBeNull();
        expect(result.links.policyOwner).toBeNull();
      });

      it('should handle null IssueType', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          IssueType: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.issueType).toBeNull();
      });

      it('should handle null Severity', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          Severity: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.severity).toBeNull();
      });

      it('should handle null TargetCloseDate', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          TargetCloseDate: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.targetCloseDate).toBeNull();
      });

      it('should handle null ActualCloseDate', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          ActualCloseDate: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.actualCloseDate).toBeNull();
      });

      it('should handle null Status', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          Status: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.status).toBeNull();
      });

      it('should handle null RegulatoryBreach', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          RegulatoryBreach: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.regulatoryBreach).toBeNull();
      });

      it('should handle null RegulationsBreached', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          RegulationsBreached: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.regulationsBreached).toBeNull();
      });

      it('should handle null Reportable', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          Reportable: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.reportable).toBeNull();
      });

      it('should handle null Rationale', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          Rationale: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.rationale).toBeNull();
      });

      it('should handle null IssueCausedByThirdParty', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          IssueCausedByThirdParty: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.issueCausedByThirdParty).toBeNull();
      });

      it('should handle null ThirdPartyResponsible', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          ThirdPartyResponsible: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.thirdPartyResponsible).toBeNull();
      });

      it('should handle null IssueCausedBySystemIssue', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          IssueCausedBySystemIssue: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.issueCausedBySystemIssue).toBeNull();
      });

      it('should handle null SystemResponsible', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          SystemResponsible: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.systemResponsible).toBeNull();
      });

      it('should handle null PolicyBreach', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          PolicyBreach: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.policyBreach).toBeNull();
      });

      it('should handle null PoliciesBreached', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          PoliciesBreached: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.policiesBreached).toBeNull();
      });

      it('should handle null PolicyOwnerCommentary', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          PolicyOwnerCommentary: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.policyOwnerCommentary).toBeNull();
      });

      it('should handle all nullable fields being null', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          IssueType: null,
          Severity: null,
          TargetCloseDate: null,
          ActualCloseDate: null,
          Status: null,
          CertifiedIndividual: null,
          RegulatoryBreach: null,
          RegulationsBreached: null,
          Reportable: null,
          Rationale: null,
          IssueCausedByThirdParty: null,
          ThirdPartyResponsible: null,
          IssueCausedBySystemIssue: null,
          SystemResponsible: null,
          PolicyBreach: null,
          PoliciesBreached: null,
          PolicyOwner: null,
          PolicyOwnerCommentary: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.issueType).toBeNull();
        expect(result.severity).toBeNull();
        expect(result.targetCloseDate).toBeNull();
        expect(result.actualCloseDate).toBeNull();
        expect(result.status).toBeNull();
        expect(result.certifiedIndividual).toBeNull();
        expect(result.regulatoryBreach).toBeNull();
        expect(result.regulationsBreached).toBeNull();
        expect(result.reportable).toBeNull();
        expect(result.rationale).toBeNull();
        expect(result.issueCausedByThirdParty).toBeNull();
        expect(result.thirdPartyResponsible).toBeNull();
        expect(result.issueCausedBySystemIssue).toBeNull();
        expect(result.systemResponsible).toBeNull();
        expect(result.policyBreach).toBeNull();
        expect(result.policiesBreached).toBeNull();
        expect(result.policyOwner).toBeNull();
        expect(result.policyOwnerCommentary).toBeNull();
        expect(result.links.certifiedIndividual).toBeNull();
        expect(result.links.policyOwner).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should handle different parent issue IDs', () => {
        const differentParentId = '999e4567-e89b-12d3-a456-426614174999';
        const mockAssessment = {
          ...baseMockIssueAssessment,
          ParentIssueId: differentParentId,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.parentIssueId).toBe(differentParentId);
        expect(result.links.self.href).toBe(
          `/api/v1/issues/${differentParentId}/assessment`
        );
        expect(result.links.parents[0]?.id).toBe(differentParentId);
        expect(result.links.parents[0]?.href).toBe(
          `/api/v1/issues/${differentParentId}`
        );
      });

      it('should handle third-party caused issues', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          IssueCausedByThirdParty: true,
          ThirdPartyResponsible: 'External Vendor Inc.',
          IssueCausedBySystemIssue: false,
          SystemResponsible: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.issueCausedByThirdParty).toBe(true);
        expect(result.thirdPartyResponsible).toBe('External Vendor Inc.');
        expect(result.issueCausedBySystemIssue).toBe(false);
        expect(result.systemResponsible).toBeNull();
      });

      it('should handle non-reportable, non-breach assessment', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          RegulatoryBreach: false,
          RegulationsBreached: null,
          Reportable: false,
          PolicyBreach: false,
          PoliciesBreached: null,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.regulatoryBreach).toBe(false);
        expect(result.regulationsBreached).toBeNull();
        expect(result.reportable).toBe(false);
        expect(result.policyBreach).toBe(false);
        expect(result.policiesBreached).toBeNull();
      });

      it('should handle severity levels correctly', () => {
        const severityLevels = [1, 2, 3, 4, 5];

        severityLevels.forEach((severity) => {
          const mockAssessment = {
            ...baseMockIssueAssessment,
            Severity: severity,
          };

          const result = transformIssueAssessmentItem(mockAssessment, {
            basePath: '/api/v1',
          });

          expect(result.severity).toBe(severity);
        });
      });

      it('should handle issue with both CreatedByUser and ModifiedByUser being the same', () => {
        const sameUser = 'provider|sameuser123';
        const mockAssessment = {
          ...baseMockIssueAssessment,
          CreatedByUser: sameUser,
          ModifiedByUser: sameUser,
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.createdBy).toBe(sameUser);
        expect(result.updatedBy).toBe(sameUser);
        expect(result.links.createdBy?.id).toBe(sameUser);
        expect(result.links.updatedBy?.id).toBe(sameUser);
      });

      it('should handle issue assessment with empty string fields treated as null', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          IssueType: '',
          RegulationsBreached: '',
          Rationale: '',
          ThirdPartyResponsible: '',
          SystemResponsible: '',
          PoliciesBreached: '',
          PolicyOwnerCommentary: '',
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        // Empty strings should be preserved (schema handles validation)
        expect(result.issueType).toBe('');
        expect(result.regulationsBreached).toBe('');
        expect(result.rationale).toBe('');
        expect(result.thirdPartyResponsible).toBe('');
        expect(result.systemResponsible).toBe('');
        expect(result.policiesBreached).toBe('');
        expect(result.policyOwnerCommentary).toBe('');
      });
    });

    describe('link generation', () => {
      it('should generate correct self link', () => {
        const result = transformIssueAssessmentItem(baseMockIssueAssessment, {
          basePath: '/api/v1',
        });

        expect(result.links.self).toEqual({
          href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001/assessment',
        });
      });

      it('should generate correct parent issue link', () => {
        const result = transformIssueAssessmentItem(baseMockIssueAssessment, {
          basePath: '/api/v1',
        });

        expect(result.links.parents).toHaveLength(1);
        expect(result.links.parents[0]).toEqual({
          id: '456e4567-e89b-12d3-a456-426614174001',
          type: 'issue',
          href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001',
        });
      });

      it('should generate correct user links for all user references', () => {
        const result = transformIssueAssessmentItem(baseMockIssueAssessment, {
          basePath: '/api/v1',
        });

        expect(result.links.createdBy).toEqual({
          id: 'provider|user789',
          type: 'user',
          href: '/api/v1/users/provider|user789',
        });

        expect(result.links.updatedBy).toEqual({
          id: 'provider|user999',
          type: 'user',
          href: '/api/v1/users/provider|user999',
        });

        expect(result.links.certifiedIndividual).toEqual({
          id: 'provider|user123',
          type: 'user',
          href: '/api/v1/users/provider|user123',
        });

        expect(result.links.policyOwner).toEqual({
          id: 'provider|user456',
          type: 'user',
          href: '/api/v1/users/provider|user456',
        });
      });
    });

    describe('timestamp handling', () => {
      it('should preserve timestamp formats', () => {
        const mockAssessment = {
          ...baseMockIssueAssessment,
          CreatedAtTimestamp: '2024-03-15T10:30:00.123Z',
          ModifiedAtTimestamp: '2024-03-20T14:45:30.456Z',
          TargetCloseDate: '2024-12-31T23:59:59.999Z',
          ActualCloseDate: '2024-06-15T08:15:00.000Z',
        };

        const result = transformIssueAssessmentItem(mockAssessment, {
          basePath: '/api/v1',
        });

        expect(result.createdAt).toBe('2024-03-15T10:30:00.123Z');
        expect(result.updatedAt).toBe('2024-03-20T14:45:30.456Z');
        expect(result.targetCloseDate).toBe('2024-12-31T23:59:59.999Z');
        expect(result.actualCloseDate).toBe('2024-06-15T08:15:00.000Z');
      });
    });
  });
});
