-- ============================================================================
-- Purpose: Migrate existing attestation_record data to new attestation_cycle
--          structure introduced in migration 1759929781822
--
-- Status: ONE-TIME SUPERVISED MIGRATION
--
-- Instructions:
--   1. Replace <ORG_KEY> with the target organization key
--   2. Review the migration plan in temp_attestation_cycle_migration
--   3. Verify cycle statuses and record counts
--   4. Execute the INSERT and UPDATE statements
--   5. Verify results with the provided SELECT queries
--

-- IMPORTANT: This script is ORG-SPECIFIC and should NOT be run automatically
-- Check for duplicate active records. You MUST check and resolve duplicates first. If you do not, this migration will fail.
-- Refer to migration 1766404101800-deduplicate-attestation-records.sql for details.
-- ============================================================================
-- Step 1: Create temporary table to plan the migration
-- ============================================================================
CREATE TEMP TABLE temp_attestation_cycle_migration AS
SELECT gen_random_uuid() AS "ProposedCycleId",
	'active' AS "ProposedCycleStatus",
	dof."Id" AS "DocumentFileId",
	acf."ParentId" AS "ConfigId",
	doc."Title",
	dof."Version",
	ard."OrgKey",
	count(ard."Id") AS "RecordCount",
	COUNT(
		CASE
			WHEN ard."AttestationStatus" = 'attested' THEN 1
		END
	) as "AttestedRecordCount",
	NULL AS "Justification"
FROM risksmart.attestation_record ard
	JOIN risksmart.document_file dof ON ard."NodeId" = dof."Id"
	JOIN risksmart.attestation_config acf ON ard."ConfigId" = acf."ParentId"
	JOIN risksmart.document doc ON dof."ParentDocumentId" = doc."Id"
WHERE ard."OrgKey" = '<ORG_KEY>'
	AND ard."Active" = true
	AND ard."CycleId" IS NULL
GROUP BY dof."Id",
	acf."ParentId",
	doc."Title",
	dof."Version",
	ard."OrgKey"
ORDER BY doc."Title",
	dof."Version";

-- Step 2: Mark superseded cycles as concluded
-- (Keep only the latest version active per config)
UPDATE temp_attestation_cycle_migration
SET "ProposedCycleStatus" = 'concluded',
	"Justification" = 'superseded'
WHERE "ProposedCycleId" IN (
		SELECT "ProposedCycleId"
		FROM (
				SELECT "ProposedCycleId",
					ROW_NUMBER() OVER (
						PARTITION BY "ConfigId"
						ORDER BY "Version" DESC
					) as VersionRank
				FROM temp_attestation_cycle_migration
			) ranked
		WHERE VersionRank > 1
	);

-- Step 3: Mark naturally concluded cycles
-- (All records are attested)
UPDATE temp_attestation_cycle_migration
SET "ProposedCycleStatus" = 'concluded',
	"Justification" = 'natural_conclusion'
WHERE temp_attestation_cycle_migration."RecordCount" = temp_attestation_cycle_migration."AttestedRecordCount"
	AND temp_attestation_cycle_migration."ProposedCycleStatus" != 'concluded';

-- ============================================================================
-- REVIEW POINT: Examine the migration plan before proceeding
-- ============================================================================
SELECT *
FROM temp_attestation_cycle_migration
ORDER BY temp_attestation_cycle_migration."Title",
	temp_attestation_cycle_migration."Version";

-- Expected output:
--   - ProposedCycleId: UUID for the new cycle
--   - ProposedCycleStatus: 'active' or 'concluded'
--   - DocumentFileId: Links to document_file
--   - ConfigId: Links to attestation_config
--   - RecordCount: Number of attestation records
--   - AttestedRecordCount: How many are already attested
--   - Justification: Why it's concluded (if applicable)
-- ============================================================================
-- OPEN TRANSACTION
-- ============================================================================
BEGIN TRANSACTION;

-- ============================================================================
-- EXECUTE: Create attestation cycles
-- ============================================================================
INSERT INTO risksmart.attestation_cycle (
		"Id",
		"Status",
		"AllowCarryForward",
		"ParentId",
		"OrgKey",
		"CreatedByUser",
		"ModifiedByUser",
		"ConcludedAtTimestamp"
	)
