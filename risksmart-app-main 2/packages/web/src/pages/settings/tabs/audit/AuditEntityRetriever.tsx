import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import AcceptanceAudit from './AcceptanceAudit';
import ActionAudit from './ActionAudit';
import AppetiteAudit from './AppetiteAudit';
import ApprovalAudit from './ApprovalAudit';
import AssessmentActivityAudit from './AssessmentActivityAudit';
import AssessmentAudit from './AssessmentAudit';
import AssessmentResultParentAudit from './AssessmentResultParentAudit';
import CauseAudit from './CauseAudit';
import ChangeRequestAudit from './ChangeRequestAudit';
import CommentAudit from './CommentAudit';
import ConsequenceAudit from './ConsequenceAudit';
import ControlAudit from './ControlAudit';
import ConversationAudit from './ConversationAudit';
import CustomAttributeSchemaAudit from './CustomAttributeSchemaAudit';
import CustomRibbonAudit from './CustomRibbonAudit';
import DashboardAudit from './DashboardAudit';
import DocumentAssessmentResultAudit from './DocumentAssessmentResultAudit';
import DocumentAudit from './DocumentAudit';
import DocumentFileAudit from './DocumentFileAudit';
import FileAudit from './FileAudit';
import ImpactAudit from './ImpactAudit';
import ImpactRatingAudit from './ImpactRatingAudit';
import IndicatorAudit from './IndicatorAudit';
import IndicatorResultAudit from './IndicatorResultAudit';
import IssueAssessmentAudit from './IssueAssessmentAudit';
import IssueAudit from './IssueAudit';
import IssueUpdateAudit from './IssueUpdateAudit';
import LinkedItemAudit from './LinkedItemAudit';
import ObligationAssessmentResultAudit from './ObligationAssessmentResultAudit';
import ObligationAudit from './ObligationAudit';
import ObligationImpactAudit from './ObligationImpactAudit';
import RiskAssessmentResultAudit from './RiskAssessmentResultAudit';
import RiskAssessmentResultConfigAudit from './RiskAssessmentResultConfigAudit';
import RiskAssessmentResultImpactAudit from './RiskAssessmentResultImpactAudit';
import RiskAudit from './RiskAudit';
import type { AuditEntityRetrieverInput } from './types';

const EntityMap = {
  [Parent_Type_Enum.Acceptance.toString()]: AcceptanceAudit,
  [Parent_Type_Enum.Appetite]: AppetiteAudit,
  ['approval']: ApprovalAudit,
  [Parent_Type_Enum.AssessmentActivity]: AssessmentActivityAudit,
  [Parent_Type_Enum.Assessment]: AssessmentAudit,
  ['assessment_result_parent']: AssessmentResultParentAudit,
  [Parent_Type_Enum.Action]: ActionAudit,
  [Parent_Type_Enum.Cause]: CauseAudit,
  [Parent_Type_Enum.ChangeRequest]: ChangeRequestAudit,
  ['comment']: CommentAudit,
  [Parent_Type_Enum.Consequence]: ConsequenceAudit,
  [Parent_Type_Enum.Control]: ControlAudit,
  [Parent_Type_Enum.Conversation]: ConversationAudit,
  [Parent_Type_Enum.CustomAttributeSchema]: CustomAttributeSchemaAudit,
  [Parent_Type_Enum.CustomRibbon]: CustomRibbonAudit,
  [Parent_Type_Enum.Dashboard]: DashboardAudit,
  [Parent_Type_Enum.DocumentAssessmentResult]: DocumentAssessmentResultAudit,
  [Parent_Type_Enum.Document]: DocumentAudit,
  [Parent_Type_Enum.DocumentFile]: DocumentFileAudit,
  ['file']: FileAudit,
  [Parent_Type_Enum.Impact]: ImpactAudit,
  [Parent_Type_Enum.ImpactRating]: ImpactRatingAudit,
  ['indicator_audit']: IndicatorAudit,
  [Parent_Type_Enum.IndicatorResult]: IndicatorResultAudit,
  [Parent_Type_Enum.IssueAssessment]: IssueAssessmentAudit,
  [Parent_Type_Enum.Issue]: IssueAudit,
  [Parent_Type_Enum.IssueUpdate]: IssueUpdateAudit,
  [Parent_Type_Enum.Obligation]: ObligationAudit,
  [Parent_Type_Enum.ObligationImpact]: ObligationImpactAudit,
  [Parent_Type_Enum.ObligationAssessmentResult]:
    ObligationAssessmentResultAudit,
  [Parent_Type_Enum.RiskAssessmentResult]: RiskAssessmentResultAudit,
  [Parent_Type_Enum.RiskAssessmentResultImpact]:
    RiskAssessmentResultImpactAudit,
  [Parent_Type_Enum.LinkedItem]: LinkedItemAudit,
  [Parent_Type_Enum.Risk]: RiskAudit,
  [Parent_Type_Enum.RiskAssessmentResultConfig]:
    RiskAssessmentResultConfigAudit,
};

export const AuditEntityRetriever = (input: AuditEntityRetrieverInput) => {
  const Component = EntityMap[input?.entityType];

  return (
    <>
      {input?.entityType && Component ? (
        <Component {...input} />
      ) : (
        <>
          {input.entityType}
          {' detailed audit not currently supported.'}
        </>
      )}
    </>
  );
};
