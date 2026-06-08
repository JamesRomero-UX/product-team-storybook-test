-- this syntax is wrong and is missing the risksmart schema prefix. 
-- superceded by migration 1761211232192_drop_attestation_record_index
DROP INDEX IF EXISTS idx_attestation_record_nodeid_userid_active;

CREATE UNIQUE INDEX idx_attestation_record_nodeid_userid_cycleid_active ON risksmart.attestation_record ("NodeId", "UserId", "Active", "CycleId")
WHERE "Active";