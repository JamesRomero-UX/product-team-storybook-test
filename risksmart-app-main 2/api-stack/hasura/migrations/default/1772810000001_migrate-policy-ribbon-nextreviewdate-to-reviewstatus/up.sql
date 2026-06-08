-- Migrate policy (document) custom ribbon filters from NextReviewDate-based
-- relative date filters to ReviewStatus-based label filters.
--
-- Old "Due for review" filter:
--   tokenGroups: [{propertyKey: 'NextReviewDate', value: {type: 'relative', ...}}, ...], operation: 'or'
-- New "Due for review" filter:
--   tokenGroups: [{propertyKey: 'ReviewStatus', value: 'Due'}], operation: 'and'
--
-- Old "Overdue" filter:
--   tokenGroups: [{propertyKey: 'NextReviewDate', value: {type: 'relative', unit: 'year', amount: -3}}], operation: 'and'
-- New "Overdue" filter:
--   tokenGroups: [{propertyKey: 'ReviewStatus', value: 'Overdue'}], operation: 'and'
--
-- Only affects orgs that have explicitly customised their policy ribbon.
-- Orgs using defaults have no custom_ribbon row and get new defaults from code.

WITH exploded AS (
    -- Explode each filter from the Filters array with its position
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
        e.elem->'itemFilterQuery'->>'operation' AS operation,
        jsonb_array_length(COALESCE(e.elem->'itemFilterQuery'->'tokenGroups', '[]'::jsonb)) AS tg_count,
        -- Check if ALL tokenGroups reference NextReviewDate
        (
            SELECT bool_and(tg->>'propertyKey' = 'NextReviewDate')
            FROM jsonb_array_elements(
                COALESCE(e.elem->'itemFilterQuery'->'tokenGroups', '[]'::jsonb)
            ) tg
        ) AS all_next_review_date
    FROM exploded e
),
transformed AS (
    SELECT
        c."Id",
        c.idx,
        CASE
            -- "Due for review" pattern: multiple NextReviewDate tokenGroups with 'or' operation
            WHEN c.all_next_review_date IS TRUE
                 AND c.operation = 'or'
                 AND c.tg_count > 1
            THEN
                jsonb_set(
                    jsonb_set(
                        c.elem,
                        '{itemFilterQuery,tokenGroups}',
                        '[{"operator": "=", "propertyKey": "ReviewStatus", "value": "Due"}]'::jsonb
                    ),
                    '{itemFilterQuery,operation}',
                    '"and"'::jsonb
                )
            -- "Overdue" pattern: single NextReviewDate tokenGroup with 'and' operation
            WHEN c.all_next_review_date IS TRUE
                 AND c.operation = 'and'
                 AND c.tg_count = 1
            THEN
                jsonb_set(
                    c.elem,
                    '{itemFilterQuery,tokenGroups}',
                    '[{"operator": "=", "propertyKey": "ReviewStatus", "value": "Overdue"}]'::jsonb
                )
            -- Leave other filters unchanged
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
