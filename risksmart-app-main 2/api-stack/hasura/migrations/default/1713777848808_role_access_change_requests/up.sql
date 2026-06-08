INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('ReadOnly', 'change_request', 'any', 'read'),
    ('RiskManager', 'change_request', 'any', 'read'),
    ('RiskManager', 'change_request', 'any', 'delete'),
    ('RiskManager', 'change_request', 'any', 'insert'),
    ('Standard', 'change_request', 'any', 'read'),
    ('Standard', 'change_request', 'any', 'insert');
