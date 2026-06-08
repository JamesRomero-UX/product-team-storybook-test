import type { FC } from 'react';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import ComplianceRatingRegister from './ComplianceRatingRegister';
import InternalAuditRatingRegister from './InternalAuditRatingRegister';
import RiskRatingRegister from './RiskRatingRegister';

interface Props {
  risk: ObjectWithContributors;
}

const Tab: FC<Props> = ({ risk }) => {
  useI18NSummaryHelpContent('assessments.tabHelp');
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment', risk);
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', risk);

  return (
    <>
      <RiskRatingRegister risk={risk} />
      {complianceMonitoringEnabled &&
        canViewCompliance &&
        !canViewComplianceLoading && <ComplianceRatingRegister risk={risk} />}
      {internalAuditEnabled &&
        canViewInternalAudit &&
        !canViewInternalAuditLoading && (
          <InternalAuditRatingRegister risk={risk} />
        )}
    </>
  );
};

export default Tab;
