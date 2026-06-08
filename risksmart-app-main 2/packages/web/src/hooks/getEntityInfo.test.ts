import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

import { useEntityInfo } from './getEntityInfo';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

// Mock URL functions
vi.mock('@/utils/urls', () => ({
  acceptanceDetailUrl: vi.fn((id) => `/acceptance/${id}`),
  actionDetailsUrl: vi.fn((id) => `/action/${id}`),
  appetiteDetailsUrl: vi.fn((id) => `/appetite/${id}`),
  assessmentDetailsUrl: vi.fn((id) => `/assessment/${id}`),
  complianceMonitoringAssessmentDetailsUrl: vi.fn(
    (id) => `/compliance-monitoring/${id}`
  ),
  controlDetailsUrl: vi.fn((id) => `/control/${id}`),
  controlGroupDetailsUrl: vi.fn((id) => `/control-group/${id}`),
  impactDetailsUrl: vi.fn((id) => `/impact/${id}`),
  indicatorDetailsUrl: vi.fn((id) => `/indicator/${id}`),
  internalAuditDetailsUrl: vi.fn((id) => `/internal-audit/${id}`),
  internalAuditReportDetailsUrl: vi.fn((id) => `/internal-audit-report/${id}`),
  issueAssessmentDetailsUrl: vi.fn((id) => `/issue-assessment/${id}`),
  issueBreachLogDetailsUrl: vi.fn((id) => `/issue-breach-log/${id}`),
  issueConsumerDutyDetailsUrl: vi.fn((id) => `/issue-consumer-duty/${id}`),
  issueCustomerTrustDetailsUrl: vi.fn((id) => `/issue-customer-trust/${id}`),
  issueDetailsUrl: vi.fn((id) => `/issue/${id}`),
  issueGDPRBreachLogDetailsUrl: vi.fn((id) => `/issue-gdpr-breach/${id}`),
  issuePCIBreachLogDetailsUrl: vi.fn((id) => `/issue-pci-breach/${id}`),
  issueRiskEventDetailsUrl: vi.fn((id) => `/issue-risk-event/${id}`),
  issueSARLogDetailsUrl: vi.fn((id) => `/issue-sar-log/${id}`),
  obligationDetailsUrl: vi.fn((id) => `/obligation/${id}`),
  obligationChangeDetailsUrl: vi.fn((id) => `/obligation-change/${id}`),
  policyDetailsUrl: vi.fn((id) => `/policy/${id}`),
  riskDetailsUrl: vi.fn((id) => `/risk/${id}`),
  thirdPartyDetailsUrl: vi.fn((id) => `/third-party/${id}`),
}));

