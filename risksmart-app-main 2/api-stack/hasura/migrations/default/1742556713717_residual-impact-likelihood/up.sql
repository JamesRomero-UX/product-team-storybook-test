ALTER TABLE risksmart."risk_score"
ADD COLUMN "ResidualImpact" float NULL;

ALTER TABLE risksmart."risk_score"
ADD COLUMN "ResidualLikelihood" float NULL;

ALTER TABLE risksmart."risk_score_audit"
ADD COLUMN "ResidualImpact" float NULL;

ALTER TABLE risksmart."risk_score_audit"
ADD COLUMN "ResidualLikelihood" float NULL;

INSERT INTO risksmart."risk_scoring_model" ("Value", "Comment")
VALUES (
        'typed_control_effectiveness_averages',
        'Effectiveness averages for each control type'
    );

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
        "ResidualImpact",
        "ResidualLikelihood",
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
        nr."ResidualImpact",
        nr."ResidualLikelihood",
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

-- Populate impact and likelihood from the latest rating
-- For orgs with aggregation turned on we will have to recalculate by triggering the recalculate all function
with ratings as (
    select rar."OrgKey",
        rar."ControlType",
        rar."Likelihood",
        rar."Impact",
        rar."TestDate",
        arp."ParentId" as "RiskId"
    from risksmart.risk_assessment_result rar
        inner join risksmart.assessment_result_parent arp on rar."Id" = arp."Id"
        and arp."ParentType" = 'risk'
    where rar."RatingType" in ('rating', 'assessment')
        and rar."ControlType" = 'Controlled'
    order by rar."OrgKey",
        rar."ControlType",
        rar."TestDate" desc,
        rar."CreatedAtTimestamp" desc
)
update risksmart.risk_score rs
set "ResidualImpact" = x."Impact",
    "ResidualLikelihood" = x."Likelihood",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
from (
        select r."Id",
            lr."Impact",
            lr."Likelihood"
        from risksmart."risk" r
            join ratings lr ON lr."RiskId" = r."Id"
        limit 1
    ) AS x
where rs."RiskId" = x."Id";