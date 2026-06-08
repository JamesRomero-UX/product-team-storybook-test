DELETE FROM risksmart.role_access
       WHERE "RoleKey" = 'InternalAudit' AND
             "ObjectType" IN
             ('internal_audit_entity', 'internal_audit_report');

INSERT INTO
  risksmart.role_access ("RoleKey", "ObjectType", "ContributorType", "AccessType")
VALUES
  ('InternalAudit', 'internal_audit_entity', 'any', 'insert'),
  ('InternalAudit', 'internal_audit_entity', 'owner', 'delete'),
  ('InternalAudit', 'internal_audit_entity', 'contributor', 'delete'),
  ('InternalAudit', 'internal_audit_entity', 'owner', 'read'),
  ('InternalAudit', 'internal_audit_entity', 'contributor', 'read'),
  ('InternalAudit', 'internal_audit_entity', 'owner', 'update'),
  ('InternalAudit', 'internal_audit_entity', 'contributor', 'update'),
  ('InternalAudit', 'internal_audit_report', 'owner', 'insert'),
  ('InternalAudit', 'internal_audit_report', 'contributor', 'insert'),
  ('InternalAudit', 'internal_audit_report', 'owner', 'delete'),
  ('InternalAudit', 'internal_audit_report', 'contributor', 'delete'),
  ('InternalAudit', 'internal_audit_report', 'owner', 'read'),
  ('InternalAudit', 'internal_audit_report', 'contributor', 'read'),
  ('InternalAudit', 'internal_audit_report', 'owner', 'update'),
  ('InternalAudit', 'internal_audit_report', 'contributor', 'update');
