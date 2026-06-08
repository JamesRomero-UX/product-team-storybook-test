import { getItem as getActionDeleteItem } from './actionDelete';
import { getItem as getActionDueItem } from './actionDue';
import { getItem as getActionInsertItem } from './actionInsert';
import { getItem as getActionOverdueItem } from './actionOverdue';
import { getItem as getActionUpdateItem } from './actionUpdate';
import { getItem as getAttestationRecordInsertItem } from './attestationRecordInsert';
import { getItem as getChangeRequestInsertItem } from './changeRequestInsert';
import { getItem as getChangeRequestRejectedItem } from './changeRequestRejected';
import { getItem as getControlDeleteItem } from './controlDelete';
import { getItem as getControlInsertItem } from './controlInsert';
import { getItem as getControlTestDueItem } from './controlTestDue';
import { getItem as getControlTestOverdueItem } from './controlTestOverdue';
import { getItem as getControlUpdateItem } from './controlUpdate';
import { getItem as getDocumentDeleteItem } from './documentDelete';
import { getItem as getDocumentInsertItem } from './documentInsert';
import { getItem as getDocumentUpdateItem } from './documentUpdate';
import { getItem as getIndicatorDueItem } from './indicatorDue';
import { getItem as getIssueDeleteItem } from './issueDelete';
import { getItem as getIssueDueItem } from './issueDue';
import { getItem as getIssueInsertItem } from './issueInsert';
import { getItem as getIssueOverdueItem } from './issueOverdue';
import { getItem as getIssueUpdateItem } from './issueUpdate';
import { getItem as getPolicyDocumentVersionApprovalItem } from './policyApprover';
import { getItem as getPolicyAttestationReminderItem } from './policyAttestationReminder';
import { getItem as getPolicyDocumentVersionReviewDueItem } from './policyDocumentVersionReviewDue';
import { getItem as getPolicyDocumentVersionReviewUpcomingItem } from './policyDocumentVersionReviewUpcoming';
import { getItem as getRiskAssessmentDueItem } from './riskAssessmentDue';
import { getItem as getRiskAssessmentOverdueItem } from './riskAssessmentOverdue';
import { getItem as getRiskDeleteItem } from './riskDelete';
import { getItem as getRiskInsertItem } from './riskInsert';
import { getItem as getRiskUpdateItem } from './riskUpdate';
import type { NotificationGetItem } from './types';

const notifications: NotificationGetItem = {
  'risk-insert': getRiskInsertItem,
  'risk-update': getRiskUpdateItem,
  'risk-delete': getRiskDeleteItem,
  'control-insert': getControlInsertItem,
  'control-update': getControlUpdateItem,
  'control-delete': getControlDeleteItem,
  'document-insert': getDocumentInsertItem,
  'document-update': getDocumentUpdateItem,
  'document-delete': getDocumentDeleteItem,
  'issue-overdue': getIssueOverdueItem,
  'issue-due': getIssueDueItem,
  'issue-insert': getIssueInsertItem,
  'issue-update': getIssueUpdateItem,
  'issue-delete': getIssueDeleteItem,
  'action-overdue': getActionOverdueItem,
  'action-due': getActionDueItem,
  'action-insert': getActionInsertItem,
  'action-update': getActionUpdateItem,
  'action-delete': getActionDeleteItem,
  'policy-approver': getPolicyDocumentVersionApprovalItem,
  'policy-document-version-review-due': getPolicyDocumentVersionReviewDueItem,
  'policy-document-version-review-upcoming':
    getPolicyDocumentVersionReviewUpcomingItem,
  'change-request-insert': getChangeRequestInsertItem,
  'change-request-rejected': getChangeRequestRejectedItem,
  'attestation-record-insert': getAttestationRecordInsertItem,
  'policy-attestation-reminder': getPolicyAttestationReminderItem,
  'indicator-due': getIndicatorDueItem,
  'control-test-overdue': getControlTestOverdueItem,
  'risk-assessment-overdue': getRiskAssessmentOverdueItem,
  'control-test-due': getControlTestDueItem,
  'risk-assessment-due': getRiskAssessmentDueItem,
};

export default notifications;
