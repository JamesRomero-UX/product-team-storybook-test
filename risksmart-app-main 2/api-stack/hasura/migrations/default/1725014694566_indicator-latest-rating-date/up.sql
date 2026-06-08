alter table risksmart.indicator
ADD COLUMN "LatestResultDate" timestamptz NULL,
    ADD COLUMN "NextResultDate" timestamptz NULL;

alter table risksmart.indicator_audit
ADD COLUMN "LatestResultDate" timestamptz NULL,
    ADD COLUMN "NextResultDate" timestamptz NULL;

CREATE OR REPLACE FUNCTION risksmart.indicator_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
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

insert into risksmart.indicator_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Type",
        "TestFrequency",
        "Unit",
        "UpperToleranceNum",
        "LowerToleranceNum",
        "TargetValueTxt",
        "UpperAppetiteNum",
        "LowerAppetiteNum",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "SequentialId",
        "Action",
        "NextResultDate",
        "LatestResultDate"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Description",
        nr."Type",
        nr."TestFrequency",
        nr."Unit",
        nr."UpperToleranceNum",
        nr."LowerToleranceNum",
        nr."TargetValueTxt",
        nr."UpperAppetiteNum",
        nr."LowerAppetiteNum",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."SequentialId",
        TG_OP,
        nr."NextResultDate",
        nr."LatestResultDate"
    );

RETURN nr;

END;

$BODY$;

/**
 TODO: update exists indicator records
 **/