ALTER TABLE risksmart."test_result"
  ALTER COLUMN "Title" DROP NOT NULL;

ALTER TABLE risksmart."test_result_audit"
  ALTER COLUMN "Title" DROP NOT NULL;
