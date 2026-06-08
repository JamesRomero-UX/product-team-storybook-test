UPDATE risksmart."taxonomy"
SET "Rating" = "Rating" || jsonb_build_object(
        'risk_controlled',
        CAST("Rating"->>'rating' AS jsonb)
    ) || jsonb_build_object(
        'risk_uncontrolled',
        CAST("Rating"->>'rating' AS jsonb)
    ),
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
WHERE "Rating"->>'rating' IS NOT NULL;