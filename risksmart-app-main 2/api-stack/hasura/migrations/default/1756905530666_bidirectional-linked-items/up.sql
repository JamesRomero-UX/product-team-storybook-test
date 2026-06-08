CREATE TABLE IF NOT EXISTS risksmart.linked_item_new (
    "OrgKey" text NOT NULL,
    "Source" uuid NOT NULL,
    "Target" uuid NOT NULL,
    "RelationshipType" text DEFAULT 'parent_child'::text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "CreatedByUser" text,
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "ModifiedByUser" text,
    "SourceType" text,
    "TargetType" text
);

INSERT INTO risksmart.linked_item_new (
        "OrgKey",
        "Source",
        "Target",
        "RelationshipType",
        "CreatedAtTimestamp",
        "CreatedByUser",
        "Id",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "SourceType",
        "TargetType"
    )
SELECT *
FROM risksmart.linked_item_view;

ALTER TABLE IF EXISTS risksmart.linked_item
    RENAME to linked_item_old;

ALTER TABLE IF EXISTS risksmart.linked_item_old
SET SCHEMA risksmart_obsolete;

ALTER TABLE IF EXISTS risksmart.linked_item_new
    RENAME to linked_item;

ALTER TABLE IF EXISTS risksmart_obsolete.linked_item_old DROP CONSTRAINT linked_item_pkey,
    DROP CONSTRAINT "linked_item_Id_key",
    DROP CONSTRAINT "linked_item_ModifiedByUser_fkey",
    DROP CONSTRAINT "linked_item_createdByUser_fkey",
    DROP CONSTRAINT "linked_item_orgKey_fkey",
    DROP CONSTRAINT linked_item_source_fkey,
    DROP CONSTRAINT linked_item_target_fkey,
    DROP CONSTRAINT check_not_self_referencing,
    DROP CONSTRAINT linked_item_relationship;

ALTER TABLE IF EXISTS risksmart.linked_item
ADD CONSTRAINT linked_item_pkey PRIMARY KEY ("Source", "Target"),
    ADD CONSTRAINT "linked_item_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth."user" ("Id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD CONSTRAINT "linked_item_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth."user" ("Id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD CONSTRAINT "linked_item_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD CONSTRAINT linked_item_source_fkey FOREIGN KEY ("Source") REFERENCES risksmart.node ("Id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    ADD CONSTRAINT linked_item_target_fkey FOREIGN KEY ("Target") REFERENCES risksmart.node ("Id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    ADD CONSTRAINT check_not_self_referencing CHECK ("Target" <> "Source"),
    ADD CONSTRAINT linked_item_relationship CHECK (
        "RelationshipType" = ANY (
            ARRAY ['parent_child'::text, 'sibling'::text, 'child_parent'::text]
        )
    );

ALTER TABLE IF EXISTS risksmart.linked_item ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE risksmart.linked_item
FROM trpc;

GRANT ALL ON TABLE risksmart.linked_item TO risksmartuser;

GRANT INSERT,
    DELETE,
    SELECT,
    UPDATE ON TABLE risksmart.linked_item TO trpc;

CREATE INDEX IF NOT EXISTS linked_items_key ON risksmart.linked_item USING btree (
    "Source" ASC NULLS LAST,
    "Target" ASC NULLS LAST,
    "OrgKey" ASC NULLS LAST,
    "RelationshipType" ASC NULLS LAST
);

CREATE INDEX IF NOT EXISTS "idx_linked_item_orgkey" on risksmart.linked_item("OrgKey");

-- POLICY: own_org
-- DROP POLICY IF EXISTS own_org ON risksmart.linked_item;
CREATE POLICY own_org ON risksmart.linked_item AS PERMISSIVE FOR ALL TO reporting USING (
    (
        "OrgKey" = current_setting('risksmart.org_key'::text, true)
    )
);

-- POLICY: own_org_rw
-- DROP POLICY IF EXISTS own_org_rw ON risksmart.linked_item;
CREATE POLICY own_org_rw ON risksmart.linked_item AS PERMISSIVE FOR ALL TO trpc USING (
    (
        "OrgKey" = current_setting('risksmart.org_key'::text, true)
    )
) WITH CHECK (
    (
        "OrgKey" = current_setting('risksmart.org_key'::text, true)
    )
);

CREATE OR REPLACE FUNCTION risksmart.linked_item_modified() RETURNS trigger LANGUAGE 'plpgsql' COST 100 VOLATILE NOT LEAKPROOF AS $BODY$
DECLARE nr RECORD;

updated_user TEXT;

update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.linked_item_audit(
        "Source",
        "SourceType",
        "Target",
        "TargetType",
        "RelationshipType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action",
        "Id"
    )
VALUES (
        nr."Source",
        nr."SourceType",
        nr."Target",
        nr."TargetType",
        nr."RelationshipType",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP,
        nr."Id"
    );

IF TG_OP = 'INSERT'
AND NEW."RelationshipType" = 'parent_child' THEN
INSERT INTO risksmart.linked_item (
        "OrgKey",
        "Source",
        "Target",
        "RelationshipType",
        "CreatedByUser",
        "ModifiedByUser",
        "SourceType",
        "TargetType"
    )
VALUES (
        NEW."OrgKey",
        NEW."Target",
        NEW."Source",
        'child_parent',
        NEW."CreatedByUser",
        NEW."ModifiedByUser",
        NEW."TargetType",
        NEW."SourceType"
    ) ON CONFLICT ("Source", "Target") DO NOTHING;

END IF;

IF TG_OP = 'DELETE'
AND OLD."RelationshipType" = 'parent_child' THEN
DELETE FROM risksmart.linked_item
WHERE "Source" = OLD."Target"
    AND "Target" = OLD."Source"
    AND "RelationshipType" = 'child_parent';

END IF;

IF TG_OP = 'DELETE' THEN RETURN OLD;

ELSE RETURN NEW;

END IF;

END;

$BODY$;

-- Trigger: linked_item_audit_trigger
-- DROP TRIGGER IF EXISTS linked_item_audit_trigger ON risksmart.linked_item;
CREATE OR REPLACE TRIGGER linked_item_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.linked_item FOR EACH ROW EXECUTE FUNCTION risksmart.linked_item_modified();

-- Trigger: node_ancestor_delete_refresh_trigger
-- DROP TRIGGER IF EXISTS node_ancestor_delete_refresh_trigger ON risksmart.linked_item;
CREATE OR REPLACE TRIGGER node_ancestor_delete_refresh_trigger
AFTER DELETE ON risksmart.linked_item REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE FUNCTION risksmart.node_ancestor_delete();

-- Trigger: node_ancestor_insert_refresh_trigger
-- DROP TRIGGER IF EXISTS node_ancestor_insert_refresh_trigger ON risksmart.linked_item;
CREATE OR REPLACE TRIGGER node_ancestor_insert_refresh_trigger
AFTER
INSERT ON risksmart.linked_item REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE FUNCTION risksmart.node_ancestor_insert();