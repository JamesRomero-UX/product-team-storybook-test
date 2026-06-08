import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

export const useGetRibbonItemVisibilities = () => {
  const approvalsEnabled = useIsModuleEnabled('approval');
  const attestationEnabled = useIsModuleEnabled(
    'document.subModules.attestation'
  );
  const actionEnabled = useIsModuleEnabled('action');
  const riskEnabled = useIsModuleEnabled('risk');
  const rcsaEnabled = useIsModuleEnabled('risk.subModules.rcsa_wizard');
  const indicatorEnabled = useIsModuleEnabled('indicator');
  const policyEnabled = useIsModuleEnabled('document');
  const assessmentEnabled = useIsModuleEnabled('assessment');
  const controlEnabled = useIsModuleEnabled('control');
  const issueEnabled = useIsModuleEnabled('issue');
  const complianceEnabled = useIsModuleEnabled('obligation');

  const { hasPermission: hasApprovalPermission, loading: isLoadingApproval } =
    useHasPermissionQuery('read:change_request', undefined, true);

  const { hasPermission: hasActionPermission, loading: isLoadingAction } =
    useHasPermissionQuery('read:action', undefined, true);
  const { hasPermission: hasRiskPermission, loading: isLoadingRisk } =
    useHasPermissionQuery('read:risk', undefined, true);
  const {
    hasPermission: hasAssessmentPermission,
    loading: isLoadingAssessment,
  } = useHasPermissionQuery('read:assessment', undefined, true);
  const { hasPermission: hasIndicatorPermission, loading: isLoadingIndicator } =
    useHasPermissionQuery('read:indicator', undefined, true);
  const { hasPermission: hasPolicyPermission, loading: isLoadingPolicy } =
    useHasPermissionQuery('read:document', undefined, true);
  const { hasPermission: hasControlPermission, loading: isLoadingControl } =
    useHasPermissionQuery('read:control', undefined, true);
  const { hasPermission: hasIssuePermission, loading: isLoadingIssue } =
    useHasPermissionQuery('read:issue', undefined, true);
  const {
    hasPermission: hasObligationPermission,
    loading: isLoadingObligation,
  } = useHasPermissionQuery('read:obligation', undefined, true);

  const isLoading =
    isLoadingApproval ||
    isLoadingAction ||
    isLoadingRisk ||
    isLoadingAssessment ||
    isLoadingIndicator ||
    isLoadingPolicy ||
    isLoadingControl ||
    isLoadingIssue ||
    isLoadingObligation;

  if (isLoading) {
    return {
      approvals: false,
      attestations: false,
      actions: false,
      risks: false,
      rcsa: false,
      indicators: false,
      policies: false,
      assessments: false,
      controls: false,
      issues: false,
      obligations: false,
    };
  }

  return {
    approvals: hasApprovalPermission && approvalsEnabled,
    attestations: attestationEnabled,
    actions: hasActionPermission && actionEnabled,
    risks: hasRiskPermission && riskEnabled,
    rcsa: hasAssessmentPermission && rcsaEnabled,
    indicators: hasIndicatorPermission && indicatorEnabled,
    policies: hasPolicyPermission && policyEnabled,
    assessments: hasAssessmentPermission && assessmentEnabled,
    controls: hasControlPermission && controlEnabled,
    issues: hasIssuePermission && issueEnabled,
    obligations: hasObligationPermission && complianceEnabled,
  };
};
