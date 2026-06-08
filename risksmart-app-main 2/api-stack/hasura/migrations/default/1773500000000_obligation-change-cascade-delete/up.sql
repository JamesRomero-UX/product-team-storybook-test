ALTER TABLE risksmart.obligation_change_attestation
DROP CONSTRAINT IF EXISTS "obligation_change_attestation_ObligationChangeId_fkey";

ALTER TABLE risksmart.obligation_change_attestation
ADD CONSTRAINT "obligation_change_attestation_ObligationChangeId_fkey"
FOREIGN KEY ("ObligationChangeId") REFERENCES risksmart.obligation_change("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.obligation_change
DROP CONSTRAINT IF EXISTS "obligation_change_ObligationId_fkey";

ALTER TABLE risksmart.obligation_change
ADD CONSTRAINT "obligation_change_ObligationId_fkey"
FOREIGN KEY ("ObligationId") REFERENCES risksmart.obligation("Id") ON DELETE CASCADE;
