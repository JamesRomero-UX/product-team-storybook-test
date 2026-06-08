DROP VIEW IF EXISTS risksmart.attestation_record_status_view;
DELETE FROM risksmart.attestation_record_status WHERE "Value" = 'overdue';
