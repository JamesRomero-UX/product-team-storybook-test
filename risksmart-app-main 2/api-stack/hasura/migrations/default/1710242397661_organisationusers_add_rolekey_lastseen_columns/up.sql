ALTER TABLE auth.organisationUser
ADD COLUMN "RoleKey" text,
    ADD COLUMN "LastSeen" timestamp with time zone;