UPDATE risksmart."organisation_module"
SET "ModuleSettings" = jsonb_set(
    "ModuleSettings" #- '{obligation,subModules,compliance_monitoring}',
    '{obligation,subModules,compliance_monitoring_assessment}',
    "ModuleSettings" #> '{obligation,subModules,compliance_monitoring}'
), 
"ModifiedByUser" = 'SYSTEM', 
"ModifiedAtTimestamp" = now()
WHERE "ModuleSettings" #> '{obligation,subModules,compliance_monitoring}' IS NOT NULL;

UPDATE risksmart."organisation_module"
SET "ModuleSettings" = jsonb_set("ModuleSettings", '{obligation,subModules,compliance_monitoring_assessment,allowTabConfig}', 'true'::jsonb), "ModifiedByUser" = 'SYSTEM', "ModifiedAtTimestamp" = now() + interval '1 second'
WHERE "ModuleSettings" #> '{obligation,subModules,compliance_monitoring_assessment}' IS NOT NULL;