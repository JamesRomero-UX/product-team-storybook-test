ALTER TABLE risksmart.attestation_record ALTER COLUMN "ExpiresAt" DROP NOT NULL;
ALTER TABLE risksmart.attestation_record_audit ALTER COLUMN "ExpiresAt" DROP NOT NULL;
