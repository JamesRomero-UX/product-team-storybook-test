CREATE TABLE risksmart.wizard_status("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.wizard_status ("Value", "Comment")
VALUES ('planned', 'Planned'),
    ('inProgress', 'InProgress');

ALTER TABLE IF EXISTS risksmart.wizard
ADD COLUMN IF NOT EXISTS "Status" TEXT NOT NULL DEFAULT 'inProgress';

ALTER TABLE risksmart.wizard
ADD CONSTRAINT "wizard_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.wizard_status("Value");
