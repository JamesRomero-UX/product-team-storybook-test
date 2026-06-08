INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES (
        'multi_reporting',
        'Multiple datasource reporting'
    );

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'CustomerSupport',
        'multi_reporting',
        'any',
        'read'
    );