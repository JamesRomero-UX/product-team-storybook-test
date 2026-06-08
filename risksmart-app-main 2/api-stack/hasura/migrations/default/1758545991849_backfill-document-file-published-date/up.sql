-- Migration: Backfill PublishedDate for document files
-- 
-- Purpose: Updates document_file records to set the PublishedDate field based on audit trail data.
-- This migration identifies the first time each document transitioned from 'draft' to 'published'
-- status and backfills the PublishedDate with that timestamp.
--
-- - Updates records where PublishedDate IS NULL
-- - Only affects currently published documents
-- - Uses audit trail data to determine publication timestamps
-- - Updates system metadata (ModifiedByUser = 'SYSTEM', ModifiedAtTimestamp = now())

BEGIN TRANSACTION;

UPDATE risksmart.document_file d
SET "PublishedDate" = sc.first_published_at,
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
    WITH status_changes AS (
        SELECT
            "Id",
            "ModifiedAtTimestamp",
            LAG("Status") OVER (PARTITION BY "Id" ORDER BY "ModifiedAtTimestamp") AS prev_status,
            document_file_audit."Status" AS new_status
        FROM risksmart.document_file_audit
    )
    SELECT "Id", MIN("ModifiedAtTimestamp") AS first_published_at
    FROM status_changes
    WHERE prev_status = 'draft'
      AND new_status = 'published'
    GROUP BY "Id"
) sc
WHERE d."Id" = sc."Id"
  AND d."Status" = 'published'
  OR  d."Status" = 'archived'
  AND d."PublishedDate" IS NULL;

COMMIT TRANSACTION;
