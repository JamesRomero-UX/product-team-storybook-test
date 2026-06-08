ALTER TABLE auth.user_activity_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.taxonomy_org_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.taxonomy_org ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.node_ancestor
ADD FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

CREATE POLICY own_org ON risksmart.taxonomy_org TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.taxonomy_org_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON auth.user_activity_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.taxonomy_org TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.taxonomy_org_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON auth.user_activity_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

-- created by user will always be system
ALTER TABLE auth.user_activity_audit
ADD COLUMN "CreatedByUser" text not null default 'SYSTEM';

ALTER TABLE auth.user_activity_audit
ADD COLUMN "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL;

UPDATE auth.user_activity_audit
SET "CreatedAtTimestamp" = "ModifiedAtTimestamp";