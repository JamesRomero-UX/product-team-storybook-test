ALTER TABLE risksmart.document ALTER COLUMN "AttestationTimeLimit" DROP NOT NULL;
ALTER TABLE risksmart.document_audit ALTER COLUMN "AttestationTimeLimit" DROP NOT NULL;
