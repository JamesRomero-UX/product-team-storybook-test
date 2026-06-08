-- Remove filtering_placeholder_free_text key
UPDATE risksmart.taxonomy
SET "ModifiedAtTimestamp" = now() - (3 * interval '1  ms'),
    "Common" = "Common" #- '{tables,filtering_placeholder_free_text}',
    "ModifiedByUser" = 'SYSTEM'
WHERE "Common"->'tables'->'filtering_placeholder_free_text' = '"Filter {{entity, lowercase, plural}} by free text, property or value"';

-- Remove filtering_placeholder key
UPDATE risksmart.taxonomy
SET "ModifiedAtTimestamp" = now() - (2 * interval '1  ms'),
    "Common" = "Common" #- '{tables,filtering_placeholder}',
    "ModifiedByUser" = 'SYSTEM'
WHERE "Common"->'tables'->'filtering_placeholder' = '"Filter {{entity, lowercase, plural}} by free text, property or value"';

UPDATE risksmart.taxonomy
SET "ModifiedAtTimestamp" = now() - (2 * interval '1  ms'),
    "Common" = "Common" #- '{tables,filtering_placeholder}',
    "ModifiedByUser" = 'SYSTEM'
WHERE "Common"->'tables'->'filtering_placeholder' = '"Filter {{entity, lowercase, plural}} by property or value"';

-- Remove paging_option key
UPDATE risksmart.taxonomy
SET "ModifiedAtTimestamp" = now() - (1 * interval '1  ms'),
    "Common" = "Common" #- '{tables,paging_option}',
    "ModifiedByUser" = 'SYSTEM'
WHERE "Common"->'tables'->'paging_option' = '"{{size}} {{entity, lowercase, plural}}"';

-- Remove loading_message key
UPDATE risksmart.taxonomy
SET "ModifiedAtTimestamp" = now() - (0 * interval '1  ms'),
    "Common" = "Common" #- '{tables,loading_message}',
    "ModifiedByUser" = 'SYSTEM'
WHERE "Common"->'tables'->'loading_message' = '"Loading {{entity, lowercase, plural}}"';