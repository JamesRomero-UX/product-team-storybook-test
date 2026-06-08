ALTER TABLE risksmart.node_ancestor ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.node ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.node_ancestor TO reporting USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.node_ancestor TO trpc USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.node TO reporting USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.node TO trpc USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.counter TO reporting USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.counter TO trpc USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);