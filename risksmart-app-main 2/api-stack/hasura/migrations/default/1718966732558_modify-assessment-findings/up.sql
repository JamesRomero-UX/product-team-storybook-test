ALTER TABLE risksmart.risk_assessment_result
ADD COLUMN "ModifiedByUser" text NOT NULL default '',
ADD COLUMN "ModifiedAtTimestamp" timestamp with time zone;

ALTER TABLE risksmart.obligation_assessment_result
ADD COLUMN "ModifiedByUser" text NOT NULL default '',
ADD COLUMN "ModifiedAtTimestamp" timestamp with time zone;

ALTER TABLE risksmart.document_assessment_result
ADD COLUMN "ModifiedByUser" text NOT NULL default '',
ADD COLUMN "ModifiedAtTimestamp" timestamp with time zone;

UPDATE risksmart.risk_assessment_result
    SET "ModifiedByUser" = "CreatedByUser", "ModifiedAtTimestamp" = "CreatedAtTimestamp";

UPDATE risksmart.obligation_assessment_result
    SET "ModifiedByUser" = "CreatedByUser", "ModifiedAtTimestamp" = "CreatedAtTimestamp";

UPDATE risksmart.document_assessment_result
    SET "ModifiedByUser" = "CreatedByUser", "ModifiedAtTimestamp" = "CreatedAtTimestamp";
