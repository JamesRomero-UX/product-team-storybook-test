ALTER TABLE risksmart."obligation_change_audit" DROP CONSTRAINT obligation_change_audit_pkey;

ALTER TABLE risksmart."obligation_change_audit"
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart."obligation_change_attestation_audit" DROP CONSTRAINT obligation_change_attestation_audit_pkey;

ALTER TABLE risksmart."obligation_change_attestation_audit"
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");