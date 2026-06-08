INSERT INTO risksmart."role_access" (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES -- Control Groups
    ('Standard', 'control_group', 'any', 'read'),
    ('Standard', 'control_group', 'owner', 'update'),
    ('Standard', 'control_group', 'owner', 'delete'),
    (
        'Standard',
        'control_group',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'control_group',
        'contributor',
        'delete'
    ),
    -- Read access to all risks
    ('Standard', 'risk', 'any', 'read');