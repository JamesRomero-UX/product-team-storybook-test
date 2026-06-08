ALTER TABLE risksmart.form_field_configuration
ADD COLUMN "Conditions" jsonb null;

ALTER TABLE risksmart.form_field_configuration_audit
ADD COLUMN "Conditions" jsonb null;

CREATE OR REPLACE FUNCTION risksmart.form_field_configuration_modified() RETURNS trigger AS $body$
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

insert into risksmart.form_field_configuration_audit(
        "FormConfigurationParentType",
        "FieldId",
        "Hidden",
        "ReadOnly",
        "Required",
        "CreatedByUser",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action",
        "DefaultValue",
        "Label",
        "Description",
        "Conditions"
    )
values (
        nr."FormConfigurationParentType",
        nr."FieldId",
        nr."Hidden",
        nr."ReadOnly",
        nr."Required",
        nr."CreatedByUser",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."DefaultValue",
        nr."Label",
        nr."Description",
        nr."Conditions"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;