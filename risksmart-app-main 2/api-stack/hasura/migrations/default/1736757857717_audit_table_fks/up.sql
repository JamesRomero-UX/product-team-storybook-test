INSERT INTO auth.user (
        "Id",
        "UserName",
        "CreatedByUser",
        "ModifiedByUser"
    )
VALUES ('Auth0', 'Auth0', 'SYSTEM', 'SYSTEM'),
    ('SCIM', 'SCIM', 'SYSTEM', 'SYSTEM');

ALTER TABLE risksmart.approver_response
ADD FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.third_party
ADD FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.third_party
ADD FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE auth.organisation
ADD FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE auth.organisation
ADD FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE auth.organisationuser
ADD FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE auth.organisationuser
ADD FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");