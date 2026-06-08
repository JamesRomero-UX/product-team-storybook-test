ALTER TABLE risksmart.internal_audit_report
ALTER COLUMN "Summary" DROP NOT NULL;

ALTER TABLE risksmart.internal_audit_report_audit
ALTER COLUMN "Summary" DROP NOT NULL;