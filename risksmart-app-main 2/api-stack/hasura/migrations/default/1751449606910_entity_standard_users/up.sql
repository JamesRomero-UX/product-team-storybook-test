INSERT INTO risksmart."role_access" (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'entity',
        'any',
        'read'
    ),
    (
        'StandardEnhanced',
        'entity',
        'any',
        'read'
    ),
    (
        'ReadOnly',
        'entity',
        'any',
        'read'
    ),
    (
        'InternalAudit',
        'entity',
        'any',
        'read'
    ) ON CONFLICT DO NOTHING;