describe('useEntityInfo', () => {
  const mockT = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTranslation as Mock).mockReturnValue({
      t: mockT,
    });

    // Setup default translation behavior
    mockT.mockImplementation((key: string, options?: { count?: number }) => {
      const count = options?.count || 1;
      if (count === 1) {
        return `${key}_singular`;
      }

      return `${key}_plural`;
    });
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useEntityInfo());

    expect(typeof result.current).toBe('function');
  });

  it('should use taxonomy namespace for translations', () => {
    renderHook(() => useEntityInfo());

    expect(useTranslation).toHaveBeenCalledWith('taxonomy');
  });

  describe('getEntityInfo', () => {
    it('should return correct entity info for Risk', () => {
      const { result } = renderHook(() => useEntityInfo());
      const getEntityInfo = result.current;

      const entityInfo = getEntityInfo(Parent_Type_Enum.Risk);

      expect(entityInfo).toEqual({
        translationKey: 'risk',
        singular: 'risk_singular',
        plural: 'risk_plural',
        url: expect.any(Function),
        getTitle: expect.any(Function),
      });

      expect(mockT).toHaveBeenCalledWith('risk', { count: 1 });
      expect(mockT).toHaveBeenCalledWith('risk', { count: 3 });
    });

    it('should return correct entity info for Control', () => {
      const { result } = renderHook(() => useEntityInfo());
      const getEntityInfo = result.current;

      const entityInfo = getEntityInfo(Parent_Type_Enum.Control);

      expect(entityInfo).toEqual({
        translationKey: 'control',
        singular: 'control_singular',
        plural: 'control_plural',
        url: expect.any(Function),
        getTitle: expect.any(Function),
      });
    });

    it('should return correct entity info for Action (no getTitle)', () => {
      const { result } = renderHook(() => useEntityInfo());
      const getEntityInfo = result.current;

      const entityInfo = getEntityInfo(Parent_Type_Enum.Action);

      expect(entityInfo).toEqual({
        translationKey: 'action',
        singular: 'action_singular',
        plural: 'action_plural',
        url: expect.any(Function),
      });
      expect(entityInfo.getTitle).toBeUndefined();
    });

    it('should throw error for unimplemented entity type', () => {
      const { result } = renderHook(() => useEntityInfo());
      const getEntityInfo = result.current;

      // Cast to a non-existent enum value
      const invalidType = 'INVALID_TYPE' as Parent_Type_Enum;

      expect(() => getEntityInfo(invalidType)).toThrow(
        'INVALID_TYPE not implemented'
      );
    });

    it('should return correct URL for entity', () => {
      const { result } = renderHook(() => useEntityInfo());
      const getEntityInfo = result.current;

      const entityInfo = getEntityInfo(Parent_Type_Enum.Risk);
      const url = entityInfo.url('test-id');

      expect(url).toBe('/risk/test-id');
    });

    it('should handle getTitle for entities with title', () => {
      const { result } = renderHook(() => useEntityInfo());
      const getEntityInfo = result.current;

      const entityInfo = getEntityInfo(Parent_Type_Enum.Risk);

      const mockItem = {
        risk: { Title: 'Test Risk Title' },
      };

      const title = entityInfo.getTitle!(mockItem);
      expect(title).toBe('Test Risk Title');
    });

    it('should return dash for getTitle when title is null', () => {
      const { result } = renderHook(() => useEntityInfo());
      const getEntityInfo = result.current;

      const entityInfo = getEntityInfo(Parent_Type_Enum.Control);

      const mockItem = {
        control: { Title: null },
      };

      const title = entityInfo.getTitle!(mockItem);
      expect(title).toBe('-');
    });

    it('should return dash for getTitle when entity is null', () => {
      const { result } = renderHook(() => useEntityInfo());
      const getEntityInfo = result.current;

      const entityInfo = getEntityInfo(Parent_Type_Enum.Assessment);

      const mockItem = {
        assessment: null,
      };

      const title = entityInfo.getTitle!(mockItem);
      expect(title).toBe('-');
    });

    it('should return dash for getTitle when item is null', () => {
      const { result } = renderHook(() => useEntityInfo());
      const getEntityInfo = result.current;

      const entityInfo = getEntityInfo(Parent_Type_Enum.Obligation);

      const title = entityInfo.getTitle!(null);
      expect(title).toBe('-');
    });

    describe('All entity types coverage', () => {
      const entityTypesWithGetTitle = [
        Parent_Type_Enum.Assessment,
        Parent_Type_Enum.Control,
        Parent_Type_Enum.InternalAuditReport,
        Parent_Type_Enum.InternalAuditEntity,
        Parent_Type_Enum.ComplianceMonitoringAssessment,
        Parent_Type_Enum.ControlGroup,
        Parent_Type_Enum.Document,
        Parent_Type_Enum.Obligation,
        Parent_Type_Enum.Risk,
        Parent_Type_Enum.Issue,
        Parent_Type_Enum.IssueBreachLog,
        Parent_Type_Enum.IssueConsumerDuty,
        Parent_Type_Enum.IssueCustomerTrust,
        Parent_Type_Enum.IssueGdprBreachLog,
        Parent_Type_Enum.IssuePciBreachLog,
        Parent_Type_Enum.IssueRiskEvent,
        Parent_Type_Enum.IssueSarLog,
        Parent_Type_Enum.ThirdParty,
      ];

      const entityTypesWithoutGetTitle = [
        Parent_Type_Enum.Action,
        Parent_Type_Enum.Acceptance,
        Parent_Type_Enum.Appetite,
        Parent_Type_Enum.Indicator,
        Parent_Type_Enum.Impact,
        Parent_Type_Enum.IssueAssessment,
        Parent_Type_Enum.IssueAssessmentBreachLog,
        Parent_Type_Enum.IssueAssessmentRiskEvent,
        Parent_Type_Enum.IssueAssessmentConsumerDuty,
        Parent_Type_Enum.IssueAssessmentCustomerTrust,
        Parent_Type_Enum.IssueAssessmentGdprBreachLog,
        Parent_Type_Enum.IssueAssessmentPciBreachLog,
        Parent_Type_Enum.IssueAssessmentSarLog,
        Parent_Type_Enum.ImpactRating,
      ];

      it.each(entityTypesWithGetTitle)(
        'should have getTitle function for %s',
        (entityType) => {
          const { result } = renderHook(() => useEntityInfo());
          const getEntityInfo = result.current;

          const entityInfo = getEntityInfo(entityType);
          expect(entityInfo.getTitle).toBeDefined();
          expect(typeof entityInfo.getTitle).toBe('function');
        }
      );

      it.each(entityTypesWithoutGetTitle)(
        'should not have getTitle function for %s',
        (entityType) => {
          const { result } = renderHook(() => useEntityInfo());
          const getEntityInfo = result.current;

          const entityInfo = getEntityInfo(entityType);
          expect(entityInfo.getTitle).toBeUndefined();
        }
      );

      it.each([...entityTypesWithGetTitle, ...entityTypesWithoutGetTitle])(
        'should return valid entity info for %s',
        (entityType) => {
          const { result } = renderHook(() => useEntityInfo());
          const getEntityInfo = result.current;

          const entityInfo = getEntityInfo(entityType);

          expect(entityInfo).toHaveProperty('translationKey');
          expect(entityInfo).toHaveProperty('singular');
          expect(entityInfo).toHaveProperty('plural');
          expect(entityInfo).toHaveProperty('url');
          expect(typeof entityInfo.url).toBe('function');

          // Test URL function
          const url = entityInfo.url('test-id');
          expect(typeof url).toBe('string');
        }
      );
    });

    describe('Special cases', () => {
      it('should return # for ImpactRating URL', () => {
        const { result } = renderHook(() => useEntityInfo());
        const getEntityInfo = result.current;

        const entityInfo = getEntityInfo(Parent_Type_Enum.ImpactRating);
        const url = entityInfo.url('test-id');

        expect(url).toBe('#');
      });

      it('should use correct property for ControlGroup getTitle', () => {
        const { result } = renderHook(() => useEntityInfo());
        const getEntityInfo = result.current;

        const entityInfo = getEntityInfo(Parent_Type_Enum.ControlGroup);

        const mockItem = {
          group: { Title: 'Test Group Title' },
        };

        const title = entityInfo.getTitle!(mockItem);
        expect(title).toBe('Test Group Title');
      });

      it('should use correct property for Document getTitle', () => {
        const { result } = renderHook(() => useEntityInfo());
        const getEntityInfo = result.current;

        const entityInfo = getEntityInfo(Parent_Type_Enum.Document);

        const mockItem = {
          document: { Title: 'Test Document Title' },
        };

        const title = entityInfo.getTitle!(mockItem);
        expect(title).toBe('Test Document Title');
      });

      it('should use correct property for ThirdParty getTitle', () => {
        const { result } = renderHook(() => useEntityInfo());
        const getEntityInfo = result.current;

        const entityInfo = getEntityInfo(Parent_Type_Enum.ThirdParty);

        const mockItem = {
          thirdParty: { Title: 'Test Third Party Title' },
        };

        const title = entityInfo.getTitle!(mockItem);
        expect(title).toBe('Test Third Party Title');
      });
    });
  });

  describe('Memoization', () => {
    it('should memoize lookup based on translation function', () => {
      const { result, rerender } = renderHook(() => useEntityInfo());

      const firstResult = result.current(Parent_Type_Enum.Risk);

      // Rerender without changing translation
      rerender();

      const secondResult = result.current(Parent_Type_Enum.Risk);

      // Should be the same reference due to memoization
      expect(firstResult).toBe(secondResult);
    });
  });
});
