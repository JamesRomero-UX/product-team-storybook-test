/* Latest Indicator Results */
CREATE VIEW risksmart."latest_indicator_result_view" WITH (security_invoker = true) AS
SELECT
	DISTINCT ON ("indicator_result"."IndicatorId") "IndicatorId",
	"indicator_result"."Id",
	"indicator_result"."Description",
    "indicator_result"."ResultDate",
	"indicator_result"."TargetValueTxt",
    "indicator_result"."TargetValueNum",
    "indicator_result"."OrgKey",
    "indicator_result"."CreatedByUser",
    "indicator_result"."CreatedAtTimestamp",
    "indicator_result"."ModifiedByUser",
    "indicator_result"."ModifiedAtTimestamp",
    "indicator_result"."CustomAttributeData"
FROM risksmart."indicator_result"
ORDER BY "indicator_result"."IndicatorId", "indicator_result"."ResultDate" DESC;