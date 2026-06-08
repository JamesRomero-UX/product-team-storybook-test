CREATE OR REPLACE FUNCTION risksmart.tag_all_objects(org_key text, tag_type_id uuid) RETURNS void AS $$ BEGIN
INSERT INTO risksmart.tag(
        "ParentId",
        "TagTypeId",
        "ModifiedAtTimestamp",
        "OrgKey",
        "ModifiedByUser",
        "CreatedByUser",
        "CreatedAtTimestamp"
    )
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.assessment
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.risk
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.control
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.action
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.indicator
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.issue
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.document
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.obligation
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.third_party
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.internal_audit_report
WHERE "OrgKey" = org_key
UNION ALL
SELECT "Id",
    tag_type_id,
    now(),
    org_key,
    'SYSTEM',
    'SYSTEM',
    now()
FROM risksmart.compliance_monitoring_assessment
WHERE "OrgKey" = org_key ON CONFLICT DO NOTHING;

END $$ LANGUAGE plpgsql VOLATILE;