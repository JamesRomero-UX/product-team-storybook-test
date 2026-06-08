DROP VIEW risksmart.audit_log;

CREATE VIEW risksmart.audit_log AS SELECT get_audit_tables_json.json_data ->> 'Action'::text AS "Action",
    get_audit_tables_json.json_data ->> 'ModifiedByUser'::text AS "ModifiedByUser",
    (get_audit_tables_json.json_data ->> 'ModifiedAtTimestamp'::text)::timestamp with time zone AS "ModifiedAtTimestamp",
    get_audit_tables_json.json_data ->> 'OrgKey'::text AS "OrgKey",
    get_audit_tables_json.json_data AS "ObjectData",
    get_audit_tables_json.object_type AS "ObjectType",
    risksmart.get_audit_log_description(get_audit_tables_json.json_data, get_audit_tables_json.object_type) AS "Item",
    risksmart.get_audit_log_id_field(get_audit_tables_json.json_data, get_audit_tables_json.object_type)::uuid AS "Id",
    (get_audit_tables_json.json_data ->> 'Id')::uuid AS "ObjectId"
   FROM risksmart.get_audit_tables_json() get_audit_tables_json(json_data, object_type)
  ORDER BY ((get_audit_tables_json.json_data ->> 'ModifiedAtTimestamp'::text)::timestamp with time zone) DESC;

