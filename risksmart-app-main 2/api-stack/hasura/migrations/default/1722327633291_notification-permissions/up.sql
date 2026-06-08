INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('notification', 'Notification');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'notification',
        'any',
        'read'
    ),
    (
        'StandardEnhanced',
        'notification',
        'any',
        'read'
    ),
    (
        'CustomerSupport',
        'notification',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'notification',
        'any',
        'read'
    );