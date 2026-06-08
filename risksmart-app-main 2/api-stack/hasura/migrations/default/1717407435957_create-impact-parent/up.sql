CREATE TABLE IF NOT EXISTS risksmart.impact_parent (
    "ImpactId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    PRIMARY KEY ("ParentId", "ImpactId"),
    FOREIGN KEY ("OrgKey") REFERENCES "auth"."organisation"("OrgKey") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("CreatedByUser") REFERENCES "auth"."user"("Id") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("ModifiedByUser") REFERENCES "auth"."user"("Id") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("ImpactId") REFERENCES "risksmart"."impact"("Id") ON UPDATE restrict ON DELETE CASCADE
);
CREATE INDEX "idx_impact_parent_impactId_parentId" ON risksmart.impact_parent USING btree ("ImpactId", "ParentId");

CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_impactid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."ImpactId",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_impactid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentId"
    AND np."Target" = d."ImpactId";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_impactid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentId"
    AND np."Id" = old."ImpactId";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."ImpactId",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.impact_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_impactid_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER
DELETE ON risksmart.impact_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_impactid_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.impact_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_impactid_parentid();


CREATE TABLE IF NOT EXISTS risksmart.impact_parent_audit (
    "ImpactId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    PRIMARY KEY ("ParentId", "ImpactId", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.impact_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.impact_parent_audit(
        "ImpactId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ImpactId",
        nr."ParentId",
        nr."OrgKey",
        nr."CreatedByUser",
        updated_user,
        update_timestamp,
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER impact_parent_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.impact_parent FOR EACH ROW EXECUTE FUNCTION risksmart.impact_parent_modified();

INSERT INTO risksmart."parent_type" ("Value", "Comment")
VALUES ('impact_parent', 'Impact Parent');

INSERT INTO risksmart."role_access" (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES
('ReadOnly','impact_parent','any','read'),
('Standard','impact_parent','owner','read'),
('Standard','impact_parent','owner','update'),
('Standard','impact_parent','owner','delete'),
('Standard','impact_parent','owner','insert'),
('Standard','impact_parent','contributor','read'),
('Standard','impact_parent','contributor','update'),
('Standard','impact_parent','contributor','insert'),
('Standard','impact_parent','contributor','delete'),
('RiskManager','impact_parent','any','read'),
('RiskManager','impact_parent','any','update'),
('RiskManager','impact_parent','any','delete'),
('RiskManager','impact_parent','any','insert'),
('StandardEnhanced','impact_parent','any','read'),
('StandardEnhanced','impact_parent','owner','update'),
('StandardEnhanced','impact_parent','owner','delete'),
('StandardEnhanced','impact_parent','contributor','update'),
('StandardEnhanced','impact_parent','owner','insert'),
('StandardEnhanced','impact_parent','contributor','insert'),
('StandardEnhanced','impact_parent','contributor','delete'),
('CustomerSupport','impact_parent','any','read'),
('CustomerSupport','impact_parent','any','update'),
('CustomerSupport','impact_parent','any','delete'),
('CustomerSupport','impact_parent','any','insert');

CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL ON CONFLICT DO NOTHING;

return null;

END;

$$;