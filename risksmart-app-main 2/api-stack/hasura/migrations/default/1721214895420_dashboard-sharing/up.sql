insert into risksmart.dashboard_sharing_type ("Value", "Comment")
values ('custom', 'Custom');

DELETE FROM risksmart.role_access
WHERE "ObjectType" = 'dashboard';

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    ) -- Anyone can create dashboards
VALUES ('RiskManager', 'dashboard', 'any', 'insert'),
    ('CustomerSupport', 'dashboard', 'any', 'insert'),
    ('Standard', 'dashboard', 'any', 'insert'),
    ('StandardEnhanced', 'dashboard', 'any', 'insert'),
    ('ReadOnly', 'dashboard', 'any', 'insert'),
    -- Can view if you are owner or contributor
    ('RiskManager', 'dashboard', 'owner', 'read'),
    ('CustomerSupport', 'dashboard', 'owner', 'read'),
    ('Standard', 'dashboard', 'owner', 'read'),
    ('StandardEnhanced', 'dashboard', 'owner', 'read'),
    ('ReadOnly', 'dashboard', 'owner', 'read'),
    (
        'RiskManager',
        'dashboard',
        'contributor',
        'read'
    ),
    (
        'CustomerSupport',
        'dashboard',
        'contributor',
        'read'
    ),
    ('Standard', 'dashboard', 'contributor', 'read'),
    (
        'StandardEnhanced',
        'dashboard',
        'contributor',
        'read'
    ),
    ('ReadOnly', 'dashboard', 'contributor', 'read'),
    -- can update if you own dashboard
    ('RiskManager', 'dashboard', 'owner', 'update'),
    (
        'CustomerSupport',
        'dashboard',
        'owner',
        'update'
    ),
    ('Standard', 'dashboard', 'owner', 'update'),
    (
        'StandardEnhanced',
        'dashboard',
        'owner',
        'update'
    ),
    ('ReadOnly', 'dashboard', 'owner', 'update'),
    -- can delete if you own dashboard
    ('RiskManager', 'dashboard', 'owner', 'delete'),
    (
        'CustomerSupport',
        'dashboard',
        'owner',
        'delete'
    ),
    ('Standard', 'dashboard', 'owner', 'delete'),
    (
        'StandardEnhanced',
        'dashboard',
        'owner',
        'delete'
    ),
    ('ReadOnly', 'dashboard', 'owner', 'delete');

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.dashboard FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.dashboard FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT c."Id",
    'dashboard',
    c."OrgKey"
FROM risksmart.dashboard c;

ALTER TABLE risksmart.dashboard
ADD CONSTRAINT "dashboard_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");

-- Use more appropriate column type
ALTER TABLE risksmart.dashboard
ALTER COLUMN "Content" TYPE JSONB USING "Content"::jsonb;

ALTER TABLE risksmart.dashboard
ALTER COLUMN "Sharing"
SET NOT NULL;

ALTER TABLE risksmart.dashboard
ALTER COLUMN "ModifiedAtTimestamp"
SET default statement_timestamp();

UPDATE risksmart.dashboard
SET "ModifiedAtTimestamp" = "CreatedAtTimestamp"
WHERE "ModifiedAtTimestamp" IS NULL;

UPDATE risksmart.dashboard
SET "ModifiedByUser" = "CreatedByUser"
WHERE "ModifiedByUser" IS NULL;

ALTER TABLE risksmart.dashboard
ALTER COLUMN "ModifiedAtTimestamp"
SET NOT NULL;

ALTER TABLE risksmart.dashboard
ALTER COLUMN "ModifiedByUser"
SET NOT NULL;

INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."Id",
    o."CreatedByUser",
    o."OrgKey",
    o."CreatedByUser",
    o."ModifiedByUser",
    o."ModifiedAtTimestamp",
    o."CreatedAtTimestamp"
FROM risksmart.dashboard o;

-- Missing audit table
CREATE TABLE IF NOT EXISTS risksmart.dashboard_audit (
    "Id" uuid NOT NULL,
    "Name" text,
    "Description" text,
    "Sharing" text,
    "Content" jsonb,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone,
    "ModifiedByUser" text,
    "ModifiedAtTimestamp" timestamp with time zone,
    "OrgKey" text not null,
    "Action" risksmart.db_action,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.dashboard_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
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

insert into risksmart.dashboard_audit(
        "Id",
        "Name",
        "Description",
        "Sharing",
        "Content",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "OrgKey",
        "Action"
    )
values (
        nr."Id",
        nr."Name",
        nr."Description",
        nr."Sharing",
        nr."Content",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        nr."OrgKey",
        TG_OP
    );

RETURN nr;

END;

$BODY$;

CREATE TRIGGER dashboard_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.dashboard FOR EACH ROW EXECUTE FUNCTION risksmart.dashboard_modified();