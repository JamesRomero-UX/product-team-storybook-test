INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'RiskManager',
        'custom_datasource',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'custom_datasource',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'custom_datasource',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'custom_datasource',
        'any',
        'delete'
    );

-- Deleting this permission in favour of custom_datasource
DELETE FROM risksmart.role_access
WHERE "ObjectType" = 'multi_reporting';