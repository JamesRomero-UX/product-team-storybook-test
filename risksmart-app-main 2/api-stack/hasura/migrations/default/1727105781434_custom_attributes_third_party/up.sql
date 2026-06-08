ALTER TABLE risksmart.third_party ADD COLUMN "CustomAttributeData" jsonb;
ALTER TABLE risksmart.third_party_audit ADD COLUMN "CustomAttributeData" jsonb;

CREATE OR REPLACE FUNCTION risksmart.third_party_modified()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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

insert into risksmart.third_party_audit(
        "Id",
        "OrgKey",
        "SequentialId",
        "Title",
        "Description",
        "CompanyName",
        "CompaniesHouseNumber",
        "Address",
        "CityTown",
        "Postcode",
        "Country",
        "PrimaryContactName",
        "ContactName",
        "ContactEmail",
        "CompanyDomain",
        "Type",
        "Status",
        "Criticality",
        "CustomAttributeData",
        "CreatedByUser",
        "ModifiedByUser",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."OrgKey",
        nr."SequentialId",
        nr."Title",
        nr."Description",
        nr."CompanyName",
        nr."CompaniesHouseNumber",
        nr."Address",
        nr."CityTown",
        nr."Postcode",
        nr."Country",
        nr."PrimaryContactName",
        nr."ContactName",
        nr."ContactEmail",
        nr."CompanyDomain",
        nr."Type",
        nr."Status",
        nr."Criticality",
        nr."CustomAttributeData",
        nr."CreatedByUser",
        updated_user,
        nr."CreatedAtTimestamp",
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$function$
;
