-- Add OrgKey to the third_party_contact_audit primary key to allow multiple
-- audit rows when the same user's contacts across different orgs are updated
-- in a single statement (e.g. PostChangePassword setting PasswordSetAtTimestamp).
ALTER TABLE risksmart.third_party_contact_audit
  DROP CONSTRAINT third_party_contact_audit_pkey;

ALTER TABLE risksmart.third_party_contact_audit
  ADD CONSTRAINT third_party_contact_audit_pkey
  PRIMARY KEY ("Id", "OrgKey", "ModifiedAtTimestamp");
