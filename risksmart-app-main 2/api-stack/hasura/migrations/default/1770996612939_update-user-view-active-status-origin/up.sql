CREATE
OR REPLACE VIEW "risksmart"."user_view_active" AS
SELECT
  u."Id",
  u."FirstName",
  u."LastName",
  u."Email",
  u."UserName",
  u."BusinessUnit_Id",
  u."RoleKey",
  o."OrgKey",
  o."Status",
  u."JobTitle",
  u."Department",
  u."OfficeLocation",
  u."LastSeen",
  u."FriendlyName",
  u."IsCustomerSupport",
  u."AuthConnection"
FROM
  (
    auth."user" u
      JOIN auth.organisationuser o ON ((u."Id" = o."User_Id"))
    );

ALTER VIEW risksmart.user_view_active
SET (security_invoker = true);