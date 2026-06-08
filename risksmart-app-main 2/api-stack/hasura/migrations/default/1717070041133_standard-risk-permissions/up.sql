DELETE FROM risksmart."role_access"
WHERE "RoleKey" = 'Standard'
    AND "ObjectType" = 'risk'
    AND "ContributorType" = 'any';
