import { expectTypeOf } from 'expect-type';
import type { GetNormalisedExportDataQuery } from 'generated/graphql';
import {
  AcceptanceStatusEnum,
  ActionStatusEnum,
  AppetiteTypeEnum,
  ApprovalInFlightEditRuleEnum,
  ApprovalRuleTypeEnum,
  ApprovalStatusEnum,
  AssessmentActivityStatusEnum,
  AssessmentActivityTypeEnum,
  AssessmentStatusEnum,
  AttestationRecordStatusEnum,
  ConsequenceTypeEnum,
  ControlTypeEnum,
  CostTypeEnum,
  DocumentFileTypeEnum,
  IndicatorTypeEnum,
  IssueAssessmentStatusEnum,
  ObligationTypeEnum,
  ParentTypeEnum,
  QuestionnaireTemplateVersionStatusEnum,
  RiskAssessmentResultControlTypeEnum,
  RiskStatusTypeEnum,
  RiskTreatmentTypeEnum,
  TestFrequencyEnum,
  ThirdPartyResponseStatusEnum,
  UnitOfTimeEnum,
  UserStatusEnum,
  VersionStatusEnum,
} from 'generated/graphql';
import { describe, test } from 'vitest';

/*
 * This will not fail when running the test suit however the linting and tsc
 * will flag changes in the generated graphql export data type.
 *
 * This is so we don't accidentally break any integrations the client might build
 * on top of the data we give them.
 *
 * If the changes are intentional then please update the expected data and
 * give the client a heads-up before it goes to prod.
 * */
