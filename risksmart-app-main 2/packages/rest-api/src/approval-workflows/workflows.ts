import type { WorkflowId } from '@risksmart-app/shared/approvals/workflows';

import type {
  Action,
  ApprovalWorkflowDefinition,
} from '../services/approval/requireApprovalService';
import closeAction from './close-action.workflow';
import closeIssueAssessment from './close-issue-assessment.workflow';
import deleteAcceptance from './delete-acceptance.workflow';
import deleteAction from './delete-action.workflow';
import deleteControl from './delete-control.workflow';
import deleteIssue from './delete-issue.workflow';
import deleteRisk from './delete-risk.workflow';
import openAcceptance from './open-acceptance.workflow';
import publishDocumentVersion from './publish-document-version.workflow';
import updateActionDetails from './update-action-details.workflow';
import updateActionTargetCloseDate from './update-action-target-close-date.workflow';
import updateControlDetails from './update-control-details.workflow';
import updateIssueAssessmentTargetCloseDate from './update-issue-assessment-target-close-date.workflow';
import updateRiskDetails from './update-risk-details.workflow';

export const workflows = {
  'close-action': closeAction,
  'close-issue-assessment': closeIssueAssessment,
  'delete-acceptance': deleteAcceptance,
  'delete-action': deleteAction,
  'delete-control': deleteControl,
  'delete-issue': deleteIssue,
  'delete-risk': deleteRisk,
  'open-acceptance': openAcceptance,
  'publish-document-version': publishDocumentVersion,
  'update-risk-details': updateRiskDetails,
  'update-action-details': updateActionDetails,
  'update-control-details': updateControlDetails,
  'update-issue-assessment-target-close-date':
    updateIssueAssessmentTargetCloseDate,
  'update-action-target-close-date': updateActionTargetCloseDate,
} satisfies Record<
  WorkflowId,
  (tenant: string) => ApprovalWorkflowDefinition<Action>
>;
