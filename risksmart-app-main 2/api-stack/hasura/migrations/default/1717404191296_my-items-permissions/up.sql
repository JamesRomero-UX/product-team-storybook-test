INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('RiskManager', 'my_items', 'any', 'read'),
    ('ReadOnly', 'my_items', 'any', 'read'),
    ('StandardEnhanced', 'my_items', 'any', 'read'),
    ('CustomerSupport', 'my_items', 'any', 'read');