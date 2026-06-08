/*
 Cannot as FK on change request parent as it can currently reference deleted record.
 ALTER TABLE risksmart.change_request
 ADD CONSTRAINT "change_request_parentid_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id");*/
ALTER TABLE risksmart.change_request
ADD CONSTRAINT "change_request_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.change_request
ADD CONSTRAINT "change_request_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.change_request
ADD CONSTRAINT "change_request_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

CREATE INDEX "idx_change_request_parentId" on risksmart.change_request using btree ("ParentId");