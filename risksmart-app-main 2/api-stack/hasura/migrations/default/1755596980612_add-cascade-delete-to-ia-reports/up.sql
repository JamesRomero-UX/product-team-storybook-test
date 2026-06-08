ALTER TABLE risksmart.internal_audit_result_parent DROP CONSTRAINT "internal_audit_result_parent_ParentId_fkey";

ALTER TABLE risksmart.internal_audit_result_parent
ADD FOREIGN KEY ("ParentId") REFERENCES risksmart.node ON DELETE CASCADE;