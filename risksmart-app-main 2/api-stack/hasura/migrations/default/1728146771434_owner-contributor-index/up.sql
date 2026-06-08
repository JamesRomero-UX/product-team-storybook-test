CREATE INDEX IF NOT EXISTS ix_owner_userid_parentid ON risksmart.owner("UserId", "ParentId") INCLUDE ("OrgKey");

CREATE INDEX IF NOT EXISTS ix_contributor_userid_parentid ON risksmart.contributor("UserId", "ParentId") INCLUDE ("OrgKey");