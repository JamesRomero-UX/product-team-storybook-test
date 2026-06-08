ALTER TABLE auth.user
ADD COLUMN "DisplayName" TEXT;

-- Populate with values from username column
UPDATE auth.user
SET "DisplayName" = "UserName";