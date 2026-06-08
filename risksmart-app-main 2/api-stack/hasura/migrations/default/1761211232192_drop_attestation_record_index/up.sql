DROP INDEX IF EXISTS risksmart.idx_attestation_record_nodeid_userid_active;

CREATE UNIQUE INDEX IF NOT EXISTS idx_attestation_record_nodeid_userid_cycleid_active ON risksmart.attestation_record ("NodeId", "UserId", "Active", "CycleId")
WHERE "Active";

ALTER TABLE risksmart.attestation_record
ADD COLUMN IF NOT EXISTS "CarriedForwardFromRecordId" uuid DEFAULT NULL REFERENCES risksmart.attestation_record("Id") ON DELETE
SET NULL;