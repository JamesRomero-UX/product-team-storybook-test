drop table if exists risksmart.roles;

-- New customer support role with same access as RiskManager
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
SELECT 'CustomerSupport',
    ra."ObjectType",
    ra."ContributorType",
    ra."AccessType"
FROM risksmart.role_access ra
WHERE ra."RoleKey" = 'RiskManager';

INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('taxonomy', 'Taxonomy');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES('CustomerSupport', 'taxonomy', 'any', 'read'),
    ('CustomerSupport', 'taxonomy', 'any', 'update'),
    ('CustomerSupport', 'taxonomy', 'any', 'delete'),
    ('CustomerSupport', 'taxonomy', 'any', 'insert')