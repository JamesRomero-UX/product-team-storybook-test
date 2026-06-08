UPDATE risksmart.change_request
SET
  "Changes" = jsonb_insert("Changes", '{1}', to_jsonb("OrgKey"), false),
  "ModifiedAtTimestamp" = now(),
  "ModifiedByUser" = 'SYSTEM';
