INSERT INTO risksmart.role_access (
  "RoleKey",
  "ObjectType",
  "ContributorType",
  "AccessType"
)
VALUES (
         'InternalAudit',
         'issue',
         'owner',
         'read'
       ),
       (
         'InternalAudit',
         'issue',
         'contributor',
         'read'
       );
