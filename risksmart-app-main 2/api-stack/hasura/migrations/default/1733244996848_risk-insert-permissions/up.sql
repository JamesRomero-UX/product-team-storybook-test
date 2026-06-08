INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES (
        'risk_tier_1',
        'Tier 1 risk'
    );

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'CustomerSupport',
        'risk_tier_1',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'risk_tier_1',
        'any',
        'insert'
    );