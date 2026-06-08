DELETE FROM risksmart.role_access
where "AccessType" in ('update', 'delete')
    AND "RoleKey" = 'ReadOnly'
    AND "ObjectType" = 'questionnaire_template';