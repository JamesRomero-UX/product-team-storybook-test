
ALTER TABLE risksmart.approver ADD COLUMN "UserGroupId" uuid REFERENCES risksmart.user_group("Id") ON DELETE CASCADE;
ALTER TABLE risksmart.approver DROP CONSTRAINT "user_id_xor_owner_approver";
ALTER TABLE risksmart.approver ADD CONSTRAINT "user_id_xor_group_xor_owner_approver" CHECK (
  ("UserId" IS NOT NULL AND "UserGroupId" IS NULL AND "OwnerApprover" IS NOT TRUE) OR
  ("UserGroupId" IS NOT NULL AND "UserId" IS NULL AND "OwnerApprover" IS NOT TRUE) OR
  ("OwnerApprover" IS TRUE AND "UserId" IS NULL AND "UserGroupId" IS NULL)
);

ALTER TABLE risksmart.approver_audit ADD COLUMN "UserGroupId" uuid;
ALTER TABLE risksmart.approver_audit DROP CONSTRAINT "user_id_xor_owner_approver";
ALTER TABLE risksmart.approver_audit ADD CONSTRAINT "user_id_xor_group_xor_owner_approver" CHECK (
  ("UserId" IS NOT NULL AND "UserGroupId" IS NULL AND "OwnerApprover" IS NOT TRUE) OR
  ("UserGroupId" IS NOT NULL AND "UserId" IS NULL AND "OwnerApprover" IS NOT TRUE) OR
  ("OwnerApprover" IS TRUE AND "UserId" IS NULL AND "UserGroupId" IS NULL)
);
