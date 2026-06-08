UPDATE risksmart."tab"
SET "Tabs" = jsonb_set(
        "Tabs"::jsonb,
        '{default}',
        "Tabs"->'default' || '{"id": "attestations"}',
        true
    )
WHERE "ParentType" IN ('document');