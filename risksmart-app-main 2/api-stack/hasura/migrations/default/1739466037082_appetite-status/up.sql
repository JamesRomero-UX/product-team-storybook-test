CREATE TABLE risksmart.appetite_status("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.appetite_status ("Value", "Comment")
VALUES ('active', 'Active'),
    ('archived', 'Archived');

ALTER TABLE risksmart.appetite_parent
ADD COLUMN "Status" TEXT references risksmart.appetite_status ("Value");

ALTER TABLE risksmart.appetite
ALTER COLUMN "SequentialId"
SET NOT NULL;

ALTER TABLE risksmart.appetite_parent_audit
ADD COLUMN "Status" TEXT;

CREATE OR REPLACE FUNCTION risksmart.appetite_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.appetite_parent_audit(
        "Id",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Status",
        "Action"
    )
values (
        nr."Id",
        nr."ParentId",
        nr."OrgKey",
        nr."CreatedByUser",
        updated_user,
        update_timestamp,
        nr."CreatedAtTimestamp",
        nr."Status",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.refresh_appetite_statuses(parent_risk_ids uuid [], modified_by_user text) RETURNS void AS $body$ begin with appetite_status as (
        select ap."ParentId",
            a."Id",
            case
                when ROW_NUMBER () OVER (
                    PARTITION BY ap."ParentId",
                    a."AppetiteType",
                    impact."ImpactId"
                    ORDER BY a."EffectiveDate" desc,
                        a."CreatedAtTimestamp" desc
                ) = 1 then 'active'
                else 'archived'
            end "Status"
        from risksmart.appetite_parent ap
            inner join risksmart.appetite a on a."Id" = ap."Id"
            left join (
                select iap."Id" as "AppetiteId",
                    iap."ParentId" as "ImpactId"
                from risksmart.appetite_parent iap
                    inner join risksmart.node imn on imn."Id" = iap."ParentId"
                where imn."ObjectType" = 'impact'
            ) as impact on impact."AppetiteId" = a."Id"
        where ap."ParentId" = ANY(parent_risk_ids)
    )
update risksmart.appetite_parent ap
set "Status" = a."Status",
    "ModifiedByUser" = modified_by_user,
    "ModifiedAtTimestamp" = now()
FROM appetite_status a
WHERE ap."ParentId" = a."ParentId"
    AND ap."Id" = a."Id"
    AND (
        ap."Status" <> a."Status"
        OR ap."Status" IS NULL
    );

end;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.refresh_appetite_parent_status_insert() RETURNS trigger AS $body$
DECLARE updated_user TEXT := inserted."ModifiedByUser"
FROM inserted
LIMIT 1;

BEGIN PERFORM risksmart.refresh_appetite_statuses(
    ARRAY(
        SELECT i."ParentId"
        FROM inserted i
            INNER JOIN risksmart.node n on n."Id" = i."ParentId"
        WHERE n."ObjectType" = 'risk'
    ),
    updated_user
);

return null;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.refresh_appetite_parent_status_delete() RETURNS trigger AS $body$
DECLARE updated_user TEXT := risksmart.get_hasura_user_id();

BEGIN PERFORM risksmart.refresh_appetite_statuses(
    ARRAY(
        SELECT d."ParentId"
        FROM deleted d
            INNER JOIN risksmart.node n on n."Id" = d."ParentId"
        WHERE n."ObjectType" = 'risk'
    ),
    updated_user
);

return null;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.refresh_appetite_status() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

updated_user := NEW."ModifiedByUser";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

END IF;

PERFORM risksmart.refresh_appetite_statuses(
    ARRAY (
        SELECT ap."ParentId"
        FROM risksmart.appetite_parent ap
            INNER JOIN risksmart.node n ON n."Id" = ap."ParentId"
        WHERE ap."Id" = nr."Id"
            AND n."ObjectType" = 'risk'
    ),
    updated_user
);

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER refresh_appetite_parent_status_insert
AFTER
INSERT ON risksmart.appetite_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.refresh_appetite_parent_status_insert();

CREATE OR REPLACE TRIGGER refresh_appetite_parent_status_delete
AFTER DELETE ON risksmart.appetite_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.refresh_appetite_parent_status_delete();

CREATE TRIGGER refresh_appetite_status
AFTER
UPDATE ON risksmart.appetite FOR EACH ROW EXECUTE PROCEDURE risksmart.refresh_appetite_status();

-- Setting status on appetite parents (risk only)
-- Note there is some complexity here as an appetite can have both a risk and impact parent, how the status is for the risk/impact combination, which we are
-- storing on the risk parent record.
SELECT risksmart.refresh_appetite_statuses(
        ARRAY (
            SELECT ap."ParentId"
            FROM risksmart.appetite_parent ap
                INNER JOIN risksmart.node n ON n."Id" = ap."ParentId"
            WHERE n."ObjectType" = 'risk'
        ),
        'SYSTEM'
    );