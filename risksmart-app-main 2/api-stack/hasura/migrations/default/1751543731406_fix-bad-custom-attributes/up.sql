-- Fix third party custom attributes
UPDATE risksmart."third_party" t
SET "CustomAttributeData" = ta."CustomAttributeData",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = NOW()
FROM (
        SELECT DISTINCT ON ("Id") "Id",
            "CustomAttributeData",
            "ModifiedAtTimestamp"
        FROM risksmart."third_party_audit" tpa
        WHERE to_jsonb(tpa."Description"::TEXT) <> tpa."CustomAttributeData"
            AND tpa."Id" IN (
                SELECT DISTINCT("Id")
                FROM risksmart."third_party"
                WHERE to_jsonb("Description"::TEXT) = "CustomAttributeData"
            )
        ORDER BY "Id",
            "ModifiedAtTimestamp" DESC
    ) ta
WHERE ta."Id" = t."Id";
-- Fix questionnaire_template custom attributes
UPDATE risksmart."questionnaire_template" t
SET "CustomAttributeData" = ta."CustomAttributeData",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = NOW()
FROM (
        SELECT DISTINCT ON ("Id") "Id",
            "CustomAttributeData",
            "ModifiedAtTimestamp"
        FROM risksmart."questionnaire_template_audit" tpa
        WHERE to_jsonb(tpa."Description"::TEXT) <> tpa."CustomAttributeData"
            AND tpa."Id" IN (
                SELECT DISTINCT("Id")
                FROM risksmart."questionnaire_template"
                WHERE to_jsonb("Description"::TEXT) = "CustomAttributeData"
            )
        ORDER BY "Id",
            "ModifiedAtTimestamp" DESC
    ) ta
WHERE ta."Id" = t."Id";