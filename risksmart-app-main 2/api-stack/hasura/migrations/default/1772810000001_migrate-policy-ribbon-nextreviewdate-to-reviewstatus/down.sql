-- Revert policy (document) custom ribbon filters from ReviewStatus-based
-- label filters back to NextReviewDate-based relative date filters.

WITH exploded AS (
    SELECT
        cr."Id",
        f.elem,
        f.idx
    FROM risksmart.custom_ribbon cr,
         jsonb_array_elements("Filters") WITH ORDINALITY AS f(elem, idx)
    WHERE cr."ParentType" = 'document'
),
classified AS (
    SELECT
        e."Id",
        e.idx,
        e.elem,
        jsonb_array_length(COALESCE(e.elem->'itemFilterQuery'->'tokenGroups', '[]'::jsonb)) AS tg_count,
        -- Check if there is exactly one tokenGroup with propertyKey = 'ReviewStatus'
        (
            SELECT bool_and(tg->>'propertyKey' = 'ReviewStatus')
            FROM jsonb_array_elements(
                COALESCE(e.elem->'itemFilterQuery'->'tokenGroups', '[]'::jsonb)
            ) tg
        ) AS all_review_status,
        -- Get the ReviewStatus value if present
        (
            SELECT tg->>'value'
            FROM jsonb_array_elements(
                COALESCE(e.elem->'itemFilterQuery'->'tokenGroups', '[]'::jsonb)
            ) tg
            WHERE tg->>'propertyKey' = 'ReviewStatus'
            LIMIT 1
        ) AS review_status_value
    FROM exploded e
),
transformed AS (
    SELECT
        c."Id",
        c.idx,
        CASE
            -- Revert "Due" back to NextReviewDate relative date filters
            WHEN c.all_review_status IS TRUE
                 AND c.tg_count = 1
                 AND c.review_status_value = 'Due'
            THEN
                jsonb_set(
                    jsonb_set(
                        c.elem,
                        '{itemFilterQuery,tokenGroups}',
                        '[{"operator": "=", "propertyKey": "NextReviewDate", "value": {"type": "relative", "unit": "day", "amount": 30}}, {"operator": "=", "propertyKey": "NextReviewDate", "value": {"type": "relative", "unit": "year", "amount": -3}}]'::jsonb
                    ),
                    '{itemFilterQuery,operation}',
                    '"or"'::jsonb
                )
            -- Revert "Overdue" back to NextReviewDate relative date filter
            WHEN c.all_review_status IS TRUE
                 AND c.tg_count = 1
                 AND c.review_status_value = 'Overdue'
            THEN
                jsonb_set(
                    c.elem,
                    '{itemFilterQuery,tokenGroups}',
                    '[{"operator": "=", "propertyKey": "NextReviewDate", "value": {"type": "relative", "unit": "year", "amount": -3}}]'::jsonb
                )
            ELSE c.elem
        END AS new_elem
    FROM classified c
),
rebuilt AS (
    SELECT
        t."Id",
        jsonb_agg(t.new_elem ORDER BY t.idx) AS "Filters"
    FROM transformed t
    GROUP BY t."Id"
)
UPDATE risksmart.custom_ribbon cr
SET "Filters" = r."Filters",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
FROM rebuilt r
WHERE cr."Id" = r."Id"
  AND cr."ParentType" = 'document';
