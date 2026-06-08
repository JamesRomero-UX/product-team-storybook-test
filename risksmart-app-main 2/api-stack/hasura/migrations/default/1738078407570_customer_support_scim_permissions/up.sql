INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('scim_configuration', 'Scim Configuration');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES(
        'CustomerSupport',
        'scim_configuration',
        'any',
        'read'
    ),
    (
        'CustomerSupport',
        'scim_configuration',
        'any',
        'update'
    ),
    (
        'CustomerSupport',
        'scim_configuration',
        'any',
        'delete'
    ),
    (
        'CustomerSupport',
        'scim_configuration',
        'any',
        'insert'
    )