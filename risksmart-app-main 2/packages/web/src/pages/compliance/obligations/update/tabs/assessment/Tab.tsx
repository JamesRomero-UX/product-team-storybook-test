import type { FC } from 'react';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import ComplianceObligationRatingRegister from './ComplianceObligationRatingRegister';
import InternalAuditObligationRatingRegister from './InternalAuditObligationRatingRegister';
import ObligationRatingRegister from './ObligationRatingRegister';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment', parent);
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', parent);

  return (
    <>
      <ObligationRatingRegister parent={parent} />
      {complianceMonitoringEnabled &&
        canViewCompliance &&
        !canViewComplianceLoading && (
          <ComplianceObligationRatingRegister parent={parent} />
        )}
      {internalAuditEnabled &&
        canViewInternalAudit &&
        !canViewInternalAuditLoading && (
          <InternalAuditObligationRatingRegister parent={parent} />
        )}
    </>
  );
};

export default Tab;