describe('GetNormalisedExportDataQuery', () => {
  test('should not change unexpectedly', () => {
    const expected: GetNormalisedExportDataQuery = {
      acceptance_parent: [
        {
          Id: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      action_parent: [
        {
          ActionId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      appetite_parent: [
        {
          Id: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      attestation_group: [
        {
          GroupId: 'test',
          OrgKey: 'test',
          CreatedByUser: 'test',
          ModifiedByUser: 'test',
          ModifiedAtTimestamp: 'test',
          CreatedAtTimestamp: 'test',
          ConfigId: 'test',
        },
      ],
      attestation_record: [
        {
          Id: 'test',
          UserId: 'test',
          Active: true,
          AttestationStatus: AttestationRecordStatusEnum.Expired,
          AttestedAt: 'test',
          ExpiresAt: 'test',
          OrgKey: 'test',
          CreatedByUser: 'test',
          ModifiedByUser: 'test',
          ModifiedAtTimestamp: 'test',
          CreatedAtTimestamp: 'test',
          NodeId: 'test',
          ConfigId: 'test',
        },
      ],
      control_parent: [
        {
          ControlId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      control_group: [
        {
          Id: 'test',
          Title: 'test',
          Owner: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          Meta: {},
          Description: 'test',
          CreatedByUser: 'test',
          CreatedAtTimestamp: 'test',
          CustomAttributeData: {},
        },
      ],
      indicator_parent: [
        {
          IndicatorId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      issue_parent: [
        {
          IssueId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      impact_parent: [
        {
          ImpactId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      assessment_result_parent: [
        {
          Id: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      document_assessment_result: [
        {
          Id: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
          TestDate: 'test',
          CustomAttributeData: {},
          Rating: 1,
          RatingType: 'test',
          Rationale: 'test',
        },
      ],
      obligation_assessment_result: [
        {
          Id: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
          TestDate: 'test',
          CustomAttributeData: {},
          Rating: 1,
          RatingType: 'test',
          Rationale: 'test',
        },
      ],
      risk_assessment_result: [
        {
          Id: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
          TestDate: 'test',
          CustomAttributeData: {},
          Rating: 1,
          RatingType: 'test',
          Rationale: 'test',
          ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
          Likelihood: 1,
          Impact: 1,
        },
      ],
      owner: [
        {
          UserId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      owner_group: [
        {
          UserGroupId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      contributor: [
        {
          UserId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      contributor_group: [
        {
          UserGroupId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      department_type: [
        {
          DepartmentTypeId: 'test',
          Name: 'test',
          DepartmentTypeGroupId: 'test',
          Description: null,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      department: [
        {
          DepartmentTypeId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      tag_type: [
        {
          TagTypeId: 'test',
          TagTypeGroupId: 'test',
          Name: 'test',
          Description: null,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      tag_type_group: [
        {
          Id: 'test',
          Name: 'test',
          OrgKey: 'test',
          CreatedByUser: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          ModifiedAtTimestamp: 'test',
        },
      ],
      tag: [
        {
          TagTypeId: 'test',
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      file: [
        {
          Id: 'test',
          ContentType: 'test',
          FileName: 'test',
          FileSize: 1,
          Meta: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      relation_file: [
        {
          ParentId: 'test',
          ParentType: ParentTypeEnum.TagType,
          FileId: 'test',
          Meta: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      acceptance: [
        {
          Id: 'test',
          Title: 'test',
          Details: 'test',
          CustomAttributeData: {},
          ApprovedByUser: 'test',
          RequestedByUser: 'test',
          RequestedByUserGroup: 'test',
          SequentialId: 1,
          Status: AcceptanceStatusEnum.Pending,
          DateAcceptedFrom: 'test',
          DateAcceptedTo: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      action_update: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          CustomAttributeData: {},
          ParentActionId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      action: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
          ClosedDate: 'test',
          Priority: 1,
          SequentialId: 1,
          Status: ActionStatusEnum.Open,
          DateDue: 'test',
          DateRaised: 'test',
        },
      ],
      appetite: [
        {
          Id: 'test',
          CustomAttributeData: {},
          SequentialId: 1,
          AppetiteType: AppetiteTypeEnum.Likelihood,
          Statement: 'test',
          UpperAppetite: 1,
          LowerAppetite: 1,
          ImpactAppetite: 1,
          LikelihoodAppetite: 1,
          EffectiveDate: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      test_result: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          OverallEffectiveness: 1,
          ParentControlId: 'test',
          PerformanceEffectiveness: 1,
          RatingType: 'test',
          SequentialId: 1,
          Submitter: 'test',
          TestDate: 'test',
          TestType: 'test',
          DesignEffectiveness: 1,
          NextTestDate: 'test',
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      approval_level: [
        {
          Id: 'test',
          Description: 'test',
          ApprovalId: 'test',
          SequenceOrder: 1,
          ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      approver: [
        {
          Id: 'test',
          UserId: 'test',
          UserGroupId: 'test',
          LevelId: 'test',
          OwnerApprover: true,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      approval: [
        {
          Id: 'test',
          InFlightEditRule: ApprovalInFlightEditRuleEnum.Approvers,
          ParentId: 'test',
          Workflow: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      change_request: [
        {
          Id: 'test',
          ActionUserId: 'test',
          OverriddenByUser: 'test',
          ParentId: 'test',
          RequestedChanges: 'test',
          SequentialId: 1,
          Type: 'test',
          ChangeRequestStatus: ApprovalStatusEnum.Pending,
          Comment: 'test',
          OverriddenAtTimestamp: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      assessment_activity: [
        {
          Id: 'test',
          Title: 'test',
          CustomAttributeData: {},
          ActivityType: AssessmentActivityTypeEnum.Interview,
          ParentId: 'test',
          Status: AssessmentActivityStatusEnum.Complete,
          Summary: 'test',
          AssignedUser: 'test',
          CompletionDate: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      assessment: [
        {
          Id: 'test',
          Title: 'test',
          CustomAttributeData: {},
          ActualCompletionDate: 'test',
          OriginatingItemId: 'test',
          Outcome: 1,
          SequentialId: 1,
          StartDate: 'test',
          Status: AssessmentStatusEnum.Complete,
          Summary: 'test',
          TargetCompletionDate: 'test',
          NextTestDate: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      cause: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          Significance: 1,
          ParentIssueId: 'test',
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      comment: [
        {
          Id: 'test',
          Content: 'test',
          ConversationId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      consequence: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          ParentIssueId: 'test',
          CostType: CostTypeEnum.Number,
          Type: ConsequenceTypeEnum.Financial,
          CostValue: 1,
          Criticality: 1,
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      conversation: [
        {
          Id: 'test',
          IsResolved: true,
          ParentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      control: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          CustomAttributeData: {},
          Type: ControlTypeEnum.Detective,
          SequentialId: 1,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      document_file: [
        {
          Id: 'test',
          FileId: 'test',
          Content: 'test',
          NextReviewDate: 'test',
          ParentDocumentId: 'test',
          PublishedDate: 'test',
          ReasonForReview: 'test',
          ReviewDate: 'test',
          ReviewedBy: 'test',
          Status: VersionStatusEnum.Draft,
          Summary: 'test',
          Type: DocumentFileTypeEnum.File,
          Version: 'test',
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      document_linked_document: [
        {
          LinkedDocumentId: 'test',
          DocumentId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      document: [
        {
          Id: 'test',
          Title: 'test',
          Purpose: 'test',
          SequentialId: 1,
          ParentDocument: 'test',
          DocumentType: 'test',
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      enterprise_risk: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          Tier: 1,
          ParentId: 'test',
          Meta: {},
          Treatment: RiskTreatmentTypeEnum.Terminate,
          SequentialId: 1,
          CustomAttributeData: {},
          OrgKey: 'test',
          CreatedByUser: 'test',
          ModifiedByUser: 'test',
          ModifiedAtTimestamp: 'test',
          CreatedAtTimestamp: 'test',
        },
      ],
      enterprise_risk_instance: [
        {
          EnterpriseRiskId: 'test',
          RiskId: 'test',
          OrgKey: 'test',
          CreatedByUser: 'test',
          ModifiedByUser: 'test',
          ModifiedAtTimestamp: 'test',
          CreatedAtTimestamp: 'test',
          EntityId: 'test',
        },
      ],
      enterprise_risk_score: [
        {
          EnterpriseRiskId: 'test',
          InherentScoreMean: 1,
          InherentScoreMedian: [1],
          InherentScoreWorstCase: 1,
          ResidualScoreMean: 1,
          ResidualScoreMedian: [1],
          ResidualScoreWorstCase: 1,
          InherentRatingMean: 1,
          InherentRatingMedian: [1],
          InherentRatingWorstCase: 1,
          ResidualRatingMean: 1,
          ResidualRatingMedian: [1],
          ResidualRatingWorstCase: 1,
          OrgKey: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          CreatedByUser: 'test',
          ModifiedByUser: 'test',
        },
      ],
      impact_rating: [
        {
          Id: 'test',
          CompletedBy: 'test',
          RatedItemId: 'test',
          Rating: 1,
          RatingType: 'test',
          SequentialId: 1,
          TestDate: 'test',
          ImpactId: 'test',
          Likelihood: 1,
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      impact: [
        {
          Id: 'test',
          RatingGuidance: 'test',
          Rationale: 'test',
          ImpactAppetite: 1,
          LikelihoodAppetite: 1,
          CustomAttributeData: {},
          SequentialId: 1,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      indicator_result: [
        {
          Id: 'test',
          Description: null,
          TargetValueNum: 1,
          TargetValueTxt: null,
          IndicatorId: 'test',
          ResultDate: 'test',
          CustomAttributeData: null,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      indicator: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          TargetValueTxt: null,
          Type: IndicatorTypeEnum.Number,
          Unit: 'test',
          UpperAppetiteNum: 10,
          UpperToleranceNum: 25,
          LowerAppetiteNum: null,
          LowerToleranceNum: null,
          CustomAttributeData: {},
          SequentialId: 66,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      issue_update: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          CustomAttributeData: {},
          ParentIssueId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      issue: [
        {
          Id: 'test',
          Title: 'test',
          RaisedAtTimestamp: 'test',
          Type: ParentTypeEnum.TagType,
          DateIdentified: 'test',
          DateOccurred: 'test',
          Details: 'test',
          ImpactsCustomer: true,
          IsExternalIssue: true,
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
          SequentialId: 1,
        },
      ],
      issue_assessment: [
        {
          ParentIssueId: 'test',
          IssueType: 'test',
          Severity: 1,
          TargetCloseDate: 'test',
          ActualCloseDate: 'test',
          Status: IssueAssessmentStatusEnum.Open,
          CertifiedIndividual: 'test',
          RegulatoryBreach: true,
          Reportable: true,
          Rationale: 'test',
          IssueCausedByThirdParty: true,
          ThirdPartyResponsible: 'test',
          IssueCausedBySystemIssue: true,
          SystemResponsible: 'test',
          PolicyBreach: true,
          PoliciesBreached: 'test',
          PolicyOwner: 'test',
          PolicyOwnerCommentary: 'test',
          ModifiedByUser: 'test',
          ModifiedAtTimestamp: 'test',
          Meta: {},
          CreatedByUser: 'test',
          CreatedAtTimestamp: 'test',
          Id: 'test',
          CustomAttributeData: {},
          Type: ParentTypeEnum.TagType,
        },
      ],
      issue_status_view: [
        {
          Id: 'test',
          Status: 'test',
        },
      ],
      questionnaire_template_version: [
        {
          Id: 'test',
          Version: 'test',
          UISchema: {},
          Schema: {},
          ParentId: 'test',
          Status: QuestionnaireTemplateVersionStatusEnum.Draft,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      questionnaire_template: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      third_party: [
        {
          Id: 'test',
          Title: 'test',
          Address: 'test',
          Criticality: 1,
          Description: 'test',
          Postcode: 'test',
          PrimaryContactName: 'test',
          CityTown: 'test',
          Status: 'test',
          CompanyName: 'test',
          ContactName: 'test',
          Country: 'test',
          CompanyDomain: 'test',
          SequentialId: 1,
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      obligation_impact: [
        {
          Id: 'test',
          Description: 'test',
          ImpactRating: 1,
          ParentObligationId: 'test',
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      third_party_response: [
        {
          Id: 'test',
          ResponseData: {},
          StartDate: 'test',
          Status: ThirdPartyResponseStatusEnum.AwaitingReview,
          ParentId: 'test',
          QuestionnaireTemplateVersionId: 'test',
          RecallReason: 'test',
          ExpiresAt: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      questionnaire_invite: [
        {
          Id: 'test',
          UserEmail: 'test',
          UserId: 'test',
          Message: 'test',
          ThirdPartyResponseId: 'test',
          QuestionnaireTemplateVersionId: 'test',
          ThirdPartyId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      obligation: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          Adherence: 'test',
          SequentialId: 1,
          Type: ObligationTypeEnum.Rule,
          Interpretation: 'test',
          CustomAttributeData: {},
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      risk_score: [
        {
          RiskId: 'test',
          ResidualScore: 1,
          InherentScore: 1,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      risk: [
        {
          Id: 'test',
          Title: 'test',
          Description: 'test',
          Status: RiskStatusTypeEnum.Active,
          Tier: 3,
          Treatment: RiskTreatmentTypeEnum.Terminate,
          ParentRiskId: 'test',
          CustomAttributeData: {},
          SequentialId: 112,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      schedule_state: [
        {
          ParentId: 'test',
          DueDate: 'test',
          LatestDate: 'test',
          OverdueDate: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      schedule: [
        {
          ParentId: 'test',
          TimeToCompleteValue: 1,
          Frequency: TestFrequencyEnum.Adhoc,
          ManualDueDate: 'test',
          StartDate: 'test',
          TimeToCompleteUnit: UnitOfTimeEnum.Day,
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      auth_organisationuser: [
        {
          User_Id: 'test',
          Status: UserStatusEnum.Active,
          RoleKey: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      auth_user: [
        {
          Id: 'test',
          DisplayName: 'test',
          Email: 'test',
          FirstName: 'test',
          FriendlyName: 'test',
          LastName: 'test',
          LastSeen: 'test',
          CreatedByUser: 'test',
          CreatedOn: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
        },
      ],
      user_group: [
        {
          Id: 'test',
          Name: 'test',
          Description: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      user_group_user: [
        {
          UserGroupId: 'test',
          UserId: 'test',
          CreatedAtTimestamp: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          CreatedByUser: 'test',
        },
      ],
      form_configuration: [
        {
          ParentType: ParentTypeEnum.TagType,
          customAttributeSchema: {
            Id: 'test',
            Schema: {},
            UiSchema: {},
          },
        },
      ],
      node: [
        {
          Id: 'test',
          SequentialId: 1,
          ObjectType: 'issue',
        },
      ],
    };

    expectTypeOf(expected).toHaveProperty('acceptance_parent');
    expectTypeOf(expected).toHaveProperty('action_parent');
    expectTypeOf(expected).toHaveProperty('appetite_parent');
    expectTypeOf(expected).toHaveProperty('attestation_group');
    expectTypeOf(expected).toHaveProperty('attestation_record');
    expectTypeOf(expected).toHaveProperty('control_parent');
    expectTypeOf(expected).toHaveProperty('control_group');
    expectTypeOf(expected).toHaveProperty('indicator_parent');
    expectTypeOf(expected).toHaveProperty('issue_parent');
    expectTypeOf(expected).toHaveProperty('impact_parent');
    expectTypeOf(expected).toHaveProperty('assessment_result_parent');
    expectTypeOf(expected).toHaveProperty('document_assessment_result');
    expectTypeOf(expected).toHaveProperty('obligation_assessment_result');
    expectTypeOf(expected).toHaveProperty('risk_assessment_result');
    expectTypeOf(expected).toHaveProperty('owner');
    expectTypeOf(expected).toHaveProperty('owner_group');
    expectTypeOf(expected).toHaveProperty('contributor');
    expectTypeOf(expected).toHaveProperty('contributor_group');
    expectTypeOf(expected).toHaveProperty('department_type');
    expectTypeOf(expected).toHaveProperty('department');
    expectTypeOf(expected).toHaveProperty('tag_type');
    expectTypeOf(expected).toHaveProperty('tag_type_group');
    expectTypeOf(expected).toHaveProperty('tag');
    expectTypeOf(expected).toHaveProperty('file');
    expectTypeOf(expected).toHaveProperty('relation_file');
    expectTypeOf(expected).toHaveProperty('acceptance');
    expectTypeOf(expected).toHaveProperty('action_update');
    expectTypeOf(expected).toHaveProperty('action');
    expectTypeOf(expected).toHaveProperty('appetite');
    expectTypeOf(expected).toHaveProperty('test_result');
    expectTypeOf(expected).toHaveProperty('approval_level');
    expectTypeOf(expected).toHaveProperty('approver');
    expectTypeOf(expected).toHaveProperty('approval');
    expectTypeOf(expected).toHaveProperty('change_request');
    expectTypeOf(expected).toHaveProperty('assessment_activity');
    expectTypeOf(expected).toHaveProperty('assessment');
    expectTypeOf(expected).toHaveProperty('cause');
    expectTypeOf(expected).toHaveProperty('comment');
    expectTypeOf(expected).toHaveProperty('consequence');
    expectTypeOf(expected).toHaveProperty('conversation');
    expectTypeOf(expected).toHaveProperty('control');
    expectTypeOf(expected).toHaveProperty('document_file');
    expectTypeOf(expected).toHaveProperty('document_linked_document');
    expectTypeOf(expected).toHaveProperty('document');
    expectTypeOf(expected).toHaveProperty('enterprise_risk');
    expectTypeOf(expected).toHaveProperty('enterprise_risk_instance');
    expectTypeOf(expected).toHaveProperty('enterprise_risk_score');
    expectTypeOf(expected).toHaveProperty('impact_rating');
    expectTypeOf(expected).toHaveProperty('impact');
    expectTypeOf(expected).toHaveProperty('indicator_result');
    expectTypeOf(expected).toHaveProperty('indicator');
    expectTypeOf(expected).toHaveProperty('issue_update');
    expectTypeOf(expected).toHaveProperty('issue');
    expectTypeOf(expected).toHaveProperty('issue_assessment');
    expectTypeOf(expected).toHaveProperty('issue_status_view');
    expectTypeOf(expected).toHaveProperty('questionnaire_template_version');
    expectTypeOf(expected).toHaveProperty('questionnaire_template');
    expectTypeOf(expected).toHaveProperty('third_party');
    expectTypeOf(expected).toHaveProperty('obligation_impact');
    expectTypeOf(expected).toHaveProperty('third_party_response');
    expectTypeOf(expected).toHaveProperty('questionnaire_invite');
    expectTypeOf(expected).toHaveProperty('obligation');
    expectTypeOf(expected).toHaveProperty('risk_score');
    expectTypeOf(expected).toHaveProperty('risk');
    expectTypeOf(expected).toHaveProperty('schedule_state');
    expectTypeOf(expected).toHaveProperty('schedule');
    expectTypeOf(expected).toHaveProperty('auth_organisationuser');
    expectTypeOf(expected).toHaveProperty('auth_user');
    expectTypeOf(expected).toHaveProperty('user_group');
    expectTypeOf(expected).toHaveProperty('user_group_user');
    expectTypeOf(expected).toHaveProperty('form_configuration');
  });
});
