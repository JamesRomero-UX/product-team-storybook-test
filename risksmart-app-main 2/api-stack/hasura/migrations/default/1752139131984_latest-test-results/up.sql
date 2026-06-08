CREATE OR REPLACE VIEW risksmart.latest_test_result_view WITH (security_invoker = true) AS
select distinct on (arp."ParentId") arp."ParentId",
    tr."Id",
    tr."ModifiedAtTimestamp",
    tr."ModifiedByUser",
    tr."Title",
    tr."Submitter",
    tr."Description",
    tr."ParentControlId",
    tr."TestType",
    tr."DesignEffectiveness",
    tr."PerformanceEffectiveness",
    tr."OverallEffectiveness",
    tr."TestDate",
    tr."NextTestDate",
    tr."OrgKey",
    tr."Meta",
    tr."CreatedByUser",
    tr."CreatedAtTimestamp",
    tr."CustomAttributeData",
    tr."RatingType",
    tr."SequentialId"
from risksmart.test_result tr
    inner join risksmart.assessment_result_parent arp on tr."Id" = arp."Id"
order by arp."ParentId",
    tr."TestDate" desc,
    tr."CreatedAtTimestamp" desc;

/**
 Returns the latest residual and inherent risk assessment result for each risk or assessment.
 **/
CREATE OR REPLACE VIEW risksmart.latest_risk_assessment_result_view WITH (security_invoker = true) AS
select distinct on (arp."ParentId", tr."ControlType") arp."ParentId",
    tr."Id",
    tr."ControlType",
    tr."Likelihood",
    tr."Impact",
    tr."Rating",
    tr."OrgKey",
    tr."CreatedByUser",
    tr."CreatedAtTimestamp",
    tr."CustomAttributeData",
    tr."Rationale",
    tr."TestDate",
    tr."ModifiedByUser",
    tr."ModifiedAtTimestamp",
    tr."RatingType"
from risksmart.risk_assessment_result tr
    inner join risksmart.assessment_result_parent arp on tr."Id" = arp."Id"
order by arp."ParentId",
    tr."ControlType",
    tr."TestDate" desc,
    tr."CreatedAtTimestamp" desc;

/**
 Returns the latest residual and inherent risk assessment result for each risk of an assessment
 **/
CREATE OR REPLACE VIEW risksmart.latest_assessment_risk_assessment_result_view WITH (security_invoker = true) AS
select distinct on (ap."ParentId", rp."ParentId", tr."ControlType") ap."ParentId",
    tr."Id",
    tr."ControlType",
    tr."Likelihood",
    tr."Impact",
    tr."Rating",
    tr."OrgKey",
    tr."CreatedByUser",
    tr."CreatedAtTimestamp",
    tr."CustomAttributeData",
    tr."Rationale",
    tr."TestDate",
    tr."ModifiedByUser",
    tr."ModifiedAtTimestamp",
    tr."RatingType"
from risksmart.risk_assessment_result tr
    inner join risksmart.assessment_result_parent rp on tr."Id" = rp."Id"
    AND rp."ParentType" = 'risk'
    inner join risksmart.assessment_result_parent ap on tr."Id" = ap."Id"
    AND ap."ParentType" = 'assessment'
order by ap."ParentId",
    rp."ParentId",
    tr."ControlType",
    tr."TestDate" desc,
    tr."CreatedAtTimestamp" desc;