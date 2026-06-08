insert into risksmart."parent_type" ("Value", "Comment")
values ('data_export', 'Data Export');

INSERT INTO risksmart.role_access(
  "RoleKey",
  "ObjectType",
  "ContributorType",
  "AccessType"
)
VALUES (
         'CustomerSupport',
         'data_export',
         'any',
         'read'
       ),
       (
         'RiskManager',
         'data_export',
         'any',
         'read'
       );
