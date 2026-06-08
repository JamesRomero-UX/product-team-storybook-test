ALTER TABLE risksmart.appetite
ADD COLUMN "ImpactId" uuid null references risksmart.impact;

ALTER TABLE risksmart.appetite_audit
ADD COLUMN "ImpactId" uuid null;

CREATE OR REPLACE FUNCTION risksmart.appetite_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
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

insert into risksmart.appetite_audit(
        "Id",
        "CustomAttributeData",
        "Statement",
        "LowerAppetite",
        "UpperAppetite",
        "EffectiveDate",
        "AppetiteType",
        "ImpactAppetite",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "SequentialId",
        "LikelihoodAppetite",
        "ImpactId"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Statement",
        nr."LowerAppetite",
        nr."UpperAppetite",
        nr."EffectiveDate",
        nr."AppetiteType",
        nr."ImpactAppetite",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."SequentialId",
        nr."LikelihoodAppetite",
        nr."ImpactId"
    );

RETURN nr;

END;

$BODY$;

CREATE OR REPLACE FUNCTION risksmart.refresh_appetite_statuses(parent_risk_ids uuid [], modified_by_user text) RETURNS void AS $body$ begin with appetite_status as (
        select ap."ParentId",
            a."Id",
            case
                when ROW_NUMBER () OVER (
                    PARTITION BY ap."ParentId",
                    a."AppetiteType",
                    a."ImpactId"
                    ORDER BY a."EffectiveDate" desc,
                        a."CreatedAtTimestamp" desc
                ) = 1 then 'active'
                else 'archived'
            end "Status"
        from risksmart.appetite_parent ap
            inner join risksmart.appetite a on a."Id" = ap."Id"
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
        WHERE ap."Id" = nr."Id"
    ),
    updated_user
);

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

-- Move appetite impact id onto appetite
update risksmart.appetite a
set "ImpactId" = i."Id",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
from risksmart.appetite_parent ap
    inner join risksmart.impact i ON ap."ParentId" = i."Id"
where a."Id" = ap."Id";

DELETE FROM risksmart.appetite_parent ap
where ap."ParentId" in (
        select "Id"
        from risksmart.impact
    );