ALTER TABLE auth.user
ADD COLUMN IF NOT EXISTS "CreatedByUser" text,
    ADD COLUMN IF NOT EXISTS "ModifiedByUser" text,
    ADD COLUMN IF NOT EXISTS "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp();