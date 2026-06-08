import { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import { AppetiteType } from '@risksmart-app/domain/src/types/consts/appetite-type';
import { AssessmentStatus } from '@risksmart-app/domain/src/types/consts/assessment-status';
import { ConsequenceType } from '@risksmart-app/domain/src/types/consts/consequence-type';
import { ControlType } from '@risksmart-app/domain/src/types/consts/control-type';
import { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import { IssueAssessmentStatus } from '@risksmart-app/domain/src/types/consts/issue-assessment-status';
import { ObligationType } from '@risksmart-app/domain/src/types/consts/obligation-type';
import { ParentIssueTypes } from '@risksmart-app/domain/src/types/consts/parent-issue-type';
import { RiskAssessmentResultControlType } from '@risksmart-app/domain/src/types/consts/risk-assessment-result-control-type';
import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { TestType } from '@risksmart-app/domain/src/types/consts/test-type';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { AsyncRequestEvent } from '@risksmart-app/events/src/types/common';
import { z } from 'zod';

/**
 * Schema for EventMetadata - matches @risksmart-app/events EventMetadata interface
 */
export const eventMetadataSchema = z.object({
  eventId: z.string(),
  version: z.string(),
  timestamp: z.string(),
  domain: z.string(),
  service: z.string(),
  correlationId: z.string().uuid('Correlation ID must be a valid UUID'),
  causationId: z.string().optional(),
  userId: z.string(),
  tenant: z.string(),
  orgKey: z.string(),
});

/**
 * Schema for CreateAcceptanceRequest - matches @risksmart-app/events RequestTypes
 */
export const createAcceptanceRequestSchema = z
  .object({
    ParentId: z.string().uuid(),
    DateAcceptedFrom: z.string(),
    DateAcceptedTo: z.string(),
    Title: z.string(),
    Details: z.string(),
    Status: z.nativeEnum(AcceptanceStatus),
    ApprovedByUser: z.string().nullish(),
    ApprovedByUserGroup: z.string().uuid().nullish(),
    RequestedByUser: z.string().nullish(),
    RequestedByUserGroup: z.string().uuid().nullish(),
    CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  })
  .refine((d) => d.ApprovedByUser == null || d.ApprovedByUserGroup == null, {
    message: 'ApprovedByUser and ApprovedByUserGroup are mutually exclusive',
    path: ['ApprovedByUserGroup'],
  })
  .refine((d) => d.RequestedByUser == null || d.RequestedByUserGroup == null, {
    message: 'RequestedByUser and RequestedByUserGroup are mutually exclusive',
    path: ['RequestedByUserGroup'],
  });

/**
 * Schema for CreateAssessmentRequest - matches @risksmart-app/events RequestTypes
 */
export const createAssessmentRequestSchema = z.object({
  OriginatingItemId: z.string().uuid().nullish(),
  Title: z.string().min(1),
  Summary: z.string().nullish(),
  ActualCompletionDate: z.string().nullish(),
  NextTestDate: z.string().nullish(),
  StartDate: z.string().nullish(),
  TargetCompletionDate: z.string().nullish(),
  CompletedByUser: z.string().nullish(),
  Status: z.nativeEnum(AssessmentStatus),
  Outcome: z.number().int().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
});

/**
 * Schema for CreateActionUpdateRequest - matches @risksmart-app/events RequestTypes
 */
export const createActionUpdateRequestSchema = z.object({
  Description: z.string(),
  ParentActionId: z.string(),
  Title: z.string(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

/**
 * Schema for CreateActionRequest - matches @risksmart-app/events RequestTypes
 */
export const createActionRequestSchema = z.object({
  ParentId: z.string().uuid().nullish(),
  Title: z.string(),
  DateDue: z.string(),
  DateRaised: z.string(),
  Status: z.nativeEnum(ActionStatus),
  Priority: z.number().int().nullish(),
  Description: z.string().nullish(),
  ClosedDate: z.string().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
});

/**
 * Schema for CreateAppetiteRequest - matches @risksmart-app/events RequestTypes
 */
export const createAppetiteRequestSchema = z.object({
  ParentIds: z.array(z.string().uuid()).min(1),
  AppetiteType: z.nativeEnum(AppetiteType),
  Statement: z.string().nullish(),
  EffectiveDate: z.string().nullish(),
  LowerAppetite: z.number().int().nullish(),
  UpperAppetite: z.number().int().nullish(),
  ImpactAppetite: z.number().int().nullish(),
  LikelihoodAppetite: z.number().int().nullish(),
  ImpactId: z.string().uuid().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * Schema for DeleteActionUpdatesRequest - matches @risksmart-app/events RequestTypes
 */
export const bulkDeleteRequestSchema = z.object({
  Ids: z
    .array(z.string().uuid('Each Id must be a valid UUID'))
    .min(1, 'At least one Id is required')
    .max(200, 'A maximum of 200 Ids can be deleted at once'),
});

/**
 * Schema for DeleteIssueUpdatesRequest - matches @risksmart-app/events RequestTypes
 */
export const deleteIssueUpdatesRequestSchema = z.object({
  Ids: z
    .array(z.string().uuid('Each Id must be a valid UUID'))
    .min(1, 'At least one Id is required')
    .max(200, 'A maximum of 200 Ids can be deleted at once'),
});

/**
 * Schema for CreateCauseRequest - matches @risksmart-app/events RequestTypes
 */
export const createCauseRequestSchema = z.object({
  ParentIssueId: z.string().uuid(),
  Title: z.string().min(1),
  Description: z.string(),
  Significance: z.number().int().min(1).max(5).nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * Schema for UpdateCauseRequest - matches @risksmart-app/events RequestTypes
 */
export const updateCauseRequestSchema = z.object({
  Id: z.string().uuid(),
  ParentIssueId: z.string().uuid(),
  Title: z.string().min(1),
  Description: z.string(),
  Significance: z.number().int().min(1).max(5).nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OriginalTimestamp: z.string(),
});

/**
 * Schema for CreateConsequenceRequest - matches @risksmart-app/events RequestTypes
 */
export const createConsequenceRequestSchema = z.object({
  ParentIssueId: z.string().uuid(),
  Title: z.string().min(1),
  Description: z.string(),
  Criticality: z.number().int().nullish(),
  CostType: z.nativeEnum(CostType),
  CostValue: z.number(),
  Type: z.nativeEnum(ConsequenceType).nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * Schema for UpdateConsequenceRequest - matches @risksmart-app/events RequestTypes
 */
export const updateConsequenceRequestSchema = z.object({
  Id: z.string().uuid(),
  ParentIssueId: z.string().uuid(),
  Title: z.string().min(1),
  Description: z.string(),
  Criticality: z.number().int().nullish(),
  CostType: z.nativeEnum(CostType),
  CostValue: z.number(),
  Type: z.nativeEnum(ConsequenceType).nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OriginalTimestamp: z.string(),
});

/**
 * Schema for CreateControlRequest - matches @risksmart-app/events RequestTypes
 */
export const createControlRequestSchema = z.object({
  ParentId: z.string().uuid().nullish(),
  Title: z.string(),
  Description: z.string().nullish(),
  Type: z.nativeEnum(ControlType).nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
  Schedule: z
    .object({
      Frequency: z.nativeEnum(TestFrequency).nullish(),
      ManualDueDate: z.string().nullish(),
      StartDate: z.string().nullish(),
      TimeToCompleteUnit: z.nativeEnum(UnitOfTime).nullish(),
      TimeToCompleteValue: z.number().int().nullish(),
    })
    .nullish(),
  ScheduleState: z
    .object({
      DueDate: z.string().nullish(),
      OverdueDate: z.string().nullish(),
      LatestDate: z.string().nullish(),
    })
    .nullish(),
});

/**
 * Schema for CreateControlTestResultRequest - matches @risksmart-app/events RequestTypes
 */
export const createControlTestResultRequestSchema = z.object({
  ControlIds: z.array(z.string().uuid()).min(1),
  AssessmentId: z.string().uuid().nullish(),
  Description: z.string().nullish(),
  DesignEffectiveness: z.number().int().min(0).max(4).nullish(),
  OverallEffectiveness: z.number().int().min(0).max(4).nullish(),
  PerformanceEffectiveness: z.number().int().min(0).max(4).nullish(),
  Submitter: z.string().nullish(),
  TestDate: z.string().nullish(),
  TestType: z.nativeEnum(TestType).nullish(),
  Title: z.string().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * Schema for CreateControlGroupRequest - matches @risksmart-app/events RequestTypes
 */
export const createControlGroupRequestSchema = z.object({
  Title: z.string(),
  Description: z.string(),
  Owner: z.string(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

/**
 * Schema for DeleteControlGroupRequest - matches @risksmart-app/events RequestTypes
 */
export const deleteControlGroupRequestSchema = z.object({
  OriginalTimestamp: z.string(),
});

/**
 * Schema for DeleteRiskRequest - matches @risksmart-app/events RequestTypes
 */
export const deleteRiskRequestSchema = z.object({
  Id: z.string().uuid(),
});

/**
 * Schema for Option type used in form field requests
 */
const optionSchema = z.union([
  z.object({
    _tag: z.literal('StringOption'),
    Value: z.string(),
  }),
  z.object({
    _tag: z.literal('AltValueOption'),
    AltValue: z.string(),
    Value: z.string(),
  }),
]);

/**
 * Schema for CreateFormFieldRequest - matches @risksmart-app/events RequestTypes
 */
export const createFormFieldRequestSchema = z.object({
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IsCustomField: z.literal(true),
  ParentType: z.string(),
  Label: z.string(),
  AltLabel: z.string().optional(),
  Description: z.string().nullable().optional(),
  Type: z.string(),
  Options: z.array(optionSchema),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: z.boolean(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: z.boolean(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: z.boolean(),
  DefaultValue: z.string().nullable().optional(),
  Conditions: z.unknown().optional(),
});

/**
 * Schema for UpdateFormFieldRequest - matches @risksmart-app/events RequestTypes
 */
export const updateFormFieldRequestSchema = z.object({
  ParentType: z.string(),
  FieldId: z.string(),
  IsCustomField: z.boolean(),
  Label: z.string().nullable().optional(),
  AltLabel: z.string().optional(),
  Description: z.string().nullable().optional(),
  Options: z.array(optionSchema),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: z.boolean(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: z.boolean(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: z.boolean(),
  DefaultValue: z.string().nullable().optional(),
  Conditions: z.unknown().optional(),
});

/**
 * Schema for DeleteFormFieldRequest - matches @risksmart-app/events RequestTypes
 */
export const deleteFormFieldRequestSchema = z.object({
  ParentType: z.string(),
  FieldId: z.string(),
});

/**
 * Schema for CreateIndicatorResultRequest - matches @risksmart-app/events RequestTypes
 */
export const createIndicatorResultRequestSchema = z.object({
  Description: z.string().nullable().optional(),
  IndicatorId: z.string(),
  ResultDate: z.string().datetime(),
  TargetValueNum: z.number().nullable().optional(),
  TargetValueTxt: z.string().nullable().optional(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

/**
 * Schema for UpdateIndicatorResultRequest - matches @risksmart-app/events RequestTypes
 */
export const updateIndicatorResultRequestSchema = z.object({
  Id: z.string().uuid(),
  Description: z.string().nullish(),
  ResultDate: z.string().datetime(),
  TargetValueNum: z.number().nullish(),
  TargetValueTxt: z.string().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * Schema for CREATE_INDICATOR_RESULT data payload
 * Pairs createIndicatorResultRequestSchema with its corresponding subType
 */
export const createIndicatorResultDataSchema = z.object({
  request: createIndicatorResultRequestSchema,
  subType: z.literal('CREATE_INDICATOR_RESULT'),
});

/**
 * Schema for UPDATE_INDICATOR_RESULT data payload
 * Pairs updateIndicatorResultRequestSchema with its corresponding subType
 */
export const updateIndicatorResultDataSchema = z.object({
  request: updateIndicatorResultRequestSchema,
  subType: z.literal('UPDATE_INDICATOR_RESULT'),
});

/**
 * Schema for CreateIssueUpdateRequest - matches @risksmart-app/events RequestTypes
 */
export const createIssueUpdateRequestSchema = z.object({
  Description: z.string(),
  ParentIssueId: z.string(),
  Title: z.string(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

/**
 * Schema for CreateIssueRequest - matches @risksmart-app/events RequestTypes
 */
export const createIssueRequestSchema = z.object({
  ParentId: z.string().uuid().nullish(),
  Title: z.string(),
  Details: z.string().nullish(),
  ImpactsCustomer: z.boolean().nullish(),
  IsExternalIssue: z.boolean().nullish(),
  DateOccurred: z.string(),
  DateIdentified: z.string(),
  Type: z.nativeEnum(ParentIssueTypes),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  Meta: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
});

/**
 * Schema for CreateIssueAssessmentRequest - matches @risksmart-app/events RequestTypes
 */
export const createIssueAssessmentRequestSchema = z.object({
  ParentIssueId: z.string().uuid(),
  Severity: z.number().nullish(),
  Status: z.nativeEnum(IssueAssessmentStatus).nullish(),
  CertifiedIndividual: z.string().nullish(),
  IssueType: z.string().nullish(),
  ActualCloseDate: z.string().nullish(),
  TargetCloseDate: z.string().nullish(),
  PolicyOwnerCommentary: z.string().nullish(),
  PolicyOwner: z.string().nullish(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  PolicyBreach: z.boolean().nullish(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Reportable: z.boolean().nullish(),
  PoliciesBreached: z.string().nullish(),
  Rationale: z.string().nullish(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IssueCausedByThirdParty: z.boolean().nullish(),
  SystemResponsible: z.string().nullish(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  RegulatoryBreach: z.boolean().nullish(),
  RegulationsBreached: z.string().nullish(),
  ThirdPartyResponsible: z.string().nullish(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IssueCausedBySystemIssue: z.boolean().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
  RegulationsBreachedIds: z.array(z.string().uuid()).nullish(),
  AssociatedControlIds: z.array(z.string().uuid()).nullish(),
  PoliciesBreachedIds: z.array(z.string().uuid()).nullish(),
});

/**
 * Schema for CreateObligationImpactRequest - matches @risksmart-app/events RequestTypes
 */
export const createObligationImpactRequestSchema = z.object({
  Description: z.string(),
  ImpactRating: z.number(),
  ParentObligationId: z.string(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

/**
 * Schema for CreateSsoConfigurationRequest - matches @risksmart-app/events RequestTypes
 */
export const createSsoConfigurationRequestSchema = z.object({
  Name: z.string(),
  Strategy: z.string(),
  ClientId: z.string(),
  ConnectionId: z.string(),
  Domain: z.string(),
  DomainAliases: z.array(z.string()),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IsActive: z.boolean(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IsOrganizationConnected: z.boolean(),
});

/**
 * Schema for DeleteSsoConfigurationRequest - matches @risksmart-app/events RequestTypes
 */
export const deleteSsoConfigurationRequestSchema = z.object({
  ConnectionId: z.string(),
});

/**
 * Schema for CREATE_ACCEPTANCE data payload
 * Pairs createAcceptanceRequestSchema with its corresponding subType
 */
export const createAcceptanceDataSchema = z.object({
  request: createAcceptanceRequestSchema,
  subType: z.literal('CREATE_ACCEPTANCE'),
});

/**
 * Schema for CreateRiskAssessmentResultRequest - matches @risksmart-app/events RequestTypes
 */
export const createRiskAssessmentResultRequestSchema = z.object({
  RiskIds: z.array(z.string().uuid()).min(1),
  ControlType: z.nativeEnum(RiskAssessmentResultControlType),
  Rating: z.number().int().nullish(),
  Likelihood: z.number().int().nullish(),
  Impact: z.number().int().nullish(),
  AssessmentId: z.string().uuid().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  TestDate: z.string().nullish(),
  Rationale: z.string().nullish(),
});

/**
 * Schema for CREATE_ASSESSMENT data payload
 * Pairs createAssessmentRequestSchema with its corresponding subType
 */
export const createAssessmentDataSchema = z.object({
  request: createAssessmentRequestSchema,
  subType: z.literal('CREATE_ASSESSMENT'),
});

/**
 * Schema for DeleteAssessmentRequest - matches @risksmart-app/events RequestTypes
 */
export const deleteAssessmentRequestSchema = z.object({
  Id: z.string().uuid(),
});

/**
 * Schema for DELETE_ASSESSMENT data payload
 * Pairs deleteAssessmentRequestSchema with its corresponding subType
 */
export const deleteAssessmentDataSchema = z.object({
  request: deleteAssessmentRequestSchema,
  subType: z.literal('DELETE_ASSESSMENT'),
});

/**
 * Schema for CREATE_ACTION_UPDATE data payload
 * Pairs createActionUpdateRequestSchema with its corresponding subType
 */
export const createActionUpdateDataSchema = z.object({
  request: createActionUpdateRequestSchema,
  subType: z.literal('CREATE_ACTION_UPDATE'),
});

/**
 * Schema for CREATE_ACTION data payload
 * Pairs createActionRequestSchema with its corresponding subType
 */
export const createActionDataSchema = z.object({
  request: createActionRequestSchema,
  subType: z.literal('CREATE_ACTION'),
});

/**
 * Schema for CREATE_APPETITE data payload
 * Pairs createAppetiteRequestSchema with its corresponding subType
 */
export const createAppetiteDataSchema = z.object({
  request: createAppetiteRequestSchema,
  subType: z.literal('CREATE_APPETITE'),
});

/**
 * Schema for CREATE_CAUSE data payload
 * Pairs createCauseRequestSchema with its corresponding subType
 */
export const createCauseDataSchema = z.object({
  request: createCauseRequestSchema,
  subType: z.literal('CREATE_CAUSE'),
});

/**
 * Schema for UPDATE_CAUSE data payload
 * Pairs updateCauseRequestSchema with its corresponding subType
 */
export const updateCauseDataSchema = z.object({
  request: updateCauseRequestSchema,
  subType: z.literal('UPDATE_CAUSE'),
});

/**
 * Schema for DELETE_CAUSES data payload
 * Pairs bulkDeleteRequestSchema with its corresponding subType
 */
export const deleteCausesDataSchema = z.object({
  request: bulkDeleteRequestSchema,
  subType: z.literal('DELETE_CAUSES'),
});

/**
 * Schema for CREATE_CONSEQUENCE data payload
 * Pairs createConsequenceRequestSchema with its corresponding subType
 */
export const createConsequenceDataSchema = z.object({
  request: createConsequenceRequestSchema,
  subType: z.literal('CREATE_CONSEQUENCE'),
});

/**
 * Schema for UPDATE_CONSEQUENCE data payload
 * Pairs updateConsequenceRequestSchema with its corresponding subType
 */
export const updateConsequenceDataSchema = z.object({
  request: updateConsequenceRequestSchema,
  subType: z.literal('UPDATE_CONSEQUENCE'),
});

/**
 * Schema for DELETE_CONSEQUENCES data payload
 * Pairs bulkDeleteRequestSchema with its corresponding subType
 */
export const deleteConsequencesDataSchema = z.object({
  request: bulkDeleteRequestSchema,
  subType: z.literal('DELETE_CONSEQUENCES'),
});

/**
 * Schema for DELETE_ACCEPTANCES data payload
 * Pairs bulkDeleteRequestSchema with its corresponding subType
 */
export const deleteAcceptancesDataSchema = z.object({
  request: bulkDeleteRequestSchema,
  subType: z.literal('DELETE_ACCEPTANCES'),
});

/**
 * Schema for DELETE_APPETITES data payload
 * Pairs bulkDeleteRequestSchema with its corresponding subType
 */
export const deleteAppetitesDataSchema = z.object({
  request: bulkDeleteRequestSchema,
  subType: z.literal('DELETE_APPETITES'),
});

/**
 * Schema for DELETE_ACTION_UPDATES data payload
 * Pairs bulkDeleteRequestSchema with its corresponding subType
 */
export const deleteActionUpdatesDataSchema = z.object({
  request: bulkDeleteRequestSchema,
  subType: z.literal('DELETE_ACTION_UPDATES'),
});

/**
 * Schema for CREATE_CONTROL data payload
 * Pairs createControlRequestSchema with its corresponding subType
 */
export const createControlDataSchema = z.object({
  request: createControlRequestSchema,
  subType: z.literal('CREATE_CONTROL'),
});

/**
 * Schema for CREATE_CONTROL_GROUP data payload
 * Pairs createControlGroupRequestSchema with its corresponding subType
 */
export const createControlGroupDataSchema = z.object({
  request: createControlGroupRequestSchema,
  subType: z.literal('CREATE_CONTROL_GROUP'),
});

/**
 * Schema for CREATE_CONTROL_TEST_RESULT data payload
 * Pairs createControlTestResultRequestSchema with its corresponding subType
 */
export const createControlTestResultDataSchema = z.object({
  request: createControlTestResultRequestSchema,
  subType: z.literal('CREATE_CONTROL_TEST_RESULT'),
});

/**
 * Schema for DELETE_CONTROL_GROUP data payload
 * Pairs deleteControlGroupRequestSchema with its corresponding subType
 */
export const deleteControlGroupDataSchema = z.object({
  request: deleteControlGroupRequestSchema,
  subType: z.literal('DELETE_CONTROL_GROUP'),
});

/**
 * Schema for DELETE_ISSUES data payload
 * Pairs deleteIssuesRequestSchema with its corresponding subType
 */
export const deleteIssuesRequestSchema = z.object({
  Ids: z
    .array(z.string().uuid('Each Id must be a valid UUID'))
    .min(1, 'At least one Id is required')
    .max(200, 'A maximum of 200 Ids can be deleted at once'),
});

export const deleteIssuesDataSchema = z.object({
  request: deleteIssuesRequestSchema,
  subType: z.literal('DELETE_ISSUES'),
});

/**
 * Schema for DELETE_ISSUE_UPDATES data payload
 * Pairs deleteIssueUpdatesRequestSchema with its corresponding subType
 */
export const deleteIssueUpdatesDataSchema = z.object({
  request: deleteIssueUpdatesRequestSchema,
  subType: z.literal('DELETE_ISSUE_UPDATES'),
});

/**
 * Schema for DELETE_RISK data payload
 * Pairs deleteRiskRequestSchema with its corresponding subType
 */
export const deleteRiskDataSchema = z.object({
  request: deleteRiskRequestSchema,
  subType: z.literal('DELETE_RISK'),
});

/**
 * Schema for CREATE_ISSUE_UPDATE data payload
 * Pairs createIssueUpdateRequestSchema with its corresponding subType
 */
export const createIssueUpdateDataSchema = z.object({
  request: createIssueUpdateRequestSchema,
  subType: z.literal('CREATE_ISSUE_UPDATE'),
});

/**
 * Schema for CreateObligationRequest - matches @risksmart-app/events RequestTypes
 */
export const createObligationRequestSchema = z.object({
  ParentId: z.string().uuid().nullish(),
  Title: z.string().min(1),
  Adherence: z.string().min(1),
  Type: z.nativeEnum(ObligationType),
  Description: z.string().nullish(),
  Interpretation: z.string().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
  Schedule: z
    .object({
      Frequency: z.nativeEnum(TestFrequency).nullish(),
      ManualDueDate: z.string().nullish(),
      StartDate: z.string().nullish(),
      TimeToCompleteUnit: z.nativeEnum(UnitOfTime).nullish(),
      TimeToCompleteValue: z.number().int().nullish(),
    })
    .nullish(),
  ScheduleState: z
    .object({
      DueDate: z.string().nullish(),
      OverdueDate: z.string().nullish(),
      LatestDate: z.string().nullish(),
    })
    .nullish(),
});

/**
 * Schema for CREATE_ISSUE data payload
 * Pairs createIssueRequestSchema with its corresponding subType
 */
export const createIssueDataSchema = z.object({
  request: createIssueRequestSchema,
  subType: z.literal('CREATE_ISSUE'),
});

/**
 * Schema for CREATE_ISSUE_ASSESSMENT data payload
 * Pairs createIssueAssessmentRequestSchema with its corresponding subType
 */
export const createIssueAssessmentDataSchema = z.object({
  request: createIssueAssessmentRequestSchema,
  subType: z.literal('CREATE_ISSUE_ASSESSMENT'),
});

/**
 * Schema for CreateRiskRequest - matches @risksmart-app/events RequestTypes
 */
export const createRiskRequestSchema = z.object({
  ParentRiskId: z.string().uuid().nullish(),
  Title: z.string().min(1),
  Tier: z.number().int(),
  Description: z.string().nullish(),
  Treatment: z.nativeEnum(RiskTreatmentType).nullish(),
  Status: z.nativeEnum(RiskStatusType).nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
  Schedule: z
    .object({
      Frequency: z.nativeEnum(TestFrequency).nullish(),
      ManualDueDate: z.string().nullish(),
      StartDate: z.string().nullish(),
      TimeToCompleteUnit: z.nativeEnum(UnitOfTime).nullish(),
      TimeToCompleteValue: z.number().int().nullish(),
    })
    .nullish(),
  ScheduleState: z
    .object({
      DueDate: z.string().nullish(),
      OverdueDate: z.string().nullish(),
      LatestDate: z.string().nullish(),
    })
    .nullish(),
});

/**
 * Schema for CREATE_RISK data payload
 * Pairs createRiskRequestSchema with its corresponding subType
 */
export const createRiskDataSchema = z.object({
  request: createRiskRequestSchema,
  subType: z.literal('CREATE_RISK'),
});

/**
 * Schema for UpdateAssessmentRequest - matches @risksmart-app/events RequestTypes
 */
export const updateAssessmentRequestSchema = z.object({
  Id: z.string().uuid(),
  Title: z.string().min(1),
  Summary: z.string().nullish(),
  ActualCompletionDate: z.string().nullish(),
  NextTestDate: z.string().nullish(),
  StartDate: z.string().nullish(),
  TargetCompletionDate: z.string().nullish(),
  CompletedByUser: z.string().nullish(),
  Status: z.nativeEnum(AssessmentStatus),
  Outcome: z.number().int().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
});

/**
 * Schema for UpdateAcceptanceRequest - matches @risksmart-app/events RequestTypes
 */
export const updateAcceptanceRequestSchema = z
  .object({
    Id: z.string().uuid(),
    DateAcceptedFrom: z.string(),
    DateAcceptedTo: z.string(),
    Title: z.string(),
    Details: z.string(),
    Status: z.nativeEnum(AcceptanceStatus),
    ApprovedByUser: z.string().nullish(),
    ApprovedByUserGroup: z.string().uuid().nullish(),
    RequestedByUser: z.string().nullish(),
    RequestedByUserGroup: z.string().uuid().nullish(),
    CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  })
  .refine((d) => d.ApprovedByUser == null || d.ApprovedByUserGroup == null, {
    message: 'ApprovedByUser and ApprovedByUserGroup are mutually exclusive',
    path: ['ApprovedByUserGroup'],
  })
  .refine((d) => d.RequestedByUser == null || d.RequestedByUserGroup == null, {
    message: 'RequestedByUser and RequestedByUserGroup are mutually exclusive',
    path: ['RequestedByUserGroup'],
  });

/**
 * Schema for UpdateRiskRequest - matches @risksmart-app/events RequestTypes
 */
export const updateRiskRequestSchema = z.object({
  Id: z.string().uuid(),
  ParentRiskId: z.string().uuid().nullish(),
  Title: z.string().min(1),
  Tier: z.number().int(),
  Description: z.string().nullish(),
  Treatment: z.nativeEnum(RiskTreatmentType).nullish(),
  Status: z.nativeEnum(RiskStatusType).nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
  Schedule: z
    .object({
      Frequency: z.nativeEnum(TestFrequency).nullish(),
      ManualDueDate: z.string().nullish(),
      StartDate: z.string().nullish(),
      TimeToCompleteUnit: z.nativeEnum(UnitOfTime).nullish(),
      TimeToCompleteValue: z.number().int().nullish(),
    })
    .nullish(),
});

/**
 * Schema for UpdateIndicatorRequest - matches @risksmart-app/events RequestTypes
 */
export const updateIndicatorRequestSchema = z.object({
  Id: z.string().uuid(),
  Title: z.string().min(1),
  Type: z.nativeEnum(IndicatorType),
  Description: z.string().nullish(),
  Unit: z.string().nullish(),
  UpperToleranceNum: z.number().nullish(),
  LowerToleranceNum: z.number().nullish(),
  TargetValueTxt: z.string().nullish(),
  UpperAppetiteNum: z.number().nullish(),
  LowerAppetiteNum: z.number().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
  Schedule: z
    .object({
      Frequency: z.nativeEnum(TestFrequency).nullish(),
      ManualDueDate: z.string().nullish(),
      StartDate: z.string().nullish(),
      TimeToCompleteUnit: z.nativeEnum(UnitOfTime).nullish(),
      TimeToCompleteValue: z.number().int().nullish(),
    })
    .nullish(),
});

/**
 * Schema for UpdateTestResultRequest - matches @risksmart-app/events RequestTypes
 */
export const updateTestResultRequestSchema = z.object({
  Id: z.string().uuid(),
  ParentControlId: z.string().uuid(),
  Description: z.string().nullish(),
  DesignEffectiveness: z.number().int().min(0).max(4).nullish(),
  OverallEffectiveness: z.number().int().min(0).max(4).nullish(),
  PerformanceEffectiveness: z.number().int().min(0).max(4).nullish(),
  Submitter: z.string().nullish(),
  TestDate: z.string().nullish(),
  TestType: z.nativeEnum(TestType).nullish(),
  Title: z.string().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  OriginalTimestamp: z.string(),
});

/**
 * Schema for UpdateAppetiteRequest - matches @risksmart-app/events RequestTypes
 */
export const updateAppetiteRequestSchema = z.object({
  Id: z.string().uuid(),
  AppetiteType: z.nativeEnum(AppetiteType),
  Statement: z.string().nullish(),
  EffectiveDate: z.string().nullish(),
  LowerAppetite: z.number().int().nullish(),
  UpperAppetite: z.number().int().nullish(),
  ImpactAppetite: z.number().int().nullish(),
  LikelihoodAppetite: z.number().int().nullish(),
  ImpactId: z.string().uuid().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

/**
 * Schema for UPDATE_ACCEPTANCE data payload
 * Pairs updateAcceptanceRequestSchema with its corresponding subType
 */
export const updateAcceptanceDataSchema = z.object({
  request: updateAcceptanceRequestSchema,
  subType: z.literal('UPDATE_ACCEPTANCE'),
});

/**
 * Schema for UPDATE_APPETITE data payload
 * Pairs updateAppetiteRequestSchema with its corresponding subType
 */
export const updateAppetiteDataSchema = z.object({
  request: updateAppetiteRequestSchema,
  subType: z.literal('UPDATE_APPETITE'),
});

/**
 * Schema for UPDATE_INDICATOR data payload
 * Pairs updateIndicatorRequestSchema with its corresponding subType
 */
export const updateIndicatorDataSchema = z.object({
  request: updateIndicatorRequestSchema,
  subType: z.literal('UPDATE_INDICATOR'),
});

/**
 * Schema for UPDATE_ASSESSMENT data payload
 * Pairs updateAssessmentRequestSchema with its corresponding subType
 */
export const updateAssessmentDataSchema = z.object({
  request: updateAssessmentRequestSchema,
  subType: z.literal('UPDATE_ASSESSMENT'),
});

/**
 * Schema for UPDATE_RISK data payload
 * Pairs updateRiskRequestSchema with its corresponding subType
 */
export const updateRiskDataSchema = z.object({
  request: updateRiskRequestSchema,
  subType: z.literal('UPDATE_RISK'),
});

/**
 * Schema for UpdateIssueRequest - matches @risksmart-app/events RequestTypes
 */
export const updateIssueRequestSchema = z.object({
  Id: z.string().uuid(),
  Title: z.string().min(1),
  Details: z.string().nullish(),
  ImpactsCustomer: z.boolean().nullish(),
  IsExternalIssue: z.boolean().nullish(),
  DateOccurred: z.string().min(1),
  DateIdentified: z.string().min(1),
  Type: z.nativeEnum(ParentIssueTypes),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  Meta: z.record(z.string(), z.unknown()).nullish(),
  OwnerUserIds: z.array(z.string()).nullish(),
  OwnerGroupIds: z.array(z.string().uuid()).nullish(),
  ContributorUserIds: z.array(z.string()).nullish(),
  ContributorGroupIds: z.array(z.string().uuid()).nullish(),
  TagTypeIds: z.array(z.string().uuid()).nullish(),
  DepartmentTypeIds: z.array(z.string().uuid()).nullish(),
  OriginalTimestamp: z.string().min(1),
});

/**
 * Schema for UPDATE_ISSUE data payload
 * Pairs updateIssueRequestSchema with its corresponding subType
 */
export const updateIssueDataSchema = z.object({
  request: updateIssueRequestSchema,
  subType: z.literal('UPDATE_ISSUE'),
});

/**
 * Schema for DELETE_INDICATORS data payload
 * Pairs bulkDeleteRequestSchema with its corresponding subType
 */
export const deleteIndicatorsDataSchema = z.object({
  request: bulkDeleteRequestSchema,
  subType: z.literal('DELETE_INDICATORS'),
});

/**
 * Schema for DELETE_INDICATOR_RESULTS data payload
 * Pairs bulkDeleteRequestSchema with its corresponding subType
 */
export const deleteIndicatorResultsDataSchema = z.object({
  request: bulkDeleteRequestSchema,
  subType: z.literal('DELETE_INDICATOR_RESULTS'),
});

/**
 * Schema for DELETE_TEST_RESULTS data payload
 * Pairs bulkDeleteRequestSchema with its corresponding subType
 */
export const deleteTestResultsDataSchema = z.object({
  request: bulkDeleteRequestSchema,
  subType: z.literal('DELETE_TEST_RESULTS'),
});

/**
 * Schema for UPDATE_TEST_RESULT data payload
 * Pairs updateTestResultRequestSchema with its corresponding subType
 */
export const updateTestResultDataSchema = z.object({
  request: updateTestResultRequestSchema,
  subType: z.literal('UPDATE_TEST_RESULT'),
});

/**
 * Schema for CREATE_OBLIGATION data payload
 * Pairs createObligationRequestSchema with its corresponding subType
 */
export const createObligationDataSchema = z.object({
  request: createObligationRequestSchema,
  subType: z.literal('CREATE_OBLIGATION'),
});

/**
 * Schema for CREATE_OBLIGATION_IMPACT data payload
 * Pairs CreateObligationImpactRequest with its corresponding subType
 */
export const createObligationImpactDataSchema = z.object({
  request: createObligationImpactRequestSchema,
  subType: z.literal('CREATE_OBLIGATION_IMPACT'),
});

/**
 * Schema for CREATE_RISK_ASSESSMENT_RESULT data payload
 * Pairs createRiskAssessmentResultRequestSchema with its corresponding subType
 */
export const createRiskAssessmentResultDataSchema = z.object({
  request: createRiskAssessmentResultRequestSchema,
  subType: z.literal('CREATE_RISK_ASSESSMENT_RESULT'),
});

/**
 * Schema for DELETE_OBLIGATION_IMPACTS data payload
 * Pairs bulkDeleteRequestSchema with its corresponding subType
 */
export const deleteObligationImpactDataSchema = z.object({
  request: bulkDeleteRequestSchema,
  subType: z.literal('DELETE_OBLIGATION_IMPACTS'),
});

/**
 * Schema for CREATE_FORM_FIELD data payload
 * Pairs createFormFieldRequestSchema with its corresponding subType
 */
export const createFormFieldDataSchema = z.object({
  request: createFormFieldRequestSchema,
  subType: z.literal('CREATE_FORM_FIELD'),
});

/**
 * Schema for UPDATE_FORM_FIELD data payload
 * Pairs updateFormFieldRequestSchema with its corresponding subType
 */
export const updateFormFieldDataSchema = z.object({
  request: updateFormFieldRequestSchema,
  subType: z.literal('UPDATE_FORM_FIELD'),
});

/**
 * Schema for DELETE_FORM_FIELD data payload
 * Pairs deleteFormFieldRequestSchema with its corresponding subType
 */
export const deleteFormFieldDataSchema = z.object({
  request: deleteFormFieldRequestSchema,
  subType: z.literal('DELETE_FORM_FIELD'),
});

/**
 * Schema for CREATE_SSO_CONFIGURATION data payload
 * Pairs createSsoConfigurationRequestSchema with its corresponding subType
 */
export const createSsoConfigurationDataSchema = z.object({
  subType: z.literal('CREATE_SSO_CONFIGURATION'),
  request: createSsoConfigurationRequestSchema,
});

/**
 * Schema for DELETE_SSO_CONFIGURATION data payload
 * Pairs deleteSsoConfigurationRequestSchema with its corresponding subType
 */
export const deleteSsoConfigurationDataSchema = z.object({
  subType: z.literal('DELETE_SSO_CONFIGURATION'),
  request: deleteSsoConfigurationRequestSchema,
});

/**
 * Schema for InitiateAsyncRequest data payload
 * Uses discriminated union to ensure correct request/subType pairing
 */
export const initiateAsyncRequestDataSchema = z.discriminatedUnion('subType', [
  createAcceptanceDataSchema,
  createActionDataSchema,
  createAssessmentDataSchema,
  createCauseDataSchema,
  createConsequenceDataSchema,
  deleteAssessmentDataSchema,
  createActionUpdateDataSchema,
  createAppetiteDataSchema,
  createControlDataSchema,
  createControlGroupDataSchema,
  createControlTestResultDataSchema,
  createFormFieldDataSchema,
  createIndicatorResultDataSchema,
  createIssueAssessmentDataSchema,
  createIssueDataSchema,
  createIssueUpdateDataSchema,
  createObligationDataSchema,
  createObligationImpactDataSchema,
  createSsoConfigurationDataSchema,
  createRiskAssessmentResultDataSchema,
  createRiskDataSchema,
  deleteAcceptancesDataSchema,
  deleteActionUpdatesDataSchema,
  deleteAppetitesDataSchema,
  deleteCausesDataSchema,
  deleteConsequencesDataSchema,
  deleteControlGroupDataSchema,
  deleteFormFieldDataSchema,
  deleteIndicatorResultsDataSchema,
  deleteIndicatorsDataSchema,
  deleteIssuesDataSchema,
  deleteIssueUpdatesDataSchema,
  deleteObligationImpactDataSchema,
  deleteSsoConfigurationDataSchema,
  deleteTestResultsDataSchema,
  deleteRiskDataSchema,
  updateAcceptanceDataSchema,
  updateAppetiteDataSchema,
  updateAssessmentDataSchema,
  updateCauseDataSchema,
  updateConsequenceDataSchema,
  updateFormFieldDataSchema,
  updateIndicatorDataSchema,
  updateIndicatorResultDataSchema,
  updateIssueDataSchema,
  updateRiskDataSchema,
  updateTestResultDataSchema,
]);

/**
 * Schema for the full InitiateAsyncRequest event body
 * Matches InitiateAsyncRequest<RequestTypes> from @risksmart-app/events
 */
export const initiateAsyncRequestSchema = z.object({
  type: z.literal(AsyncRequestEvent.InitiateAsyncRequest),
  data: initiateAsyncRequestDataSchema,
  metadata: eventMetadataSchema,
});

export type InitiateAsyncRequestBody = z.infer<
  typeof initiateAsyncRequestSchema
>;

/**
 * Simplified HTTP request body schema for the POST endpoints
 * Context (tenant, orgKey, userId, correlationId, domain, service) comes from headers
 */
export const simplifiedCreateAcceptanceBodySchema = z.object({
  request: createAcceptanceRequestSchema,
  type: z.literal('CREATE_ACCEPTANCE'),
});

/** Simplified HTTP request body schema for CREATE_ASSESSMENT */
export const simplifiedCreateAssessmentBodySchema = z.object({
  request: createAssessmentRequestSchema,
  type: z.literal('CREATE_ASSESSMENT'),
});

/** Simplified HTTP request body schema for DELETE_ASSESSMENT */
export const simplifiedDeleteAssessmentBodySchema = z.object({
  request: deleteAssessmentRequestSchema,
  type: z.literal('DELETE_ASSESSMENT'),
});

export const simplifiedCreateActionUpdateBodySchema = z.object({
  request: createActionUpdateRequestSchema,
  type: z.literal('CREATE_ACTION_UPDATE'),
});

export const simplifiedCreateActionBodySchema = z.object({
  request: createActionRequestSchema,
  type: z.literal('CREATE_ACTION'),
});

/** Simplified HTTP request body schema for CREATE_APPETITE */
export const simplifiedCreateAppetiteBodySchema = z.object({
  request: createAppetiteRequestSchema,
  type: z.literal('CREATE_APPETITE'),
});

/** Simplified HTTP request body schema for CREATE_CAUSE */
export const simplifiedCreateCauseBodySchema = z.object({
  request: createCauseRequestSchema,
  type: z.literal('CREATE_CAUSE'),
});

/** Simplified HTTP request body schema for UPDATE_CAUSE */
export const simplifiedUpdateCauseBodySchema = z.object({
  request: updateCauseRequestSchema,
  type: z.literal('UPDATE_CAUSE'),
});

/** Simplified HTTP request body schema for DELETE_CAUSES */
export const simplifiedDeleteCausesBodySchema = z.object({
  request: bulkDeleteRequestSchema,
  type: z.literal('DELETE_CAUSES'),
});

/** Simplified HTTP request body schema for CREATE_CONSEQUENCE */
export const simplifiedCreateConsequenceBodySchema = z.object({
  request: createConsequenceRequestSchema,
  type: z.literal('CREATE_CONSEQUENCE'),
});

/** Simplified HTTP request body schema for UPDATE_CONSEQUENCE */
export const simplifiedUpdateConsequenceBodySchema = z.object({
  request: updateConsequenceRequestSchema,
  type: z.literal('UPDATE_CONSEQUENCE'),
});

/** Simplified HTTP request body schema for DELETE_CONSEQUENCES */
export const simplifiedDeleteConsequencesBodySchema = z.object({
  request: bulkDeleteRequestSchema,
  type: z.literal('DELETE_CONSEQUENCES'),
});

export const simplifiedCreateControlBodySchema = z.object({
  request: createControlRequestSchema,
  type: z.literal('CREATE_CONTROL'),
});

export const simplifiedCreateControlGroupBodySchema = z.object({
  request: createControlGroupRequestSchema,
  type: z.literal('CREATE_CONTROL_GROUP'),
});

/**
 * Simplified HTTP request body schema for CREATE_CONTROL_TEST_RESULT
 */
export const simplifiedCreateControlTestResultBodySchema = z.object({
  request: createControlTestResultRequestSchema,
  type: z.literal('CREATE_CONTROL_TEST_RESULT'),
});

/**
 * Simplified HTTP request body schema for DELETE_CONTROL_GROUP
 */
export const simplifiedDeleteControlGroupBodySchema = z.object({
  request: deleteControlGroupRequestSchema,
  type: z.literal('DELETE_CONTROL_GROUP'),
});

export const simplifiedCreateIndicatorResultBodySchema = z.object({
  request: createIndicatorResultRequestSchema,
  type: z.literal('CREATE_INDICATOR_RESULT'),
});

/** Simplified HTTP request body schema for UPDATE_INDICATOR */
export const simplifiedUpdateIndicatorBodySchema = z.object({
  request: updateIndicatorRequestSchema,
  type: z.literal('UPDATE_INDICATOR'),
});

/** Simplified HTTP request body schema for UPDATE_INDICATOR_RESULT */
export const simplifiedUpdateIndicatorResultBodySchema = z.object({
  request: updateIndicatorResultRequestSchema,
  type: z.literal('UPDATE_INDICATOR_RESULT'),
});

export const simplifiedCreateIssueBodySchema = z.object({
  request: createIssueRequestSchema,
  type: z.literal('CREATE_ISSUE'),
});

/** Simplified HTTP request body schema for CREATE_ISSUE_ASSESSMENT */
export const simplifiedCreateIssueAssessmentBodySchema = z.object({
  request: createIssueAssessmentRequestSchema,
  type: z.literal('CREATE_ISSUE_ASSESSMENT'),
});

export const simplifiedCreateIssueUpdateBodySchema = z.object({
  request: createIssueUpdateRequestSchema,
  type: z.literal('CREATE_ISSUE_UPDATE'),
});

export const simplifiedCreateObligationBodySchema = z.object({
  request: createObligationRequestSchema,
  type: z.literal('CREATE_OBLIGATION'),
});

export const simplifiedCreateObligationImpactBodySchema = z.object({
  request: createObligationImpactRequestSchema,
  type: z.literal('CREATE_OBLIGATION_IMPACT'),
});

export const simplifiedCreateRiskBodySchema = z.object({
  request: createRiskRequestSchema,
  type: z.literal('CREATE_RISK'),
});

/** Simplified HTTP request body schema for UPDATE_ACCEPTANCE */
export const simplifiedUpdateAcceptanceBodySchema = z.object({
  request: updateAcceptanceRequestSchema,
  type: z.literal('UPDATE_ACCEPTANCE'),
});

/** Simplified HTTP request body schema for UPDATE_APPETITE */
export const simplifiedUpdateAppetiteBodySchema = z.object({
  request: updateAppetiteRequestSchema,
  type: z.literal('UPDATE_APPETITE'),
});

/** Simplified HTTP request body schema for UPDATE_ASSESSMENT */
export const simplifiedUpdateAssessmentBodySchema = z.object({
  request: updateAssessmentRequestSchema,
  type: z.literal('UPDATE_ASSESSMENT'),
});

/** Simplified HTTP request body schema for UPDATE_RISK */
export const simplifiedUpdateRiskBodySchema = z.object({
  request: updateRiskRequestSchema,
  type: z.literal('UPDATE_RISK'),
});

/** Simplified HTTP request body schema for UPDATE_ISSUE */
export const simplifiedUpdateIssueBodySchema = z.object({
  request: updateIssueRequestSchema,
  type: z.literal('UPDATE_ISSUE'),
});

export const simplifiedCreateRiskAssessmentResultBodySchema = z.object({
  request: createRiskAssessmentResultRequestSchema,
  type: z.literal('CREATE_RISK_ASSESSMENT_RESULT'),
});

/**
 * Simplified HTTP request body schema for DELETE_ACCEPTANCES
 */
export const simplifiedDeleteAcceptancesBodySchema = z.object({
  request: bulkDeleteRequestSchema,
  type: z.literal('DELETE_ACCEPTANCES'),
});

/**
 * Simplified HTTP request body schema for DELETE_APPETITES
 */
export const simplifiedDeleteAppetitesBodySchema = z.object({
  request: bulkDeleteRequestSchema,
  type: z.literal('DELETE_APPETITES'),
});

/**
 * Simplified HTTP request body schema for DELETE_ACTION_UPDATES
 */
export const simplifiedDeleteActionUpdatesBodySchema = z.object({
  request: bulkDeleteRequestSchema,
  type: z.literal('DELETE_ACTION_UPDATES'),
});

export const simplifiedDeleteIssuesBodySchema = z.object({
  request: deleteIssuesRequestSchema,
  type: z.literal('DELETE_ISSUES'),
});

export const simplifiedDeleteIssueUpdatesBodySchema = z.object({
  request: deleteIssueUpdatesRequestSchema,
  type: z.literal('DELETE_ISSUE_UPDATES'),
});

/** Simplified HTTP request body schema for DELETE_RISK */
export const simplifiedDeleteRiskBodySchema = z.object({
  request: deleteRiskRequestSchema,
  type: z.literal('DELETE_RISK'),
});

export const simplifiedDeleteObligationImpactBodySchema = z.object({
  request: bulkDeleteRequestSchema,
  type: z.literal('DELETE_OBLIGATION_IMPACTS'),
});

/**
 * Simplified HTTP request body schema for DELETE_INDICATORS
 */
export const simplifiedDeleteIndicatorsBodySchema = z.object({
  request: bulkDeleteRequestSchema,
  type: z.literal('DELETE_INDICATORS'),
});

/**
 * Simplified HTTP request body schema for DELETE_INDICATOR_RESULTS
 */
export const simplifiedDeleteIndicatorResultsBodySchema = z.object({
  request: bulkDeleteRequestSchema,
  type: z.literal('DELETE_INDICATOR_RESULTS'),
});

/**
 * Simplified HTTP request body schema for DELETE_TEST_RESULTS
 */
export const simplifiedDeleteTestResultsBodySchema = z.object({
  request: bulkDeleteRequestSchema,
  type: z.literal('DELETE_TEST_RESULTS'),
});

/**
 * Simplified HTTP request body schema for UPDATE_TEST_RESULT
 */
export const simplifiedUpdateTestResultBodySchema = z.object({
  request: updateTestResultRequestSchema,
  type: z.literal('UPDATE_TEST_RESULT'),
});

/**
 * Simplified HTTP request body schema for CREATE_FORM_FIELD
 */
export const simplifiedCreateFormFieldBodySchema = z.object({
  request: createFormFieldRequestSchema,
  type: z.literal('CREATE_FORM_FIELD'),
});

/**
 * Simplified HTTP request body schema for UPDATE_FORM_FIELD
 */
export const simplifiedUpdateFormFieldBodySchema = z.object({
  request: updateFormFieldRequestSchema,
  type: z.literal('UPDATE_FORM_FIELD'),
});

/**
 * Simplified HTTP request body schema for DELETE_FORM_FIELD
 */
export const simplifiedDeleteFormFieldBodySchema = z.object({
  request: deleteFormFieldRequestSchema,
  type: z.literal('DELETE_FORM_FIELD'),
});

/**
 * Simplified HTTP request body schema for CREATE_SSO_CONFIGURATION
 */
export const simplifiedCreateSsoConfigurationBodySchema = z.object({
  type: z.literal('CREATE_SSO_CONFIGURATION'),
  request: createSsoConfigurationRequestSchema,
});

/**
 * Simplified HTTP request body schema for DELETE_SSO_CONFIGURATION
 */
export const simplifiedDeleteSsoConfigurationBodySchema = z.object({
  type: z.literal('DELETE_SSO_CONFIGURATION'),
  request: deleteSsoConfigurationRequestSchema,
});

/**
 * Simplified HTTP request body schema
 */
export const simplifiedRequestBodySchema = z.discriminatedUnion('type', [
  simplifiedCreateAcceptanceBodySchema,
  simplifiedCreateActionBodySchema,
  simplifiedCreateAssessmentBodySchema,
  simplifiedCreateCauseBodySchema,
  simplifiedCreateConsequenceBodySchema,
  simplifiedDeleteAssessmentBodySchema,
  simplifiedCreateActionUpdateBodySchema,
  simplifiedCreateAppetiteBodySchema,
  simplifiedCreateControlBodySchema,
  simplifiedCreateControlGroupBodySchema,
  simplifiedCreateControlTestResultBodySchema,
  simplifiedCreateFormFieldBodySchema,
  simplifiedCreateIndicatorResultBodySchema,
  simplifiedCreateIssueAssessmentBodySchema,
  simplifiedCreateIssueBodySchema,
  simplifiedCreateIssueUpdateBodySchema,
  simplifiedCreateObligationBodySchema,
  simplifiedCreateObligationImpactBodySchema,
  simplifiedCreateSsoConfigurationBodySchema,
  simplifiedCreateRiskAssessmentResultBodySchema,
  simplifiedCreateRiskBodySchema,
  simplifiedDeleteAcceptancesBodySchema,
  simplifiedDeleteActionUpdatesBodySchema,
  simplifiedDeleteAppetitesBodySchema,
  simplifiedDeleteCausesBodySchema,
  simplifiedDeleteConsequencesBodySchema,
  simplifiedDeleteControlGroupBodySchema,
  simplifiedDeleteFormFieldBodySchema,
  simplifiedDeleteIndicatorResultsBodySchema,
  simplifiedDeleteIndicatorsBodySchema,
  simplifiedDeleteIssuesBodySchema,
  simplifiedDeleteIssueUpdatesBodySchema,
  simplifiedDeleteObligationImpactBodySchema,
  simplifiedDeleteSsoConfigurationBodySchema,
  simplifiedDeleteTestResultsBodySchema,
  simplifiedDeleteRiskBodySchema,
  simplifiedUpdateAcceptanceBodySchema,
  simplifiedUpdateAppetiteBodySchema,
  simplifiedUpdateAssessmentBodySchema,
  simplifiedUpdateCauseBodySchema,
  simplifiedUpdateConsequenceBodySchema,
  simplifiedUpdateFormFieldBodySchema,
  simplifiedUpdateIndicatorBodySchema,
  simplifiedUpdateIndicatorResultBodySchema,
  simplifiedUpdateIssueBodySchema,
  simplifiedUpdateRiskBodySchema,
  simplifiedUpdateTestResultBodySchema,
]);

export type SimplifiedCreateActionUpdateBody = z.infer<
  typeof simplifiedCreateActionUpdateBodySchema
>;

export type SimplifiedCreateControlGroupBody = z.infer<
  typeof simplifiedCreateControlGroupBodySchema
>;

export type SimplifiedRequestBody = z.infer<typeof simplifiedRequestBodySchema>;

/**
 * Required headers for the simplified POST endpoints
 */
export const requestHeadersSchema = z.object({
  'x-tenant': z.string({ required_error: 'x-tenant header is required' }),
  'x-org-key': z.string({ required_error: 'x-org-key header is required' }),
  'x-user-id': z.string({ required_error: 'x-user-id header is required' }),
  'x-correlation-id': z
    .string({ required_error: 'x-correlation-id header is required' })
    .uuid('x-correlation-id must be a valid UUID'),
  'x-domain': z.string({ required_error: 'x-domain header is required' }),
  'x-service': z.string({ required_error: 'x-service header is required' }),
});

export type RequestHeaders = z.infer<typeof requestHeadersSchema>;
