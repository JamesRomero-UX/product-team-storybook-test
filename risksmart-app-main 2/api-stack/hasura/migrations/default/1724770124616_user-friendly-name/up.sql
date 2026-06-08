alter table auth.user
ADD COLUMN "FriendlyName" text GENERATED ALWAYS AS (
        COALESCE(
            "DisplayName",
            (
                CASE
                    WHEN "FirstName" IS NULL
                    AND "LastName" IS NULL THEN NULL
                    WHEN "FirstName" IS NULL THEN "LastName"
                    WHEN "LastName" IS NULL THEN "FirstName"
                    ELSE "FirstName" || ' ' || "LastName"
                END
            ),
            "UserName",
            "Email"
        )
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
    u."FriendlyName"
FROM auth.user u
    JOIN auth.organisationuser o ON u."Id" = o."User_Id";