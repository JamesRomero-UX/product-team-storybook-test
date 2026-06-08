CREATE OR REPLACE VIEW risksmart.assessment_activity_view WITH (security_invoker = true) AS
SELECT aa."Id",
    aa."ActivityType",
    aa."ParentId",
    aa."OrgKey",
    aa."Title",
    aa."Summary",
    aa."Status",
    aa."AssignedUser",
    aa."CompletionDate",
    aa."CreatedByUser",
    aa."ModifiedByUser",
    aa."ModifiedAtTimestamp",
    aa."CreatedAtTimestamp",
    aa."CustomAttributeData",
    aa."RiskId"
FROM risksmart.assessment_activity aa
WHERE aa."IsRCSA" = false;
CREATE OR REPLACE VIEW risksmart.rsca_assessment_activity_view WITH (security_invoker = true) AS
SELECT aa."Id",
    aa."ActivityType",
    aa."ParentId",
    aa."OrgKey",
    aa."Title",
    aa."Summary",
    aa."Status",
    aa."AssignedUser",
    aa."CompletionDate",
    aa."CreatedByUser",
    aa."ModifiedByUser",
    aa."ModifiedAtTimestamp",
    aa."CreatedAtTimestamp",
    aa."CustomAttributeData",
    aa."RiskId"
FROM risksmart.assessment_activity aa
WHERE aa."IsRCSA" = true;