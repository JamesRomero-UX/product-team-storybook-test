CREATE TABLE risksmart.appetite_type ("Value" text PRIMARY KEY, "Comment" text);

insert into risksmart.appetite_type ("Value", "Comment")
values ('risk', 'Risk'),
    ('impact', 'Impact'),
    ('likelihood', 'Likelihood');

ALTER TABLE risksmart.appetite
ADD FOREIGN KEY ("AppetiteType") REFERENCES risksmart.appetite_type("Value");

ALTER TABLE risksmart.appetite
ADD column "LikelihoodAppetite" integer null;

ALTER TABLE risksmart.appetite_audit
ADD column "LikelihoodAppetite" integer null;

CREATE OR REPLACE FUNCTION risksmart.appetite_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
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

insert into risksmart.appetite_audit(
        "Id",
        "CustomAttributeData",
        "Statement",
        "LowerAppetite",
        "UpperAppetite",
        "EffectiveDate",
        "AppetiteType",
        "ImpactAppetite",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "SequentialId",
        "LikelihoodAppetite"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Statement",
        nr."LowerAppetite",
        nr."UpperAppetite",
        nr."EffectiveDate",
        nr."AppetiteType",
        nr."ImpactAppetite",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."SequentialId",
        nr."LikelihoodAppetite"
    );

RETURN nr;

END;

$BODY$;