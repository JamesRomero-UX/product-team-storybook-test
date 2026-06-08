import { getIssueUrl } from '@/components/notifications-list/notification-types/issueUtils';

import {
  actionDetailsUrl,
  controlDetailsUrl,
  indicatorDetailsUrl,
  policyDetailsUrl,
  publicPolicyFileUrl,
  questionnaireResponseDetailsUrl,
  riskDetailsUrl,
  thirdPartyDetailsUrl,
} from './urls';

/**
 * Maps a Knock workflow key and its data payload to an app object URL.
 * Returns null if the workflow has no direct object link (e.g. delete workflows,
 * change requests, digest) or if the required object ID is missing.
 */
export const resolveNotificationUrl = (
  workflowKey: string,
  data: Record<string, unknown>
): string | null => {
  const objectId = data.objectId as string | null | undefined;
  const parentObjectId = data.parentObjectId as string | null | undefined;

  // Delete workflows always return null. Existing notification-list handlers may
  // produce an audit search URL for deletes, but the resolver intentionally does
  // not replicate that behavior -- deleted objects have no detail page to link to.
  if (workflowKey.endsWith('-delete')) {
    return null;
  }

  // Change request workflows link to register with filter, not a direct object
  if (workflowKey.startsWith('change-request-')) {
    return null;
  }

  // Digest is a system workflow with no object link
  if (workflowKey === 'digest') {
    return null;
  }

  // Attestation workflows need parentObjectId and objectId
  if (
    workflowKey === 'policy-attestation-reminder' ||
    workflowKey === 'attestation-record-insert'
  ) {
    if (!parentObjectId || !objectId) {
      return null;
    }

    return publicPolicyFileUrl(parentObjectId, objectId);
  }

  // Third-party response workflows use questionnaire response URL
  if (
    workflowKey === 'third-party-response-submitted' ||
    workflowKey === 'third-party-response-update-status'
  ) {
    if (!objectId) {
      return null;
    }

    return questionnaireResponseDetailsUrl(
      objectId,
      parentObjectId ?? undefined
    );
  }

  // Third-party workflows (non-response) use third-party details URL.
  // This includes `third-party-set-password` and `third-party-password-reset`,
  // which are vendor-facing workflows that trigger an admin notification linking
  // to the third-party record so the admin can review the vendor's access.
  if (workflowKey.startsWith('third-party-')) {
    if (!objectId) {
      return null;
    }

    return thirdPartyDetailsUrl(objectId);
  }

  // Issue workflows resolve using issuePath data field
  if (workflowKey.startsWith('issue-')) {
    if (!objectId) {
      return null;
    }
    const issuePath =
      (data.issuePath as Parameters<typeof getIssueUrl>[0]) ?? 'issues';

    return getIssueUrl(issuePath, objectId);
  }

  // All remaining workflows require an objectId
  if (!objectId) {
    return null;
  }

  // Risk workflows (including risk-assessment-*)
  if (workflowKey.startsWith('risk-')) {
    return riskDetailsUrl(objectId);
  }

  // Action workflows
  if (workflowKey.startsWith('action-')) {
    return actionDetailsUrl(objectId);
  }

  // Control workflows (including control-test-*)
  if (workflowKey.startsWith('control-')) {
    return controlDetailsUrl(objectId);
  }

  // Document workflows
  if (workflowKey.startsWith('document-')) {
    return policyDetailsUrl(objectId);
  }

  // Indicator workflows
  if (workflowKey.startsWith('indicator-')) {
    return indicatorDetailsUrl(objectId);
  }

  // Policy workflows
  if (workflowKey.startsWith('policy-')) {
    return policyDetailsUrl(objectId);
  }

  // Unknown workflow key
  return null;
};
