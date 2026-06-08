INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'RiskManager',
        'attestation_cycle',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'attestation_cycle',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'attestation_cycle',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'attestation_cycle',
        'any',
        'delete'
    ) ON CONFLICT DO NOTHING;