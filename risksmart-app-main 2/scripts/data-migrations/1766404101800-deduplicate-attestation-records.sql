-- ============================================================================
-- Purpose: Check and deduplicate attestation_record entries that are duplicates.
-- There should only be one active record per user per document version (i.e., NodeId).
-- These may exist due to a race condition during record creation.
--
-- Status: ONE-TIME SUPERVISED MIGRATION
--
-- Instructions:
--   1. Replace <ORG_KEY> with the target organization key
--   2. Review the migration plan in temp_attestation_record_duplicates
--   3. Verify duplicate records found
--   4. Execute the INSERT and UPDATE statements
--   5. Verify results with the provided SELECT queries
-- ============================================================================
-- ============================================================================
-- STEP 1: Identify Duplicate Records
-- ============================================================================
-- Creates a temporary table containing all attestation records that have duplicates
-- Duplicates are defined as: same document version (NodeId), user, and active status
-- Groups by these fields and filters to only records with count > 1
CREATE TEMP TABLE temp_attestation_record_duplicates AS
SELECT doc."Title",
    rec."NodeId",
    rec."Active",
    rec."UserId"
FROM risksmart.attestation_record rec
    JOIN risksmart.document_file ver ON ver."Id" = rec."NodeId"
    JOIN risksmart.document doc ON ver."ParentDocumentId" = doc."Id"
WHERE rec."OrgKey" = '<ORG_KEY>'
GROUP BY doc."Title",
    rec."NodeId",
    rec."Active",
    rec."UserId"
HAVING COUNT(*) > 1;

-- ============================================================================
-- STEP 2: Review Duplicate Records (READ-ONLY)
-- ============================================================================
-- Shows all duplicate attestation records with details for manual review
-- Joins with user_view_active to show friendly names
-- Ordered by NodeId, UserId, and Active status for easy comparison
-- Review: Check CreatedAtTimestamp and AttestationStatus to decide which record to keep (usually earliest)
SELECT rec."Id",
    doc."Title",
    rec."Active",
    rec."AttestationStatus",
    usr."FriendlyName",
    rec."CreatedAtTimestamp",
    rec."ModifiedAtTimestamp"
FROM temp_attestation_record_duplicates dup
    JOIN risksmart.attestation_record rec ON dup."NodeId" = rec."NodeId"
    AND dup."UserId" = rec."UserId"
    AND dup."Active" = rec."Active"
    JOIN risksmart.document doc ON doc."Id" = rec."ConfigId"
    JOIN risksmart.user_view_active usr ON usr."Id" = rec."UserId"
    AND usr."OrgKey" = '<ORG_KEY>'
ORDER BY rec."NodeId",
    rec."UserId",
    rec."Active";

-- ============================================================================
-- STEP 3: Delete Duplicate Records (WRITE OPERATION)
-- ============================================================================
-- After reviewing STEP 2 output, replace <SELECTED_DUPLICATE_RECORD_IDS> with 
-- the IDs of the duplicate records to DELETE (keep the earliest/correct one)
-- Example: WHERE "Id" IN ('id-1', 'id-2', 'id-3')
-- 
-- IMPORTANT: Use ROLLBACK to test, then COMMIT when verified
BEGIN TRANSACTION;

DELETE FROM risksmart.attestation_record
WHERE "Id" IN ('<SELECTED_DUPLICATE_RECORD_IDS>')
    AND "OrgKey" = '<ORG_KEY>';

-- Review deletion count before committing
-- Expected: For each duplicate set, keep 1 record and delete (count - 1) records.
ROLLBACK;

-- Test first, then replace with COMMIT when satisfied