CREATE TABLE risksmart.unit_of_time ("Value" text PRIMARY KEY, "Comment" text);

insert into risksmart.unit_of_time ("Value", "Comment")
values ('day', 'Day'),
    ('week', 'Week');

CREATE TABLE IF NOT EXISTS risksmart.schedule (
    "Id" uuid NOT NULL PRIMARY KEY REFERENCES risksmart.node("Id") ON DELETE CASCADE,
    "Frequency" text NULL references risksmart.test_frequency("Value"),
    "TimeToCompleteValue" int,
    "TimeToCompleteUnit" text references risksmart.unit_of_time("Value"),
    "StartDate" timestamp with time zone,
    "ManualDueDate" timestamp with time zone,
    "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
    "CreatedByUser" text NOT NULL REFERENCES auth.user("Id"),
    "ModifiedByUser" text NOT NULL REFERENCES auth.user("Id"),
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE IF NOT EXISTS risksmart.schedule_audit (
    "Id" uuid NOT NULL,
    "Frequency" text NULL,
    "TimeToCompleteValue" int,
    "TimeToCompleteUnit" text,
    "StartDate" timestamp with time zone,
    "ManualDueDate" timestamp with time zone,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.schedule_modified() RETURNS trigger AS $body$
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

insert into risksmart.schedule_audit(
        "Id",
        "Frequency",
        "TimeToCompleteValue",
        "TimeToCompleteUnit",
        "StartDate",
        "ManualDueDate",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Frequency",
        nr."TimeToCompleteValue",
        nr."TimeToCompleteUnit",
        nr."StartDate",
        nr."ManualDueDate",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER schedule_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.schedule FOR EACH ROW EXECUTE FUNCTION risksmart.schedule_modified();

CREATE TABLE IF NOT EXISTS risksmart.schedule_state (
    "Id" uuid NOT NULL PRIMARY KEY REFERENCES risksmart.node("Id") ON DELETE CASCADE,
    "LatestDate" timestamp with time zone null,
    "DueDate" timestamp with time zone null,
    "OverdueDate" timestamp with time zone null,
    "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
    "CreatedByUser" text NOT NULL REFERENCES auth.user("Id"),
    "ModifiedByUser" text NOT NULL REFERENCES auth.user("Id"),
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE INDEX "idx_schedule_state_duedate" on risksmart.schedule_state ("DueDate");

CREATE INDEX "idx_schedule_state_overdue" on risksmart.schedule_state ("OverdueDate");

CREATE TABLE IF NOT EXISTS risksmart.schedule_state_audit (
    "Id" uuid NOT NULL,
    "LatestDate" timestamp with time zone null,
    "DueDate" timestamp with time zone null,
    "OverdueDate" timestamp with time zone null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.schedule_state_modified() RETURNS trigger AS $body$
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

insert into risksmart.schedule_state_audit(
        "Id",
        "LatestDate",
        "DueDate",
        "OverdueDate",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."LatestDate",
        nr."DueDate",
        nr."OverdueDate",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER schedule_state_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.schedule_state FOR EACH ROW EXECUTE FUNCTION risksmart.schedule_state_modified();