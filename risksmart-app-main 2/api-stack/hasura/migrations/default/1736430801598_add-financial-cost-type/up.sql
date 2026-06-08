INSERT INTO risksmart.cost_type (
  "Value",
  "Comment"
) Values (
  'financial',
  'Financial'
);

UPDATE risksmart.consequence
SET "CostType" = 'financial',
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
WHERE "CostType" = 'pounds';

DELETE FROM risksmart.cost_type
WHERE "Value" = 'pounds';
