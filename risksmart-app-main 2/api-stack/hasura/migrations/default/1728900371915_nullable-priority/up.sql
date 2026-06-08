alter table risksmart.action
ALTER COLUMN "Priority" DROP NOT NULL;

alter table risksmart.action_audit
ALTER COLUMN "Priority" DROP NOT NULL;