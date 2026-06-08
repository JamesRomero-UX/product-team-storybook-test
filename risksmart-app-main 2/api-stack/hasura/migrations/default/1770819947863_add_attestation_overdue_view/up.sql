
INSERT INTO risksmart.attestation_record_status ("Value", "Comment") VALUES ('overdue', 'Overdue');

CREATE VIEW risksmart.attestation_record_status_view WITH (security_invoker = true) AS
SELECT "Id", "OrgKey",
       CASE
           WHEN "AttestationStatus" = 'pending' AND "Active" = true AND "ExpiresAt" < NOW() THEN 'overdue'
           ELSE "AttestationStatus"
       END AS "Status"
FROM risksmart.attestation_record;
