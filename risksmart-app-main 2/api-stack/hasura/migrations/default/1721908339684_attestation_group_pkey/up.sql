ALTER TABLE risksmart.attestation_group ADD PRIMARY KEY ("GroupId", "ConfigId");
ALTER TABLE risksmart.attestation_group_audit ADD PRIMARY KEY ("GroupId", "ConfigId", "ModifiedAtTimestamp");
