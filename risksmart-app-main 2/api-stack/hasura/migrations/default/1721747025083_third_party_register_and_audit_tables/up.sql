-- THIRD PARTY REGISTER AND AUDIT TABLES
CREATE TABLE risksmart.third_party(
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "OrgKey" text NOT NULL,
    "SequentialId" integer NULL,
    "Title" text NOT NULL,
    "Description" text,
    "CompanyName" text NOT NULL,
    "CompaniesHouseNumber" text,
    "Address" text,
    "CityTown" text,
    "Postcode" text,
    "Country" text,
    "PrimaryContactName" text,
    "ContactName" text,
    "ContactEmail" text,
    "CompanyDomain" text,
    "Type" text NOT NULL,
    "Status" text NOT NULL,
    "Criticality" integer NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

ALTER TABLE risksmart.third_party
ADD CONSTRAINT "third_party_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

CREATE TRIGGER a_set_sequential_id_trigger BEFORE
INSERT ON risksmart.third_party for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE UNIQUE INDEX idx_third_party_orgKey_sequentialid ON risksmart.third_party("OrgKey", "SequentialId");

CREATE TABLE risksmart.third_party_type (
    "Value" text NOT NULL PRIMARY KEY,
    "Comment" text
);

CREATE TABLE risksmart.third_party_status (
    "Value" text NOT NULL PRIMARY KEY,
    "Comment" text
);

ALTER TABLE risksmart.third_party
ADD CONSTRAINT "third_party_type_fkey" FOREIGN KEY ("Type") REFERENCES risksmart.third_party_type("Value");

ALTER TABLE risksmart.third_party
ADD CONSTRAINT "third_party_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.third_party_status("Value");

ALTER TABLE risksmart.third_party
ADD CONSTRAINT "Tier_check" CHECK ("Criticality" IN (1, 2, 3, 4));

INSERT INTO risksmart.third_party_type ("Value", "Comment")
VALUES ('supplier', 'Supplier'),
    ('partner', 'Partner'),
    ('outsource', 'Outsource'),
    ('managed_service', 'Managed Service'),
    ('consultant', 'Consultant');

INSERT INTO risksmart.third_party_status ("Value", "Comment")
VALUES ('pre_contract', 'Pre-Contract'),
    ('active', 'Active'),
    ('review_due', 'Review Due'),
    ('archived', 'Archived');

CREATE TABLE IF NOT EXISTS risksmart.third_party_audit(
    "Id" uuid default gen_random_uuid() NOT NULL,
    "OrgKey" text NOT NULL,
    "SequentialId" integer NULL,
    "Title" text NOT NULL,
    "Description" text,
    "CompanyName" text NOT NULL,
    "CompaniesHouseNumber" text,
    "Address" text,
    "CityTown" text,
    "Postcode" text,
    "Country" text,
    "PrimaryContactName" text,
    "ContactName" text,
    "ContactEmail" text,
    "CompanyDomain" text,
    "Type" text NOT NULL,
    "Status" text NOT NULL,
    "Criticality" integer NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.third_party_modified() RETURNS trigger AS $body$
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
        nr."CreatedByUser",
        updated_user,
        nr."CreatedAtTimestamp",
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER third_party_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.third_party FOR EACH ROW EXECUTE FUNCTION risksmart.third_party_modified();