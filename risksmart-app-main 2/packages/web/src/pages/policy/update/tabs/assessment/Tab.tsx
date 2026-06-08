import type { FC } from 'react';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import ComplianceMonitoringDocumentRatingRegister from './ComplianceMonitoringDocumentRatingRegister';
import DocumentRatingRegister from './DocumentRatingRegister';
import InternalAuditDocumentRatingRegister from './InternalAuditDocumentRatingRegister';

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
      <DocumentRatingRegister parent={parent} />
      {complianceMonitoringEnabled &&
        canViewCompliance &&
        !canViewComplianceLoading && (
          <ComplianceMonitoringDocumentRatingRegister parent={parent} />
        )}
      {internalAuditEnabled &&
        canViewInternalAudit &&
        !canViewInternalAuditLoading && (
          <InternalAuditDocumentRatingRegister parent={parent} />
        )}
    </>
  );
};

export default Tab;
