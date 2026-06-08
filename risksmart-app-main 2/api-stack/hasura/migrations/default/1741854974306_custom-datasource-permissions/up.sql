insert into risksmart.parent_type("Value", "Comment")
VALUES ('custom_datasource', 'CustomDatasource');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'CustomerSupport',
        'custom_datasource',
        'any',
        'insert'
    ),
    (
        'CustomerSupport',
        'custom_datasource',
        'any',
        'read'
    ),
    (
        'CustomerSupport',
        'custom_datasource',
        'any',
        'update'
    ),
    (
        'CustomerSupport',
        'custom_datasource',
        'any',
        'delete'
    );

;