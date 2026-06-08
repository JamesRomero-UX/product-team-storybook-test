/* Update form config table PKs to include missing OrgKey */
ALTER TABLE risksmart.form_field_ordering_audit DROP CONSTRAINT form_field_configuration_audit_pkey;

ALTER TABLE risksmart.form_field_ordering_audit
ADD PRIMARY KEY(
    "FormConfigurationParentType",
    "FieldId",
    "ModifiedAtTimestamp",
    "OrgKey"
  );

ALTER TABLE risksmart.form_field_configuration_audit DROP CONSTRAINT form_field_configuration_audit_pkey1;

ALTER TABLE risksmart.form_field_configuration_audit
ADD PRIMARY KEY(
    "FormConfigurationParentType",
    "FieldId",
    "ModifiedAtTimestamp",
    "OrgKey"
  );

/* newFiles fields are no longer present in forms. This migration updates the field IDs to 'files' 
 to ensure no config/ordering is lost */
UPDATE risksmart.form_field_configuration
SET "FieldId" = 'files',
  "ModifiedAtTimestamp" = now(),
  "ModifiedByUser" = 'SYSTEM'
WHERE "FieldId" = 'newFiles';

UPDATE risksmart.form_field_ordering
SET "FieldId" = 'files',
  "ModifiedAtTimestamp" = now(),
  "ModifiedByUser" = 'SYSTEM'
WHERE "FieldId" = 'newFiles';