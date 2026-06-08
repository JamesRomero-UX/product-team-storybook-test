import type { EventBridgeHandler } from 'aws-lambda';

export type DETAIL_TYPES =
  | 'IssueDue'
  | 'IssueOverdue'
  | 'ActionDue'
  | 'ActionOverdue'
  | 'ScheduleDue'
  | 'ScheduleOverdue'
  | 'PolicyAttestationReminder'
  | 'PolicyDocumentVersionReviewDue'
  | 'PolicyDocumentVersionReviewUpcoming';
export type TABLE_NAMES =
  | 'attestation_record'
  | 'issue'
  | 'issue_update'
  | 'cause'
  | 'consequence'
  | 'action'
  | 'action_update'
  | 'user_group'
  | 'user_group_user'
  | 'risk'
  | 'appetite'
  | 'indicator'
  | 'indicator_result'
  | 'acceptance'
  | 'risk_assessment_result'
  | 'control'
  | 'performance'
  | 'test_result'
  | 'document'
  | 'document_file'
  | 'third_party_response'
  | 'approver_response';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericEventHandler = EventBridgeHandler<any, any, void>;
