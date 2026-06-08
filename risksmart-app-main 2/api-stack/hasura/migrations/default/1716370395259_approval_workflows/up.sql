ALTER TABLE "risksmart"."approval" DROP CONSTRAINT "Approval_ParentType_fkey";

UPDATE "risksmart"."approval" SET
  "ParentType" = 'publish-document-version',
  "ModifiedAtTimestamp" = now(),
  "ModifiedByUser" = 'SYSTEM'
WHERE "ParentType" = 'document_file';

UPDATE "risksmart"."approval" SET
  "ParentType" = 'open-acceptance',
  "ModifiedAtTimestamp" = now(),
  "ModifiedByUser" = 'SYSTEM'
WHERE "ParentType" = 'acceptance';

ALTER TABLE "risksmart"."approval" RENAME COLUMN "ParentType" TO "Workflow";
