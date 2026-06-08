/*
 Throughout the system, we have been used CreatedAtTimestamp to display the date an issue was raised,
 however, when creating issues via the data import, we want the Raised date to be different from the date it was inserted into the database.
 */
ALTER TABLE risksmart.issue
ADD COLUMN "RaisedAtTimestamp" timestamp with time zone;

ALTER TABLE risksmart.issue_audit
ADD COLUMN "RaisedAtTimestamp" timestamp with time zone;

CREATE OR REPLACE FUNCTION risksmart.issue_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.issue_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "SequentialId",
        "RaisedAtTimestamp"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Details",
        nr."ImpactsCustomer",
        nr."IsExternalIssue",
        nr."DateOccurred",
        nr."DateIdentified",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."SequentialId",
        nr."RaisedAtTimestamp"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

update risksmart.issue
set "RaisedAtTimestamp" = "CreatedAtTimestamp",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM';

ALTER TABLE risksmart.issue
ALTER COLUMN "RaisedAtTimestamp"
SET NOT NULL;