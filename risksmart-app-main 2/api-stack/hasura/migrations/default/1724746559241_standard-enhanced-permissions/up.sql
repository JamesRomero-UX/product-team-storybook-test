/* Give StandardEnhanced all the permissions that Standard does */
insert into risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
select 'StandardEnhanced',
    ra."ObjectType",
    ra."ContributorType",
    ra."AccessType"
from risksmart.role_access ra
where ra."RoleKey" = 'Standard'
except
select 'StandardEnhanced',
    ra."ObjectType",
    ra."ContributorType",
    ra."AccessType"
from risksmart.role_access ra
where ra."RoleKey" = 'StandardEnhanced'