
DROP FUNCTION IF EXISTS risksmart.document_file_public_status();

DELETE FROM risksmart.version_status WHERE "Value" IN ('review_due')

DROP TABLE "risksmart"."dashboard";

DROP VIEW risksmart.audit_log;

CREATE OR REPLACE VIEW risksmart.audit_log AS
SELECT json_data->>'Action' AS "Action",
  (json_data->>'ModifiedByUser') AS "ModifiedByUser",
  (json_data->>'ModifiedAtTimestamp')::TIMESTAMPTZ AS "ModifiedAtTimestamp",
  (json_data->>'OrgKey') As "OrgKey",
  json_data AS "ObjectData",
  object_type AS "ObjectType"
FROM risksmart.get_audit_tables_json()
ORDER BY "ModifiedAtTimestamp" DESC;

DROP FUNCTION IF EXISTS risksmart.get_audit_log_description;

DROP FUNCTION IF EXISTS risksmart.get_audit_log_id_field;
DROP TABLE IF EXISTS auth.user_activity_audit;

CREATE OR REPLACE FUNCTION risksmart.get_audit_tables_json() RETURNS TABLE(json_data JSON, object_type TEXT) AS $$
DECLARE table_record RECORD;

query TEXT;

modified_table_name TEXT;

BEGIN FOR table_record IN
SELECT table_schema,
  table_name
FROM information_schema.tables
WHERE table_schema = 'risksmart'
  AND table_name LIKE '%_audit'
  AND table_name not in ('') -- exclude any tables here that you don't want to be shown in the central audit log 
  LOOP modified_table_name := left(
    table_record.table_name,
    length(table_record.table_name) - 6
  );

query := format(
  'SELECT row_to_json(t) AS json_data, %L AS object_type FROM (SELECT * FROM %I.%I) t',
  modified_table_name,
  table_record.table_schema,
  table_record.table_name
);

RETURN QUERY EXECUTE query;

END LOOP;

END;

$$ LANGUAGE plpgsql;
DROP VIEW IF EXISTS risksmart.audit_log;

DROP FUNCTION IF EXISTS risksmart.get_audit_tables_json();
DROP INDEX IF EXISTS "risksmart"."risk_register_index";
