/**
 Updates all an organizations risk assessment results so that the "Rating" value
 is updated based on the rules set within the "rating" taxonomy.
 
 IMPORTANT:
 This script should only be used for customers that have set the likelihoodImpact array in the rating taxonomy (custom rating calculation)
 This script will override any custom rating overrides 
 
 
 **/
CREATE OR REPLACE FUNCTION risksmart.update_risk_assessment_scores(
        taxonomy_id uuid,
        org_key text
    ) RETURNS void AS $$ BEGIN with rating_col as (
        select json_array_elements(t."Rating"::json->'rating') as rating
        from risksmart.taxonomy t
        where t."Id" = taxonomy_id
    ),
    -- Get impact, likelihood and rating from taxonomy json as a table result
    ratings as (
        select cast(
                json_array_elements(r.rating->'likelihoodImpact')->>'impact'::text as integer
            ) as "Impact",
            cast(
                json_array_elements(r.rating->'likelihoodImpact')->>'likelihood'::text as integer
            ) as "Likelihood",
            cast(r.rating->>'value' as integer) as "Rating"
        from rating_col r
    ),
    -- combine risk assessment result impact and likelihood with those in taxonomy to compare current and taxonomy based ratings
    risks_and_ratings as (
        SELECT rar."ControlType",
            rar."Id",
            rar."Likelihood",
            rar."Impact",
            rar."Rating",
            rat."Rating" as "UpdatedRating",
            rar."OrgKey"
        from risksmart.risk r
            inner join risksmart.assessment_result_parent arp ON arp."ParentId" = r."Id"
            inner join risksmart.risk_assessment_result rar on rar."Id" = arp."Id"
            inner join ratings rat on rat."Impact" = rar."Impact"
            AND rat."Likelihood" = rar."Likelihood"
        WHERE rar."OrgKey" = org_key
    ) -- Update risk assessment results if updated rating does not matching current rating
update risksmart.risk_assessment_result rar
set "Rating" = rr."UpdatedRating"
from risks_and_ratings rr
where coalesce(rr."UpdatedRating", -1) <> coalesce(rr."Rating", -1)
    AND rar."Id" = rr."Id";

END $$ LANGUAGE plpgsql VOLATILE;