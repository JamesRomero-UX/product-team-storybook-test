import type { ModuleKey } from '@risksmart-app/modules/src/index';
import type { PreferenceCategory } from '@risksmart-app/shared/knock/schemas';
import { useTranslation } from 'react-i18next';

type LabelledKey = {
  label: string;
  key: string;
};

export type WorkflowTemplate = LabelledKey & {
  category?: PreferenceCategory;
  /** Module key checked via isModuleEnabled to control workflow visibility */
  moduleKey?: ModuleKey;
};

export const useWorkflows = (): WorkflowTemplate[] => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'notification_settings.workflows',
  });

  return [
    // Actions
    {
      label: st('actionNew'),
      key: 'action-insert',
      category: 'actions',
    },
    { label: st('actionUpdated'), key: 'action-update', category: 'actions' },
    { label: st('actionDeleted'), key: 'action-delete', category: 'actions' },
    { label: st('actionDue'), key: 'action-due', category: 'actions' },
    { label: st('actionOverdue'), key: 'action-overdue', category: 'actions' },

    // Controls
    { label: st('controlNew'), key: 'control-insert', category: 'controls' },
    {
      label: st('controlUpdated'),
      key: 'control-update',
      category: 'controls',
    },
    {
      label: st('controlDeleted'),
      key: 'control-delete',
      category: 'controls',
    },
    {
      label: st('controlTestOverdue'),
      key: 'control-test-overdue',
      category: 'controls',
    },
    {
      label: st('controlTestDue'),
      key: 'control-test-due',
      category: 'controls',
    },

    // Issues
    { label: st('issueNew'), key: 'issue-insert', category: 'issues' },
    { label: st('issueUpdated'), key: 'issue-update', category: 'issues' },
    { label: st('issueDeleted'), key: 'issue-delete', category: 'issues' },
    { label: st('issueDue'), key: 'issue-due', category: 'issues' },
    { label: st('issueOverdue'), key: 'issue-overdue', category: 'issues' },
    // Policy
    {
      label: st('documentReviewDue'),
      key: 'policy-document-version-review-due',
      category: 'policy',
    },
    {
      label: st('documentReviewOverdue'),
      key: 'policy-document-version-review-upcoming',
      category: 'policy',
    },
    // Documents
    { label: st('documentNew'), key: 'document-insert', category: 'policy' },
    {
      label: st('documentUpdated'),
      key: 'document-update',
      category: 'policy',
    },
    {
      label: st('documentDeleted'),
      key: 'document-delete',
      category: 'policy',
    },
    // Risks
    { label: st('riskNew'), key: 'risk-insert', category: 'risks' },
    { label: st('riskUpdated'), key: 'risk-update', category: 'risks' },
    { label: st('riskDeleted'), key: 'risk-delete', category: 'risks' },
    {
      label: st('riskAssessmentOverdue'),
      key: 'risk-assessment-overdue',
      category: 'risks',
    },
    {
      label: st('riskAssessmentDue'),
      key: 'risk-assessment-due',
      category: 'risks',
    },
    // Requests
    {
      label: st('changeRequestNew'),
      key: 'change-request-insert',
      category: 'requests',
    },
    {
      label: st('changeRequestRejected'),
      key: 'change-request-rejected',
      category: 'requests',
    },
    // Indicators
    { label: st('indicatorDue'), key: 'indicator-due', category: 'indicators' },
    // Third-party
    {
      label: st('thirdPartyResponseSubmission'),
      key: 'third-party-response-submitted',
      category: 'third-party',
      moduleKey: 'third_party',
    },
  ];
};

/**
 * Extended workflow list including all Knock workflow keys.
 * Used by the notification history feature for label lookups —
 * NOT for the notification preferences modal.
 */
export const useAllWorkflows = (): WorkflowTemplate[] => {
  const base = useWorkflows();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'notification_settings.workflows',
  });

  const extended: WorkflowTemplate[] = [
    {
      label: st('indicatorOverdue'),
      key: 'indicator-overdue',
      category: 'indicators',
    },
    {
      label: st('thirdPartyNewQuestionnaire'),
      key: 'third-party-new-questionnaire',
      category: 'third-party',
      moduleKey: 'third_party',
    },
    {
      label: st('thirdPartyRecallQuestionnaire'),
      key: 'third-party-recall-questionnaire',
      category: 'third-party',
      moduleKey: 'third_party',
    },
    {
      label: st('thirdPartyResponseUpdateStatus'),
      key: 'third-party-response-update-status',
      category: 'third-party',
      moduleKey: 'third_party',
    },
    {
      label: st('thirdPartySetPassword'),
      key: 'third-party-set-password',
      category: 'third-party',
      moduleKey: 'third_party',
    },
    {
      label: st('thirdPartyPasswordReset'),
      key: 'third-party-password-reset',
      category: 'third-party',
      moduleKey: 'third_party',
    },
    // Attestations
    {
      label: st('attestationRecordInsert'),
      key: 'attestation-record-insert',
    },
    // Documents (due/overdue)
    { label: st('documentDue'), key: 'document-due', category: 'policy' },
    {
      label: st('documentOverdue'),
      key: 'document-overdue',
      category: 'policy',
    },
    // Policy
    { label: st('policyApprover'), key: 'policy-approver', category: 'policy' },
    {
      label: st('policyAttestationReminder'),
      key: 'policy-attestation-reminder',
      category: 'policy',
    },
    // Digest
    { label: st('digest'), key: 'digest' },
  ];

  // Deduplicate by key — extended entries added only if not already in base
  const baseKeys = new Set(base.map((w) => w.key));

  return [...base, ...extended.filter((w) => !baseKeys.has(w.key))];
};
