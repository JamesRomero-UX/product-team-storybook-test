-- Rename triggers to ensure they run before node_insert (triggers run in alphabetical order)
ALTER TRIGGER set_sequential_id_trigger ON risksmart.assessment
RENAME TO a_set_sequential_id_trigger;

ALTER TRIGGER set_sequential_id_trigger ON risksmart.issue
RENAME TO a_set_sequential_id_trigger;

-- Update existing SequentialId values for nodes
UPDATE risksmart.node n
SET "SequentialId" = i."SequentialId"
    from risksmart.assessment i
WHERE i."Id" = n."Id";

update risksmart.node n
SET "SequentialId" = i."SequentialId"
    from risksmart.issue i
WHERE i."Id" = n."Id";
