drop index risksmart.idx_customRibbon_orgKey_parentType;

ALTER TABLE risksmart.custom_ribbon
ADD CONSTRAINT idx_customRibbon_orgKey_parentType UNIQUE ("OrgKey", "ParentType");