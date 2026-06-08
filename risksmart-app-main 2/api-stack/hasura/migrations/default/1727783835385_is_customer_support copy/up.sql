DROP VIEW risksmart.user_view_active;

ALTER TABLE auth.user DROP COLUMN "IsCustomerSupport";

ALTER TABLE auth.user
ADD COLUMN "IsCustomerSupport" boolean GENERATED ALWAYS AS (
        CASE
            WHEN "AuthConnection" ilike 'AzureAD-RiskSmart-%' THEN TRUE
            ELSE FALSE
        END
    ) STORED;

CREATE OR REPLACE VIEW risksmart.user_view_active AS
SELECT u."Id",
    u."FirstName",
    u."LastName",
    u."Email",
    u."UserName",
    u."BusinessUnit_Id",
    u."RoleKey",
    o."OrgKey",
    u."Status",
    u."JobTitle",
    u."Department",
    u."OfficeLocation",
    u."LastSeen",
    u."FriendlyName",
    u."IsCustomerSupport"
FROM auth.user u
    JOIN auth.organisationuser o ON u."Id" = o."User_Id";