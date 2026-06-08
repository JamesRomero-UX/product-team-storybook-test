insert into risksmart.parent_type ("Value", "Comment")
values (
        'third_party',
        'Third Party'
    );

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES
    -- Create
    ('RiskManager', 'third_party', 'any', 'insert'),
    ('CustomerSupport', 'third_party', 'any', 'insert'),

    -- Read
    ('InternalAudit', 'third_party', 'any', 'read'),
    ('ReadOnly', 'third_party', 'any', 'read'),
    ('RiskManager', 'third_party', 'any', 'read'),
    ('CustomerSupport', 'third_party', 'any', 'read'),

    -- Update
    ('RiskManager', 'third_party', 'any', 'update'),
    ('CustomerSupport', 'third_party', 'any', 'update'),

    -- Delete
    ('RiskManager', 'third_party', 'any', 'delete'),
    ('CustomerSupport', 'third_party', 'any', 'delete');
