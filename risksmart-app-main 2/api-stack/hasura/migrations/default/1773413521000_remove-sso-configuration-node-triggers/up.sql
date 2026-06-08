-- Remove node triggers and foreign key from sso_configuration
-- sso_configuration does not need to be linked to the node table

DROP TRIGGER IF EXISTS node_insert_trigger ON risksmart.sso_configuration;

DROP TRIGGER IF EXISTS node_delete_trigger ON risksmart.sso_configuration;

ALTER TABLE risksmart.sso_configuration
DROP CONSTRAINT IF EXISTS "sso_configuration_id_fkey";
