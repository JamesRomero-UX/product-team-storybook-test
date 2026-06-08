-- New technical support role with same access as Public + scim configuration
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
SELECT 'TechnicalSupport',
    ra."ObjectType",
    ra."ContributorType",
    ra."AccessType"
FROM risksmart.role_access ra
WHERE ra."RoleKey" = 'Public';

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES(
        'TechnicalSupport',
        'scim_configuration',
        'any',
        'read'
    ),
    (
        'TechnicalSupport',
        'scim_configuration',
        'any',
        'update'
    ),
    (
        'TechnicalSupport',
        'scim_configuration',
        'any',
        'delete'
    ),
    (
        'TechnicalSupport',
        'scim_configuration',
        'any',
        'insert'
    ),
    (
        'TechnicalSupport',
        'settings',
        'any',
        'read'
    )