ALTER TABLE risksmart.risk_score
ADD COLUMN "ResidualRating" integer,
    ADD COLUMN "InherentRating" integer;

ALTER TABLE risksmart.risk_score_audit
ADD COLUMN "ResidualRating" integer,
    ADD COLUMN "InherentRating" integer;

CREATE OR REPLACE FUNCTION risksmart.risk_score_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'INSERT'
    OR TG_OP = 'UPDATE'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.risk_score_audit (
        "RiskId",
        "ResidualScore",
        "InherentScore",
        "ResidualRating",
        "InherentRating",
        "OrgKey",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Action"
    )
VALUES (
        nr."RiskId",
        nr."ResidualScore",
        nr."InherentScore",
        nr."ResidualRating",
        nr."InherentRating",
        nr."OrgKey",
        update_timestamp,
        nr."CreatedAtTimestamp",
        nr."CreatedByUser",
        updated_user,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

with ratings as (
    select rar."OrgKey",
        rar."ControlType",
        rar."Likelihood",
        rar."Likelihood" * rar."Impact" as "Score",
        rar."Impact",
        rar."Rating",
        rar."TestDate",
        arp."ParentId" as "RiskId"
    FROM risksmart.risk_assessment_result rar
        inner join risksmart.assessment_result_parent arp on rar."Id" = arp."Id"
        AND arp."ParentType" = 'risk'
    where rar."RatingType" in ('rating', 'assessment')
    order by rar."OrgKey",
        rar."ControlType",
        rar."TestDate" desc,
        rar."CreatedAtTimestamp" desc
)
INSERT INTO risksmart.risk_score (
        "RiskId",
        "ResidualScore",
        "InherentScore",
        "ResidualRating",
        "InherentRating",
        "OrgKey",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser"
    )
select r."Id" as "RiskId",
    residual."Score" as "ResidualScore",
    inherent."Score" as "InherentScore",
    residual."Rating" as "ResidualRating",
    inherent."Rating" as "InherentRating",
    r."OrgKey",
    now(),
    now(),
    'SYSTEM',
    'SYSTEM'
from risksmart.risk r
    left join lateral (
        select lr.*
        from ratings lr
        where lr."RiskId" = r."Id"
            AND lr."ControlType" = 'Controlled'
        limit 1
    ) residual on true
    left join lateral (
        select lr.*
        from ratings lr
        where lr."RiskId" = r."Id"
            AND lr."ControlType" = 'Uncontrolled'
        limit 1
    ) inherent on true -- Only populating for default scoring model.
    -- Additional columns for aggregate models will need to be populated with api calls
where r."OrgKey" not IN (
        select "OrgKey"
        from risksmart.aggregation_org ao
        where ao."RiskScoringModel" <> 'default'
    ) -- don't bother creating records if we have no ratings
    AND (
        inherent."OrgKey" is not null
        or residual."OrgKey" is not null
    );