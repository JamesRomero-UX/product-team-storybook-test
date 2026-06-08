-- Rename "tokens" to "tokenGroups" to support complex filtering
with renamed_filters as (
    select cr."Id",
        jsonb_agg(
            jsonb_set(
                jsonb_set(
                    filters,
                    '{itemFilterQuery,tokenGroups}',
                    filters->'itemFilterQuery'->'tokens'
                ),
                '{itemFilterQuery,tokens}',
                '[]'
            )
        ) as "Filters"
    from (
            select "Id",
                jsonb_array_elements("Filters") filters
            from risksmart.custom_ribbon
        ) cr
    group by cr."Id"
)
update risksmart.custom_ribbon cr
set "Filters" = rf."Filters",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
from renamed_filters rf
where cr."Id" = rf."Id";