UPDATE risksmart."taxonomy"
SET "Rating" = "Rating" || jsonb_build_object(
        'risk_appetite',
        ("Rating"->>'rating')::jsonb
    ),
    "ModifiedAtTimestamp" = now()
WHERE "Rating"->>'risk_controlled' IS NOT NULL;