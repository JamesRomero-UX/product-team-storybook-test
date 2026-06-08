-- Remove noItemsToDisplay key
UPDATE risksmart.taxonomy
SET "ModifiedAtTimestamp" = now() - (0 * interval '1  ms'),
    "Common" = "Common" #- '{noItemsToDisplay}',
    "ModifiedByUser" = 'SYSTEM'
WHERE "Common"->'noItemsToDisplay' = '"No {{entity, lowercase, plural}} to display."';