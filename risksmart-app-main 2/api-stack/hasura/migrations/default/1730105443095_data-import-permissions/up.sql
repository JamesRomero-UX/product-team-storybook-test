insert into risksmart."parent_type" ("Value", "Comment")
values ('data_import', 'Data Import');

INSERT INTO risksmart.role_access(
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'CustomerSupport',
        'data_import',
        'any',
        'insert'
    );