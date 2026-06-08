insert into risksmart."parent_type" ("Value", "Comment")
values ('audit', 'Audit entities');

INSERT INTO risksmart.role_access(
  "RoleKey",
  "ObjectType",
  "ContributorType",
  "AccessType"
)
VALUES (
         'CustomerSupport',
         'audit',
         'any',
         'read'
       );