SELECT "ProposedCycleId",
	"ProposedCycleStatus",
	false AS "AllowCarryForward",
	"DocumentFileId" AS "ParentId",
	"OrgKey",
	'SYSTEM' AS "CreatedByUser",
	'SYSTEM' AS "ModifiedByUser",
	CASE
		WHEN "ProposedCycleStatus" = 'concluded' THEN NOW()
		ELSE NULL
	END AS "ConcludedAtTimestamp"
FROM temp_attestation_cycle_migration;

-- ============================================================================
-- VERIFY: Check created cycles
-- ============================================================================
SELECT ac."Id",
	ac."Status",
	ac."ParentId",
	df."Version",
	d."Title",
	ac."ConcludedAtTimestamp"
FROM risksmart.attestation_cycle ac
	JOIN risksmart.document_file df ON ac."ParentId" = df."Id"
	JOIN risksmart.document d ON df."ParentDocumentId" = d."Id"
WHERE ac."OrgKey" = '<ORG_KEY>'
ORDER BY d."Title",
	df."Version";

-- ============================================================================
-- EXECUTE: Link attestation records to cycles
-- ============================================================================
UPDATE risksmart.attestation_record ar
SET "CycleId" = t."ProposedCycleId",
	"AttestationStatus" = CASE
		WHEN t."ProposedCycleStatus" = 'concluded'
		AND ar."AttestationStatus" = 'pending' THEN 'not_attested'
		ELSE ar."AttestationStatus"
	END,
	"Active" = CASE
		WHEN t."ProposedCycleStatus" = 'concluded' THEN false
		ELSE ar."Active"
	END,
	"ModifiedAtTimestamp" = NOW(),
	"ModifiedByUser" = 'SYSTEM'
FROM temp_attestation_cycle_migration t
WHERE ar."NodeId" = t."DocumentFileId"
	AND ar."ConfigId" = t."ConfigId"
	AND ar."OrgKey" = '<ORG_KEY>'
	AND ar."Active" = true
	AND ar."CycleId" IS NULL;

-- ============================================================================
-- VERIFY: Check attestation records linked to cycles
-- ============================================================================
SELECT ac."Id" AS "CycleId",
	ac."Status" AS "CycleStatus",
	d."Title" AS "DocumentTitle",
	df."Version" AS "DocumentVersion",
	COUNT(ar."Id") AS "RecordCount",
	COUNT(
		CASE
			WHEN ar."AttestationStatus" = 'attested' THEN 1
		END
	) AS "AttestedCount"
FROM risksmart.attestation_cycle ac
	JOIN risksmart.document_file df ON ac."ParentId" = df."Id"
	JOIN risksmart.document d ON df."ParentDocumentId" = d."Id"
	LEFT JOIN risksmart.attestation_record ar ON ar."CycleId" = ac."Id"
WHERE ac."OrgKey" = '<ORG_KEY>'
GROUP BY ac."Id",
	ac."Status",
	d."Title",
	df."Version"
ORDER BY d."Title",
	df."Version";

-- ============================================================================
-- CLOSE TRANSACTION
-- ============================================================================
-- By default, this migration ROLLBACKs all changes for safety.
-- After verifying the results above, REPLACE the ROLLBACK below with COMMIT to persist changes.
ROLLBACK;

-- COMMIT;
-- ============================================================================
-- CLEANUP
-- ============================================================================
DROP TABLE IF EXISTS temp_attestation_cycle_migration;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary of changes:
--   - Created attestation_cycle records from grouped attestation_records
--   - Linked all attestation_records to their respective cycles
--   - Marked pending records in concluded cycles as 'not_attested'
--   - Preserved all attested records
--
-- Next steps:
--   1. Verify the results match expectations
--   2. Document any anomalies
--   3. Update runbook/deployment docs if needed
--   4. Archive this script for historical reference
--
-- Rollback plan:
--   If issues are found, you can delete the created cycles and clear CycleId:
--   
--   DELETE FROM risksmart.attestation_cycle 
--   WHERE "OrgKey" = '<ORG_KEY>' 
--     AND "CreatedByUser" = 'SYSTEM';
--   
--   UPDATE risksmart.attestation_record 
--   SET "CycleId" = NULL 
--   WHERE "OrgKey" = '<ORG_KEY>';
-- ============================================================================