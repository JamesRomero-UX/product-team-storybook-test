/* Update form config table PKs to include missing OrgKey */
ALTER TABLE risksmart.form_configuration_audit DROP CONSTRAINT form_configuration_audit_pkey;

ALTER TABLE risksmart.form_configuration_audit
ADD PRIMARY KEY(
    "ParentType",
    "ModifiedAtTimestamp",
    "OrgKey"
  );