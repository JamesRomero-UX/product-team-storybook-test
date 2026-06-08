ALTER TABLE "risksmart"."document" ALTER COLUMN "RequireGlobalAttestation" SET DEFAULT FALSE;
UPDATE "risksmart"."document" SET
  "RequireGlobalAttestation" = FALSE,
  "ModifiedAtTimestamp" = now()
WHERE "RequireGlobalAttestation" != FALSE;
