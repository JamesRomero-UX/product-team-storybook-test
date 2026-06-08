CREATE TABLE risksmart.risk_rating_definition (
    "ControlType" text REFERENCES risksmart.risk_assessment_result_control_type ("Value"),
    "Value" integer,
    "Label" text,
    "Color" text,
    "OrgKey" text REFERENCES auth.organisation ("OrgKey"),
    "CreatedByUser" text REFERENCES auth."user" ("Id"),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "ModifiedByUser" text NOT NULL REFERENCES auth."user" ("Id"),
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    primary key ("OrgKey", "ControlType", "Value")
);

CREATE TABLE risksmart.risk_rating_definition_audit (
    "ControlType" text,
    "Value" integer,
    "Label" text,
    "Color" text,
    "OrgKey" text,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key (
        "OrgKey",
        "ControlType",
        "Value",
        "ModifiedAtTimestamp"
    )
);

CREATE OR REPLACE FUNCTION risksmart.risk_rating_definition_modified() RETURNS trigger AS $body$
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

insert into risksmart.risk_rating_definition_audit(
        "ControlType",
        "Value",
        "Label",
        "Color",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."ControlType",
        nr."Value",
        nr."Label",
        nr."Color",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER risk_rating_definition_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.risk_rating_definition FOR EACH ROW EXECUTE FUNCTION risksmart.risk_rating_definition_modified();

ALTER TABLE risksmart.risk_rating_definition ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.risk_rating_definition_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.risk_rating_definition TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_rating_definition_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

-- Add uncontrolled ratings for customers with taxonomy overrides
with uncontrolled as (
    select tt."OrgKey",
        json_array_elements(("Rating"->>'risk_uncontrolled')::json) as "Item"
    from risksmart.taxonomy t
        inner join risksmart.taxonomy_org tt on t."Id" = tt."TaxonomyId"
)
insert into risksmart.risk_rating_definition (
        "ControlType",
        "Value",
        "Label",
        "Color",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    )
select 'Uncontrolled' as "ControlType",
    cast(u."Item"->>'value' as integer) as "Value",
    u."Item"->>'label' as "Label",
    u."Item"->>'color' as "Color",
    u."OrgKey",
    'SYSTEM',
    now(),
    'SYSTEM',
    now()
from uncontrolled u;

-- Add uncontrolled ratings for customers with taxonomy overrides
with controlled as (
    select tt."OrgKey",
        json_array_elements(("Rating"->>'risk_controlled')::json) as "Item"
    from risksmart.taxonomy t
        inner join risksmart.taxonomy_org tt on t."Id" = tt."TaxonomyId"
)
insert into risksmart.risk_rating_definition (
        "ControlType",
        "Value",
        "Label",
        "Color",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    )
select 'Controlled' as "ControlType",
    cast(u."Item"->>'value' as integer) as "Value",
    u."Item"->>'label' as "Label",
    u."Item"->>'color' as "Color",
    u."OrgKey",
    'SYSTEM',
    now(),
    'SYSTEM',
    now()
from controlled u;

CREATE TEMPORARY TABLE default_ratings(
    "Value" integer,
    "Label" text,
    "Color" text
);

INSERT INTO default_ratings (
        "Value",
        "Label",
        "Color"
    )
VALUES (
        1,
        'Minimal',
        'dark-green'
    ),
    (
        2,
        'Low',
        'light-green'
    ),
    (
        3,
        'Moderate',
        'orange'
    ),
    (
        4,
        'High',
        'light-red'
    ),
    (
        5,
        'Critical',
        'dark-red'
    );

-- Add Controlled risk rating definitions for orgs without overrides
insert into risksmart.risk_rating_definition (
        "ControlType",
        "Value",
        "Label",
        "Color",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    )
select 'Controlled' as "ControlType",
    dr."Value",
    dr."Label",
    dr."Color",
    o."OrgKey",
    'SYSTEM',
    now(),
    'SYSTEM',
    now()
from auth.organisation o
    cross join default_ratings dr
where o."OrgKey" not in (
        SELECT "OrgKey"
        from risksmart.risk_rating_definition
        WHERE "ControlType" = 'Controlled'
    );

-- Add Uncontrolled risk rating definitions for orgs without overrides
insert into risksmart.risk_rating_definition (
        "ControlType",
        "Value",
        "Label",
        "Color",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    )
select 'Uncontrolled' as "ControlType",
    dr."Value",
    dr."Label",
    dr."Color",
    o."OrgKey",
    'SYSTEM',
    now(),
    'SYSTEM',
    now()
from auth.organisation o
    cross join default_ratings dr
where o."OrgKey" not in (
        SELECT "OrgKey"
        from risksmart.risk_rating_definition
        WHERE "ControlType" = 'Uncontrolled'
    );