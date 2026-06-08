import type { GetControlByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import ComplianceMonitoringPerformanceRatingRegister from './ComplianceMonitoringPerformanceRatingRegister';
import InternalAuditPerformanceRatingRegister from './InternalAuditPerformanceRatingRegister';
import PerformanceRatingRegister from './PerformanceRatingRegister';

type Props = {
  control: GetControlByIdQuery['control'][number];
};

const Tab: FC<Props> = ({ control }) => {
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment', control);
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', control);

  return (
    <>
      <PerformanceRatingRegister control={control} />
      {complianceMonitoringEnabled &&
        canViewCompliance &&
        !canViewComplianceLoading && (
          <ComplianceMonitoringPerformanceRatingRegister control={control} />
        )}
      {internalAuditEnabled &&
        canViewInternalAudit &&
        !canViewInternalAuditLoading && (
          <InternalAuditPerformanceRatingRegister control={control} />
        )}
    </>
  );
};

export default Tab;
