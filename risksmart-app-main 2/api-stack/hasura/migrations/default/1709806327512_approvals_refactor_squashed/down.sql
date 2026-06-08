
ALTER TABLE "risksmart"."approver"
  ALTER COLUMN "UserId" SET NOT NULL,
  DROP COLUMN "OwnerApprover";

ALTER TABLE "risksmart"."approver_audit"
  ALTER COLUMN "UserId" SET NOT NULL,
  DROP COLUMN "OwnerApprover";
