-- Set all the custom attribute descriptions to "" so they can be uses for help details
update risksmart.custom_attribute_schema c
set "Schema" = u."Schema",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
from (
        select cas."Id",
            jsonb_set(
                cas."Schema",
                '{properties}',
                jsonb_object_agg(p.key, p.value || '{"description": ""}')
            ) AS "Schema"
        from risksmart.custom_attribute_schema cas,
            jsonb_each(cas."Schema"->'properties') p
        group by cas."Id"
    ) u
WHERE c."Id" = u."Id"