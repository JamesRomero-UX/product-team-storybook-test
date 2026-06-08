UPDATE risksmart."organisation_module"
SET "ModuleSettings" = "ModuleSettings" #- '{internal_audit,subModules,internal_audit_entity}', "ModifiedByUser" = 'SYSTEM', "ModifiedAtTimestamp" = now();

UPDATE risksmart."organisation_module"
SET "ModuleSettings" = jsonb_set("ModuleSettings" - 'internal_audit', '{internal_audit_entity}', "ModuleSettings" -> 'internal_audit'), "ModifiedByUser" = 'SYSTEM', "ModifiedAtTimestamp" = now() + interval '1 second';

UPDATE risksmart."organisation_module"
SET "ModuleSettings" = jsonb_set("ModuleSettings", '{internal_audit_entity,allowTabConfig}', 'true'::jsonb), "ModifiedByUser" = 'SYSTEM', "ModifiedAtTimestamp" = now() + interval '2 second';