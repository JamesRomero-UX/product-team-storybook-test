
DELETE FROM risksmart.attestation_record AS t1
USING risksmart.attestation_record AS t2
WHERE t1."Id" != t2."Id"
   AND t1."NodeId" = t2."NodeId"
   AND t1."UserId" = t2."UserId"
   AND t1."Active" = t2."Active";

CREATE UNIQUE INDEX idx_attestation_record_nodeid_userid_active ON risksmart.attestation_record ("NodeId", "UserId", "Active") WHERE "Active";
