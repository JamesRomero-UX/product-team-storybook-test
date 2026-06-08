alter table risksmart.impact_rating
add column "Likelihood" integer;

alter table risksmart.impact_rating_audit
add column "Likelihood" integer;

CREATE OR REPLACE FUNCTION risksmart.impact_rating_modified() RETURNS trigger AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.impact_rating_audit(
        "Id",
        "ImpactId",
        "RatedItemId",
        "SequentialId",
        "Rating",
        "TestDate",
        "RatingType",
        "CompletedBy",
        "Likelihood",
        "CustomAttributeData",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        anr."Id",
        anr."ImpactId",
        anr."RatedItemId",
        anr."SequentialId",
        anr."Rating",
        anr."TestDate",
        anr."RatingType",
        anr."CompletedBy",
        anr."Likelihood",
        anr."CustomAttributeData",
        anr."OrgKey",
        anr."CreatedByUser",
        anr."CreatedAtTimestamp",
        a_updated_user,
        a_update_timestamp,
        TG_OP
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;