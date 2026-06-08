INSERT INTO
  risksmart.role_access ("RoleKey", "ObjectType", "ContributorType", "AccessType")
SELECT 'InternalAudit', "ObjectType", "ContributorType", "AccessType"
FROM risksmart.role_access
WHERE "RoleKey" = 'StandardEnhanced';

INSERT INTO
  risksmart.role_access ("RoleKey", "ObjectType", "ContributorType", "AccessType")
VALUES  ('InternalAudit', 'internal_audit_entity', 'any', 'delete'),
        ('InternalAudit', 'internal_audit_entity', 'any', 'insert'),
        ('InternalAudit', 'internal_audit_entity', 'any', 'read'),
        ('InternalAudit', 'internal_audit_entity', 'any', 'update'),
        ('InternalAudit', 'internal_audit_report', 'any', 'delete'),
        ('InternalAudit', 'internal_audit_report', 'any', 'insert'),
        ('InternalAudit', 'internal_audit_report', 'any', 'read'),
        ('InternalAudit', 'internal_audit_report', 'any', 'update'),
        ('InternalAudit', 'business_area', 'any', 'delete'),
        ('InternalAudit', 'business_area', 'any', 'insert'),
        ('InternalAudit', 'business_area', 'any', 'read'),
        ('InternalAudit', 'business_area', 'any', 'update');
