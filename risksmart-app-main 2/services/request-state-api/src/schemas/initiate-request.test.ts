import { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import { AsyncRequestEvent } from '@risksmart-app/events/src/types/common';
import { describe, expect, it } from 'vitest';

import {
  bulkDeleteRequestSchema,
  createAcceptanceDataSchema,
  createAcceptanceRequestSchema,
  createActionDataSchema,
  createActionRequestSchema,
  createActionUpdateDataSchema,
  createActionUpdateRequestSchema,
  createAppetiteDataSchema,
  createAppetiteRequestSchema,
  createAssessmentDataSchema,
  createAssessmentRequestSchema,
  createControlGroupDataSchema,
  createControlGroupRequestSchema,
  createFormFieldDataSchema,
  createFormFieldRequestSchema,
  createIndicatorResultDataSchema,
  createIndicatorResultRequestSchema,
  createIssueAssessmentDataSchema,
  createIssueAssessmentRequestSchema,
  createIssueDataSchema,
  createIssueRequestSchema,
  createIssueUpdateDataSchema,
  createIssueUpdateRequestSchema,
  createObligationImpactDataSchema,
  createObligationImpactRequestSchema,
  createRiskDataSchema,
  createRiskRequestSchema,
  deleteAcceptancesDataSchema,
  deleteAppetitesDataSchema,
  deleteFormFieldDataSchema,
  deleteFormFieldRequestSchema,
  deleteIndicatorResultsDataSchema,
  deleteIndicatorsDataSchema,
  deleteTestResultsDataSchema,
  eventMetadataSchema,
  initiateAsyncRequestDataSchema,
  initiateAsyncRequestSchema,
  updateAcceptanceDataSchema,
  updateAcceptanceRequestSchema,
  updateAppetiteDataSchema,
  updateAppetiteRequestSchema,
  updateFormFieldDataSchema,
  updateFormFieldRequestSchema,
  updateIndicatorDataSchema,
  updateIndicatorRequestSchema,
  updateIndicatorResultDataSchema,
  updateRiskDataSchema,
  updateRiskRequestSchema,
  updateTestResultDataSchema,
  updateTestResultRequestSchema,
} from './initiate-request';

describe('initiate-request schemas', () => {
  const mockMetadata = {
    eventId: '123e4567-e89b-12d3-a456-426614174000',
    version: '1.0.0',
    timestamp: '2024-01-01T00:00:00Z',
    domain: 'risksmart.app',
    service: 'trpc',
    correlationId: '123e4567-e89b-12d3-a456-426614174001',
    userId: 'user-123',
    tenant: 'test-tenant',
    orgKey: 'test-org',
  };

  describe('eventMetadataSchema', () => {
    it('validates correct metadata', () => {
      const result = eventMetadataSchema.safeParse(mockMetadata);
      expect(result.success).toBe(true);
    });

    it('rejects invalid correlationId', () => {
      const result = eventMetadataSchema.safeParse({
        ...mockMetadata,
        correlationId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createAcceptanceRequestSchema', () => {
    const validParentId = '123e4567-e89b-12d3-a456-426614174010';

    it('validates correct request', () => {
      const request = {
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
        Title: 'Test acceptance',
        Details: 'Test details',
        Status: 'open',
        ApprovedByUser: 'user-123',
        RequestedByUser: 'user-456',
        CustomAttributeData: null,
      };
      const result = createAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields', () => {
      const request = {
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
        Title: 'Test Acceptance',
        Details: 'Test details',
        Status: AcceptanceStatus.Open,
        ApprovedByUser: null,
        ApprovedByUserGroup: null,
        RequestedByUser: null,
        RequestedByUserGroup: null,
        CustomAttributeData: null,
      };
      const result = createAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('rejects both ApprovedByUser and ApprovedByUserGroup set', () => {
      const request = {
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
        ApprovedByUser: 'user-123',
        ApprovedByUserGroup: validParentId,
      };
      const result = createAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('rejects both RequestedByUser and RequestedByUserGroup set', () => {
      const request = {
        ParentId: validParentId,
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
        RequestedByUser: 'user-456',
        RequestedByUserGroup: validParentId,
      };
      const result = createAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('bulkDeleteRequestSchema (DELETE_ACCEPTANCES)', () => {
    it('validates correct request', () => {
      const request = {
        Ids: [
          '123e4567-e89b-12d3-a456-426614174010',
          '123e4567-e89b-12d3-a456-426614174011',
        ],
      };
      const result = bulkDeleteRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('rejects empty Ids array', () => {
      const request = { Ids: [] };
      const result = bulkDeleteRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('rejects non-UUID Ids', () => {
      const request = { Ids: ['not-a-uuid'] };
      const result = bulkDeleteRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('createActionUpdateRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Description: 'Test description',
        ParentActionId: '123e4567-e89b-12d3-a456-426614174002',
        Title: 'Test title',
        CustomAttributeData: null,
      };
      const result = createActionUpdateRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createActionRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Title: 'Test action',
        DateDue: '2024-06-01',
        DateRaised: '2024-01-01',
        Status: 'open',
        ParentId: '123e4567-e89b-12d3-a456-426614174010',
        Priority: 1,
        Description: 'Test description',
        CustomAttributeData: null,
      };
      const result = createActionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields (form default values)', () => {
      const request = {
        Title: 'Test action',
        DateDue: '2024-06-01',
        DateRaised: '2024-01-01',
        Status: 'open',
        ParentId: null,
        Priority: null,
        Description: null,
        ClosedDate: null,
        CustomAttributeData: null,
        OwnerUserIds: null,
        OwnerGroupIds: null,
        ContributorUserIds: null,
        ContributorGroupIds: null,
        TagTypeIds: null,
        DepartmentTypeIds: null,
      };
      const result = createActionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createAppetiteRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        ParentIds: ['123e4567-e89b-12d3-a456-426614174010'],
        AppetiteType: 'risk',
        Statement: 'Test statement',
        EffectiveDate: '2024-01-01',
        LowerAppetite: 1,
        UpperAppetite: 5,
        ImpactAppetite: 3,
        LikelihoodAppetite: 2,
        ImpactId: '123e4567-e89b-12d3-a456-426614174011',
        CustomAttributeData: null,
      };
      const result = createAppetiteRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields (form default values)', () => {
      const request = {
        ParentIds: ['123e4567-e89b-12d3-a456-426614174010'],
        AppetiteType: 'impact',
        Statement: null,
        EffectiveDate: null,
        LowerAppetite: null,
        UpperAppetite: null,
        ImpactAppetite: null,
        LikelihoodAppetite: null,
        ImpactId: null,
        CustomAttributeData: null,
      };
      const result = createAppetiteRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createAssessmentRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Title: 'Test assessment',
        Status: 'notstarted',
        OriginatingItemId: '123e4567-e89b-12d3-a456-426614174010',
        Summary: 'Test summary',
        ActualCompletionDate: '2024-06-01',
        NextTestDate: '2024-12-01',
        StartDate: '2024-01-01',
        TargetCompletionDate: '2024-06-30',
        CompletedByUser: 'user-123',
        Outcome: 3,
        CustomAttributeData: { key: 'value' },
        OwnerUserIds: ['user-1'],
        OwnerGroupIds: ['123e4567-e89b-12d3-a456-426614174011'],
        ContributorUserIds: ['user-2'],
        ContributorGroupIds: ['123e4567-e89b-12d3-a456-426614174012'],
        TagTypeIds: ['123e4567-e89b-12d3-a456-426614174013'],
        DepartmentTypeIds: ['123e4567-e89b-12d3-a456-426614174014'],
      };
      const result = createAssessmentRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields (form default values)', () => {
      const request = {
        Title: 'Test assessment',
        Status: 'complete',
        OriginatingItemId: null,
        Summary: null,
        ActualCompletionDate: null,
        NextTestDate: null,
        StartDate: null,
        TargetCompletionDate: null,
        CompletedByUser: null,
        Outcome: null,
        CustomAttributeData: null,
        OwnerUserIds: null,
        OwnerGroupIds: null,
        ContributorUserIds: null,
        ContributorGroupIds: null,
        TagTypeIds: null,
        DepartmentTypeIds: null,
      };
      const result = createAssessmentRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with only required fields', () => {
      const request = {
        Title: 'Test assessment',
        Status: 'inprogress',
      };
      const result = createAssessmentRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createControlGroupRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Title: 'Test control group',
        Description: 'Test description',
        Owner: 'user-123',
        CustomAttributeData: null,
      };
      const result = createControlGroupRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createFormFieldRequestSchema', () => {
    it('validates correct request with StringOption', () => {
      const request = {
        IsCustomField: true as const,
        ParentType: 'risk',
        Label: 'Test Field',
        Type: 'text',
        Options: [{ _tag: 'StringOption' as const, Value: 'option1' }],
        Required: true,
        Hidden: false,
        ReadOnly: false,
      };
      const result = createFormFieldRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates correct request with AltValueOption', () => {
      const request = {
        IsCustomField: true as const,
        ParentType: 'risk',
        Label: 'Test Field',
        Type: 'select',
        Options: [
          {
            _tag: 'AltValueOption' as const,
            Value: 'value1',
            AltValue: 'Display Value 1',
          },
        ],
        Required: false,
        Hidden: false,
        ReadOnly: false,
      };
      const result = createFormFieldRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates optional fields', () => {
      const request = {
        IsCustomField: true as const,
        ParentType: 'risk',
        Label: 'Test Field',
        AltLabel: 'Alternative Label',
        Description: 'Field description',
        Type: 'text',
        Options: [],
        Required: true,
        Hidden: false,
        ReadOnly: false,
        DefaultValue: 'default',
        Conditions: { someCondition: true },
      };
      const result = createFormFieldRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('updateFormFieldRequestSchema', () => {
    it('validates correct update request', () => {
      const request = {
        ParentType: 'risk',
        FieldId: 'field-123',
        IsCustomField: true,
        Label: 'Updated Label',
        Options: [],
        Required: true,
        Hidden: false,
        ReadOnly: false,
      };
      const result = updateFormFieldRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteFormFieldRequestSchema', () => {
    it('validates correct delete request', () => {
      const request = {
        ParentType: 'risk',
        FieldId: 'field-123',
      };
      const result = deleteFormFieldRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createIndicatorResultRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Description: 'Test result',
        IndicatorId: '123e4567-e89b-12d3-a456-426614174003',
        ResultDate: '2024-01-01T00:00:00Z',
        TargetValueNum: 100,
        TargetValueTxt: null,
        CustomAttributeData: null,
      };
      const result = createIndicatorResultRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createIssueUpdateRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Description: 'Test update',
        ParentIssueId: '123e4567-e89b-12d3-a456-426614174004',
        Title: 'Test title',
        CustomAttributeData: null,
      };
      const result = createIssueUpdateRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createIssueRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        ParentId: '123e4567-e89b-12d3-a456-426614174010',
        Title: 'Test issue',
        Details: 'Test details',
        ImpactsCustomer: true,
        IsExternalIssue: false,
        DateOccurred: '2024-01-01',
        DateIdentified: '2024-01-02',
        Type: 'issue',
        CustomAttributeData: null,
        Meta: null,
        OwnerUserIds: ['user-1'],
        OwnerGroupIds: ['123e4567-e89b-12d3-a456-426614174011'],
        ContributorUserIds: ['user-2'],
        ContributorGroupIds: ['123e4567-e89b-12d3-a456-426614174012'],
        TagTypeIds: ['123e4567-e89b-12d3-a456-426614174013'],
        DepartmentTypeIds: ['123e4567-e89b-12d3-a456-426614174014'],
      };
      const result = createIssueRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields (form default values)', () => {
      const request = {
        Title: 'Test issue',
        DateOccurred: '2024-01-01',
        DateIdentified: '2024-01-02',
        Type: 'issue',
        ParentId: null,
        Details: null,
        ImpactsCustomer: null,
        IsExternalIssue: null,
        CustomAttributeData: null,
        Meta: null,
        OwnerUserIds: null,
        OwnerGroupIds: null,
        ContributorUserIds: null,
        ContributorGroupIds: null,
        TagTypeIds: null,
        DepartmentTypeIds: null,
      };
      const result = createIssueRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createIssueAssessmentRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        ParentIssueId: '123e4567-e89b-12d3-a456-426614174010',
        Severity: 3,
        Status: 'open',
        CertifiedIndividual: 'user-123',
        IssueType: 'operational',
        ActualCloseDate: '2024-06-01',
        TargetCloseDate: '2024-12-31',
        PolicyOwnerCommentary: 'Test commentary',
        PolicyOwner: 'owner-123',
        PolicyBreach: true,
        Reportable: false,
        PoliciesBreached: 'Policy A',
        Rationale: 'Test rationale',
        IssueCausedByThirdParty: false,
        SystemResponsible: 'System A',
        RegulatoryBreach: false,
        RegulationsBreached: 'Reg A',
        ThirdPartyResponsible: 'Third Party A',
        IssueCausedBySystemIssue: true,
        CustomAttributeData: { key: 'value' },
        TagTypeIds: ['123e4567-e89b-12d3-a456-426614174011'],
        DepartmentTypeIds: ['123e4567-e89b-12d3-a456-426614174012'],
        RegulationsBreachedIds: ['123e4567-e89b-12d3-a456-426614174013'],
        AssociatedControlIds: ['123e4567-e89b-12d3-a456-426614174014'],
        PoliciesBreachedIds: ['123e4567-e89b-12d3-a456-426614174015'],
      };
      const result = createIssueAssessmentRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields (form default values)', () => {
      const request = {
        ParentIssueId: '123e4567-e89b-12d3-a456-426614174010',
        Severity: null,
        Status: null,
        CertifiedIndividual: null,
        IssueType: null,
        ActualCloseDate: null,
        TargetCloseDate: null,
        PolicyOwnerCommentary: null,
        PolicyOwner: null,
        PolicyBreach: null,
        Reportable: null,
        PoliciesBreached: null,
        Rationale: null,
        IssueCausedByThirdParty: null,
        SystemResponsible: null,
        RegulatoryBreach: null,
        RegulationsBreached: null,
        ThirdPartyResponsible: null,
        IssueCausedBySystemIssue: null,
        CustomAttributeData: null,
        TagTypeIds: null,
        DepartmentTypeIds: null,
        RegulationsBreachedIds: null,
        AssociatedControlIds: null,
        PoliciesBreachedIds: null,
      };
      const result = createIssueAssessmentRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with only required fields', () => {
      const request = {
        ParentIssueId: '123e4567-e89b-12d3-a456-426614174010',
      };
      const result = createIssueAssessmentRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createObligationImpactRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Description: 'Test impact',
        ImpactRating: 5,
        ParentObligationId: '123e4567-e89b-12d3-a456-426614174005',
        CustomAttributeData: null,
      };
      const result = createObligationImpactRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('createRiskRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Title: 'Test risk',
        Tier: 1,
        ParentRiskId: '123e4567-e89b-12d3-a456-426614174010',
        Description: 'Test description',
        Treatment: 'treat',
        Status: 'active',
        CustomAttributeData: null,
      };
      const result = createRiskRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields (form default values)', () => {
      const request = {
        Title: 'Test risk',
        Tier: 1,
        ParentRiskId: null,
        Description: null,
        Treatment: null,
        Status: null,
        CustomAttributeData: null,
      };
      const result = createRiskRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('updateAcceptanceRequestSchema', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174010';

    it('validates correct request', () => {
      const request = {
        Id: validId,
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
        Title: 'Test acceptance',
        Details: 'Test details',
        Status: 'open',
        ApprovedByUser: 'user-123',
        RequestedByUser: 'user-456',
        CustomAttributeData: null,
      };
      const result = updateAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields', () => {
      const request = {
        Id: validId,
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
        Status: 'open',
        Title: 'Test',
        Details: 'Test details',
        ApprovedByUser: null,
        ApprovedByUserGroup: null,
        RequestedByUser: null,
        RequestedByUserGroup: null,
        CustomAttributeData: null,
      };
      const result = updateAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('rejects request without Id', () => {
      const request = {
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
      };
      const result = updateAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('rejects request with invalid Id', () => {
      const request = {
        Id: 'not-a-uuid',
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
      };
      const result = updateAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('rejects both ApprovedByUser and ApprovedByUserGroup set', () => {
      const request = {
        Id: validId,
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
        ApprovedByUser: 'user-123',
        ApprovedByUserGroup: validId,
      };
      const result = updateAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('rejects both RequestedByUser and RequestedByUserGroup set', () => {
      const request = {
        Id: validId,
        DateAcceptedFrom: '2026-01-01T00:00:00Z',
        DateAcceptedTo: '2026-12-31T00:00:00Z',
        RequestedByUser: 'user-456',
        RequestedByUserGroup: validId,
      };
      const result = updateAcceptanceRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('updateAppetiteRequestSchema', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174010';

    it('validates correct request', () => {
      const request = {
        Id: validId,
        AppetiteType: 'risk',
        Statement: 'Test statement',
        EffectiveDate: '2026-01-01T00:00:00Z',
        LowerAppetite: 1,
        UpperAppetite: 5,
        ImpactAppetite: 3,
        LikelihoodAppetite: 2,
        ImpactId: validId,
        CustomAttributeData: null,
      };
      const result = updateAppetiteRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields', () => {
      const request = {
        Id: validId,
        AppetiteType: 'risk',
        Statement: null,
        EffectiveDate: null,
        LowerAppetite: null,
        UpperAppetite: null,
        ImpactAppetite: null,
        LikelihoodAppetite: null,
        ImpactId: null,
        CustomAttributeData: null,
      };
      const result = updateAppetiteRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates minimal request with only Id and AppetiteType', () => {
      const request = {
        Id: validId,
        AppetiteType: 'risk',
      };
      const result = updateAppetiteRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('rejects request without Id', () => {
      const request = {
        AppetiteType: 'risk',
      };
      const result = updateAppetiteRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('rejects request with invalid Id', () => {
      const request = {
        Id: 'not-a-uuid',
      };
      const result = updateAppetiteRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('updateRiskRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        Title: 'Test risk',
        Tier: 1,
        ParentRiskId: '123e4567-e89b-12d3-a456-426614174011',
        Description: 'Test description',
        Treatment: 'treat',
        Status: 'active',
        CustomAttributeData: null,
      };
      const result = updateRiskRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields (form default values)', () => {
      const request = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        Title: 'Test risk',
        Tier: 1,
        ParentRiskId: null,
        Description: null,
        Treatment: null,
        Status: null,
        CustomAttributeData: null,
        OwnerUserIds: null,
        OwnerGroupIds: null,
        ContributorUserIds: null,
        ContributorGroupIds: null,
        TagTypeIds: null,
        DepartmentTypeIds: null,
        Schedule: null,
      };
      const result = updateRiskRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('rejects request without Id', () => {
      const request = {
        Title: 'Test risk',
        Tier: 1,
      };
      const result = updateRiskRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('rejects request with invalid Id', () => {
      const request = {
        Id: 'not-a-uuid',
        Title: 'Test risk',
        Tier: 1,
      };
      const result = updateRiskRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTestResultRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        ParentControlId: '123e4567-e89b-12d3-a456-426614174011',
        Description: 'Test description',
        DesignEffectiveness: 3,
        OverallEffectiveness: 2,
        PerformanceEffectiveness: 4,
        Submitter: 'user-123',
        TestDate: '2024-01-01',
        TestType: 'businessLine',
        Title: 'Test result',
        CustomAttributeData: null,
        OriginalTimestamp: '2024-01-01T00:00:00Z',
      };
      const result = updateTestResultRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields', () => {
      const request = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        ParentControlId: '123e4567-e89b-12d3-a456-426614174011',
        Description: null,
        DesignEffectiveness: null,
        OverallEffectiveness: null,
        PerformanceEffectiveness: null,
        Submitter: null,
        TestDate: null,
        TestType: null,
        Title: null,
        CustomAttributeData: null,
        OriginalTimestamp: '2024-01-01T00:00:00Z',
      };
      const result = updateTestResultRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('rejects request without Id', () => {
      const request = {
        ParentControlId: '123e4567-e89b-12d3-a456-426614174011',
        OriginalTimestamp: '2024-01-01T00:00:00Z',
      };
      const result = updateTestResultRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('rejects request with invalid Id', () => {
      const request = {
        Id: 'not-a-uuid',
        ParentControlId: '123e4567-e89b-12d3-a456-426614174011',
        OriginalTimestamp: '2024-01-01T00:00:00Z',
      };
      const result = updateTestResultRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('updateIndicatorRequestSchema', () => {
    it('validates correct request', () => {
      const request = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        Title: 'Test indicator',
        Type: 'number',
        Description: 'Test description',
        Unit: '%',
        UpperToleranceNum: 100,
        LowerToleranceNum: 0,
        TargetValueTxt: '50',
        CustomAttributeData: null,
      };
      const result = updateIndicatorRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('validates request with null optional fields (form default values)', () => {
      const request = {
        Id: '123e4567-e89b-12d3-a456-426614174010',
        Title: 'Test indicator',
        Type: 'number',
        Description: null,
        Unit: null,
        UpperToleranceNum: null,
        LowerToleranceNum: null,
        TargetValueTxt: null,
        UpperAppetiteNum: null,
        LowerAppetiteNum: null,
        CustomAttributeData: null,
        OwnerUserIds: null,
        OwnerGroupIds: null,
        ContributorUserIds: null,
        ContributorGroupIds: null,
        TagTypeIds: null,
        DepartmentTypeIds: null,
        Schedule: null,
      };
      const result = updateIndicatorRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('rejects request without Id', () => {
      const request = {
        Title: 'Test indicator',
        Type: 'number',
      };
      const result = updateIndicatorRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('rejects request with invalid Id', () => {
      const request = {
        Id: 'not-a-uuid',
        Title: 'Test indicator',
        Type: 'number',
      };
      const result = updateIndicatorRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('data schemas', () => {
    it('validates CREATE_ACCEPTANCE data schema', () => {
      const data = {
        request: {
          ParentId: '123e4567-e89b-12d3-a456-426614174010',
          DateAcceptedFrom: '2026-01-01T00:00:00Z',
          DateAcceptedTo: '2026-12-31T00:00:00Z',
          Title: 'Test Acceptance',
          Details: 'Test details',
          Status: AcceptanceStatus.Open,
        },
        subType: 'CREATE_ACCEPTANCE' as const,
      };
      const result = createAcceptanceDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_ACCEPTANCES data schema', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_ACCEPTANCES' as const,
      };
      const result = deleteAcceptancesDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_APPETITES data schema', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_APPETITES' as const,
      };
      const result = deleteAppetitesDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ACTION_UPDATE data schema', () => {
      const data = {
        request: {
          Description: 'Test',
          ParentActionId: '123e4567-e89b-12d3-a456-426614174006',
          Title: 'Test',
          CustomAttributeData: null,
        },
        subType: 'CREATE_ACTION_UPDATE' as const,
      };
      const result = createActionUpdateDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ACTION data schema', () => {
      const data = {
        request: {
          Title: 'Test action',
          DateDue: '2024-06-01',
          DateRaised: '2024-01-01',
          Status: 'open',
          CustomAttributeData: null,
        },
        subType: 'CREATE_ACTION' as const,
      };
      const result = createActionDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ASSESSMENT data schema', () => {
      const data = {
        request: {
          Title: 'Test assessment',
          Status: 'notstarted',
        },
        subType: 'CREATE_ASSESSMENT' as const,
      };
      const result = createAssessmentDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_APPETITE data schema', () => {
      const data = {
        request: {
          ParentIds: ['123e4567-e89b-12d3-a456-426614174010'],
          AppetiteType: 'risk',
        },
        subType: 'CREATE_APPETITE' as const,
      };
      const result = createAppetiteDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_CONTROL_GROUP data schema', () => {
      const data = {
        request: {
          Title: 'Test',
          Description: 'Test',
          Owner: 'user-123',
          CustomAttributeData: null,
        },
        subType: 'CREATE_CONTROL_GROUP' as const,
      };
      const result = createControlGroupDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_FORM_FIELD data schema', () => {
      const data = {
        request: {
          IsCustomField: true as const,
          ParentType: 'risk',
          Label: 'Test',
          Type: 'text',
          Options: [],
          Required: true,
          Hidden: false,
          ReadOnly: false,
        },
        subType: 'CREATE_FORM_FIELD' as const,
      };
      const result = createFormFieldDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_FORM_FIELD data schema', () => {
      const data = {
        request: {
          ParentType: 'risk',
          FieldId: 'field-123',
          IsCustomField: true,
          Options: [],
          Required: true,
          Hidden: false,
          ReadOnly: false,
        },
        subType: 'UPDATE_FORM_FIELD' as const,
      };
      const result = updateFormFieldDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_FORM_FIELD data schema', () => {
      const data = {
        request: {
          ParentType: 'risk',
          FieldId: 'field-123',
        },
        subType: 'DELETE_FORM_FIELD' as const,
      };
      const result = deleteFormFieldDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_INDICATOR_RESULT data schema', () => {
      const data = {
        request: {
          Description: null,
          IndicatorId: '123e4567-e89b-12d3-a456-426614174007',
          ResultDate: '2024-01-01T00:00:00Z',
          TargetValueNum: null,
          TargetValueTxt: null,
          CustomAttributeData: null,
        },
        subType: 'CREATE_INDICATOR_RESULT' as const,
      };
      const result = createIndicatorResultDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ISSUE data schema', () => {
      const data = {
        request: {
          Title: 'Test issue',
          DateOccurred: '2024-01-01',
          DateIdentified: '2024-01-02',
          Type: 'issue',
        },
        subType: 'CREATE_ISSUE' as const,
      };
      const result = createIssueDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ISSUE_ASSESSMENT data schema', () => {
      const data = {
        request: {
          ParentIssueId: '123e4567-e89b-12d3-a456-426614174010',
          Severity: 3,
          Status: 'open',
        },
        subType: 'CREATE_ISSUE_ASSESSMENT' as const,
      };
      const result = createIssueAssessmentDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ISSUE_UPDATE data schema', () => {
      const data = {
        request: {
          Description: 'Test',
          ParentIssueId: '123e4567-e89b-12d3-a456-426614174008',
          Title: 'Test',
          CustomAttributeData: null,
        },
        subType: 'CREATE_ISSUE_UPDATE' as const,
      };
      const result = createIssueUpdateDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_OBLIGATION_IMPACT data schema', () => {
      const data = {
        request: {
          Description: 'Test',
          ImpactRating: 5,
          ParentObligationId: '123e4567-e89b-12d3-a456-426614174009',
          CustomAttributeData: null,
        },
        subType: 'CREATE_OBLIGATION_IMPACT' as const,
      };
      const result = createObligationImpactDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_RISK data schema', () => {
      const data = {
        request: {
          Title: 'Test risk',
          Tier: 2,
          CustomAttributeData: null,
        },
        subType: 'CREATE_RISK' as const,
      };
      const result = createRiskDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_ACCEPTANCE data schema', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          DateAcceptedFrom: '2026-01-01T00:00:00Z',
          DateAcceptedTo: '2026-12-31T00:00:00Z',
          Title: 'Test',
          Details: 'Test details',
          Status: 'open',
        },
        subType: 'UPDATE_ACCEPTANCE' as const,
      };
      const result = updateAcceptanceDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_APPETITE data schema', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          AppetiteType: 'risk',
        },
        subType: 'UPDATE_APPETITE' as const,
      };
      const result = updateAppetiteDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_RISK data schema', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          Title: 'Test risk',
          Tier: 1,
          CustomAttributeData: null,
        },
        subType: 'UPDATE_RISK' as const,
      };
      const result = updateRiskDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_TEST_RESULT data schema', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          ParentControlId: '123e4567-e89b-12d3-a456-426614174011',
          OriginalTimestamp: '2024-01-01T00:00:00Z',
        },
        subType: 'UPDATE_TEST_RESULT' as const,
      };
      const result = updateTestResultDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_INDICATOR_RESULT data schema', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          ResultDate: '2024-01-01T00:00:00Z',
        },
        subType: 'UPDATE_INDICATOR_RESULT' as const,
      };
      const result = updateIndicatorResultDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_INDICATOR data schema', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          Title: 'Test indicator',
          Type: 'number',
          CustomAttributeData: null,
        },
        subType: 'UPDATE_INDICATOR' as const,
      };
      const result = updateIndicatorDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_INDICATOR_RESULTS data schema', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_INDICATOR_RESULTS' as const,
      };
      const result = deleteIndicatorResultsDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_INDICATORS data schema', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_INDICATORS' as const,
      };
      const result = deleteIndicatorsDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_TEST_RESULTS data schema', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_TEST_RESULTS' as const,
      };
      const result = deleteTestResultsDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('initiateAsyncRequestDataSchema discriminated union', () => {
    it('validates CREATE_ACCEPTANCE in union', () => {
      const data = {
        request: {
          ParentId: '123e4567-e89b-12d3-a456-426614174010',
          DateAcceptedFrom: '2026-01-01T00:00:00Z',
          DateAcceptedTo: '2026-12-31T00:00:00Z',
          Title: 'Test Acceptance',
          Details: 'Test details',
          Status: AcceptanceStatus.Open,
        },
        subType: 'CREATE_ACCEPTANCE' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_ACCEPTANCES in union', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_ACCEPTANCES' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_APPETITES in union', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_APPETITES' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ACTION in union', () => {
      const data = {
        request: {
          Title: 'Test action',
          DateDue: '2024-06-01',
          DateRaised: '2024-01-01',
          Status: 'open',
        },
        subType: 'CREATE_ACTION' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ASSESSMENT in union', () => {
      const data = {
        request: {
          Title: 'Test assessment',
          Status: 'notstarted',
        },
        subType: 'CREATE_ASSESSMENT' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_APPETITE in union', () => {
      const data = {
        request: {
          ParentIds: ['123e4567-e89b-12d3-a456-426614174010'],
          AppetiteType: 'risk',
        },
        subType: 'CREATE_APPETITE' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ISSUE in union', () => {
      const data = {
        request: {
          Title: 'Test issue',
          DateOccurred: '2024-01-01',
          DateIdentified: '2024-01-02',
          Type: 'issue',
        },
        subType: 'CREATE_ISSUE' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_ISSUE_ASSESSMENT in union', () => {
      const data = {
        request: {
          ParentIssueId: '123e4567-e89b-12d3-a456-426614174010',
        },
        subType: 'CREATE_ISSUE_ASSESSMENT' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_FORM_FIELD in union', () => {
      const data = {
        request: {
          IsCustomField: true as const,
          ParentType: 'risk',
          Label: 'Test Field',
          Type: 'text',
          Options: [],
          Required: true,
          Hidden: false,
          ReadOnly: false,
        },
        subType: 'CREATE_FORM_FIELD' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_FORM_FIELD in union', () => {
      const data = {
        request: {
          ParentType: 'risk',
          FieldId: 'field-123',
          IsCustomField: true,
          Options: [],
          Required: true,
          Hidden: false,
          ReadOnly: false,
        },
        subType: 'UPDATE_FORM_FIELD' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_FORM_FIELD in union', () => {
      const data = {
        request: {
          ParentType: 'risk',
          FieldId: 'field-123',
        },
        subType: 'DELETE_FORM_FIELD' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates CREATE_RISK in union', () => {
      const data = {
        request: {
          Title: 'Test risk',
          Tier: 1,
        },
        subType: 'CREATE_RISK' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_ACCEPTANCE in union', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          DateAcceptedFrom: '2026-01-01T00:00:00Z',
          DateAcceptedTo: '2026-12-31T00:00:00Z',
          Title: 'Test',
          Details: 'Test details',
          Status: 'open',
        },
        subType: 'UPDATE_ACCEPTANCE' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_APPETITE in union', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          AppetiteType: 'risk',
        },
        subType: 'UPDATE_APPETITE' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_RISK in union', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          Title: 'Test risk',
          Tier: 1,
        },
        subType: 'UPDATE_RISK' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_TEST_RESULT in union', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          ParentControlId: '123e4567-e89b-12d3-a456-426614174011',
          OriginalTimestamp: '2024-01-01T00:00:00Z',
        },
        subType: 'UPDATE_TEST_RESULT' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_INDICATOR_RESULT in union', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          ResultDate: '2024-01-01T00:00:00Z',
        },
        subType: 'UPDATE_INDICATOR_RESULT' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates UPDATE_INDICATOR in union', () => {
      const data = {
        request: {
          Id: '123e4567-e89b-12d3-a456-426614174010',
          Title: 'Test indicator',
          Type: 'number',
          CustomAttributeData: null,
        },
        subType: 'UPDATE_INDICATOR' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_INDICATOR_RESULTS in union', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_INDICATOR_RESULTS' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_INDICATORS in union', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_INDICATORS' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates DELETE_TEST_RESULTS in union', () => {
      const data = {
        request: {
          Ids: ['123e4567-e89b-12d3-a456-426614174010'],
        },
        subType: 'DELETE_TEST_RESULTS' as const,
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects invalid subType', () => {
      const data = {
        request: {
          ParentType: 'risk',
          FieldId: 'field-123',
        },
        subType: 'INVALID_TYPE',
      };
      const result = initiateAsyncRequestDataSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error?.errors.length).toBeGreaterThan(0);
      expect(result.error?.errors[0]?.code).toBe('invalid_union_discriminator');
    });
  });

  describe('initiateAsyncRequestSchema', () => {
    it('validates complete DELETE_ACCEPTANCES event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Ids: ['123e4567-e89b-12d3-a456-426614174010'],
          },
          subType: 'DELETE_ACCEPTANCES' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete DELETE_APPETITES event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Ids: ['123e4567-e89b-12d3-a456-426614174010'],
          },
          subType: 'DELETE_APPETITES' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete CREATE_ACTION event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Title: 'Test action',
            DateDue: '2024-06-01',
            DateRaised: '2024-01-01',
            Status: 'open',
          },
          subType: 'CREATE_ACTION' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete CREATE_ASSESSMENT event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Title: 'Test assessment',
            Status: 'notstarted',
            CustomAttributeData: null,
            OwnerUserIds: null,
            TagTypeIds: null,
            DepartmentTypeIds: null,
          },
          subType: 'CREATE_ASSESSMENT' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete CREATE_APPETITE event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            ParentIds: ['123e4567-e89b-12d3-a456-426614174010'],
            AppetiteType: 'risk',
          },
          subType: 'CREATE_APPETITE' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete CREATE_ISSUE event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Title: 'Test issue',
            DateOccurred: '2024-01-01',
            DateIdentified: '2024-01-02',
            Type: 'issue',
          },
          subType: 'CREATE_ISSUE' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete CREATE_ISSUE_ASSESSMENT event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            ParentIssueId: '123e4567-e89b-12d3-a456-426614174010',
            Severity: 5,
            Status: 'open',
            CustomAttributeData: null,
            TagTypeIds: null,
            DepartmentTypeIds: null,
          },
          subType: 'CREATE_ISSUE_ASSESSMENT' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete CREATE_FORM_FIELD event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            IsCustomField: true as const,
            ParentType: 'risk',
            Label: 'Test Field',
            Type: 'text',
            Options: [],
            Required: true,
            Hidden: false,
            ReadOnly: false,
          },
          subType: 'CREATE_FORM_FIELD' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete UPDATE_FORM_FIELD event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            ParentType: 'risk',
            FieldId: 'field-123',
            IsCustomField: true,
            Options: [],
            Required: true,
            Hidden: false,
            ReadOnly: false,
          },
          subType: 'UPDATE_FORM_FIELD' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete DELETE_FORM_FIELD event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            ParentType: 'risk',
            FieldId: 'field-123',
          },
          subType: 'DELETE_FORM_FIELD' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete CREATE_RISK event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Title: 'Test risk',
            Tier: 1,
          },
          subType: 'CREATE_RISK' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete UPDATE_ACCEPTANCE event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Id: '123e4567-e89b-12d3-a456-426614174010',
            DateAcceptedFrom: '2026-01-01T00:00:00Z',
            DateAcceptedTo: '2026-12-31T00:00:00Z',
            Title: 'Test',
            Details: 'Test details',
            Status: 'open',
          },
          subType: 'UPDATE_ACCEPTANCE' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete UPDATE_APPETITE event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Id: '123e4567-e89b-12d3-a456-426614174010',
            AppetiteType: 'risk',
          },
          subType: 'UPDATE_APPETITE' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete UPDATE_RISK event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Id: '123e4567-e89b-12d3-a456-426614174010',
            Title: 'Test risk',
            Tier: 1,
          },
          subType: 'UPDATE_RISK' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete UPDATE_TEST_RESULT event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Id: '123e4567-e89b-12d3-a456-426614174010',
            ParentControlId: '123e4567-e89b-12d3-a456-426614174011',
            OriginalTimestamp: '2024-01-01T00:00:00Z',
          },
          subType: 'UPDATE_TEST_RESULT' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete UPDATE_INDICATOR_RESULT event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Id: '123e4567-e89b-12d3-a456-426614174010',
            ResultDate: '2024-01-01T00:00:00Z',
          },
          subType: 'UPDATE_INDICATOR_RESULT' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete UPDATE_INDICATOR event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Id: '123e4567-e89b-12d3-a456-426614174010',
            Title: 'Test indicator',
            Type: 'number',
            CustomAttributeData: null,
          },
          subType: 'UPDATE_INDICATOR' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete DELETE_INDICATOR_RESULTS event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Ids: ['123e4567-e89b-12d3-a456-426614174010'],
          },
          subType: 'DELETE_INDICATOR_RESULTS' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete DELETE_INDICATORS event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Ids: ['123e4567-e89b-12d3-a456-426614174010'],
          },
          subType: 'DELETE_INDICATORS' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('validates complete DELETE_TEST_RESULTS event', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            Ids: ['123e4567-e89b-12d3-a456-426614174010'],
          },
          subType: 'DELETE_TEST_RESULTS' as const,
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('rejects event with missing command type in union', () => {
      const event = {
        type: AsyncRequestEvent.InitiateAsyncRequest,
        data: {
          request: {
            SomeField: 'value',
          },
          subType: 'UNSUPPORTED_COMMAND_TYPE',
        },
        metadata: mockMetadata,
      };
      const result = initiateAsyncRequestSchema.safeParse(event);
      expect(result.success).toBe(false);
      // This error would catch missing command types at test time
      expect(result.error?.errors.length).toBeGreaterThan(0);
      expect(result.error?.errors[0]?.code).toBe('invalid_union_discriminator');
    });
  });
});
