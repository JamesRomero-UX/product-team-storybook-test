-- Risk Assessment Result
ALTER TABLE risksmart.risk_assessment_result ADD COLUMN "RatingType" text DEFAULT 'rating' NOT NULL;
ALTER TABLE risksmart.risk_assessment_result_audit ADD COLUMN "RatingType" text;

UPDATE risksmart.risk_assessment_result AS RAR
SET "RatingType" = AR."ParentType",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
  FROM (
        SELECT RAR."Id", ARP."ParentType"
        FROM risksmart.assessment_result_parent AS ARP
            INNER JOIN risksmart.risk_assessment_result AS RAR ON ARP."Id" = RAR."Id"
        WHERE "ParentType" != 'risk'
         ) AS AR
WHERE RAR."Id" = AR."Id";

CREATE OR REPLACE FUNCTION risksmart.risk_assessment_result_modified() RETURNS trigger
  LANGUAGE plpgsql
AS
$body$
DECLARE nr RECORD;

        updated_user TEXT := risksmart.get_hasura_user_id();

        update_timestamp timestamp with time zone := statement_timestamp();

BEGIN IF (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) THEN nr := NEW;

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

END IF;

INSERT INTO risksmart.risk_assessment_result_audit(
  "Id",
  "Rating",
  "Impact",
  "Likelihood",
  "ControlType",
  "OrgKey",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Action",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CustomAttributeData",
  "Rationale",
  "TestDate",
  "RatingType"
)
VALUES (
         nr."Id",
         nr."Rating",
         nr."Impact",
         nr."Likelihood",
         nr."ControlType",
         nr."OrgKey",
         nr."CreatedByUser",
         nr."CreatedAtTimestamp",
         TG_OP,
         updated_user,
         update_timestamp,
         nr."CustomAttributeData",
         nr."Rationale",
         nr."TestDate",
         nr."RatingType"
       );

RETURN nr;

END;

$body$;

-- Document Assessment Result
ALTER TABLE risksmart.document_assessment_result ADD COLUMN "RatingType" text DEFAULT 'rating' NOT NULL;
ALTER TABLE risksmart.document_assessment_result_audit ADD COLUMN "RatingType" text;

UPDATE risksmart.document_assessment_result AS DAR
SET "RatingType" = AR."ParentType",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
       SELECT DAR."Id", ARP."ParentType"
       FROM risksmart.assessment_result_parent AS ARP
            INNER JOIN risksmart.document_assessment_result AS DAR ON ARP."Id" = DAR."Id"
       WHERE "ParentType" != 'document'
     ) AS AR
WHERE DAR."Id" = AR."Id";

CREATE OR REPLACE FUNCTION risksmart.document_assessment_result_modified() RETURNS trigger
  LANGUAGE plpgsql
AS
$body$
DECLARE d_nr RECORD;

        d_updated_user TEXT := risksmart.get_hasura_user_id();

        d_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN IF (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) THEN d_nr := NEW;

ELSIF (TG_OP = 'DELETE') THEN d_nr := OLD;

END IF;

INSERT INTO risksmart.document_assessment_result_audit(
  "Id",
  "Rating",
  "OrgKey",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Action",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CustomAttributeData",
  "Rationale",
  "TestDate",
  "RatingType"
)
VALUES (
         d_nr."Id",
         d_nr."Rating",
         d_nr."OrgKey",
         d_nr."CreatedByUser",
         d_nr."CreatedAtTimestamp",
         TG_OP,
         d_updated_user,
         d_update_timestamp,
         d_nr."CustomAttributeData",
         d_nr."Rationale",
         d_nr."TestDate",
         d_nr."RatingType"
       );

RETURN d_nr;

END;

$body$;

-- Obligation Assessment Result
ALTER TABLE risksmart.obligation_assessment_result ADD COLUMN "RatingType" text DEFAULT 'rating' NOT NULL;
ALTER TABLE risksmart.obligation_assessment_result_audit ADD COLUMN "RatingType" text;

UPDATE risksmart.obligation_assessment_result AS OAR
SET "RatingType" = AR."ParentType",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
       SELECT OAR."Id", ARP."ParentType"
       FROM risksmart.assessment_result_parent AS ARP
              INNER JOIN risksmart.obligation_assessment_result AS OAR ON ARP."Id" = OAR."Id"
       WHERE "ParentType" != 'obligation'
     ) AS AR
WHERE OAR."Id" = AR."Id";

CREATE OR REPLACE FUNCTION risksmart.obligation_assessment_result_modified() RETURNS trigger
  LANGUAGE plpgsql
AS
$body$
DECLARE o_nr RECORD;

        o_updated_user TEXT := risksmart.get_hasura_user_id();

        o_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN IF (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) THEN o_nr := NEW;

ELSIF (TG_OP = 'DELETE') THEN o_nr := OLD;

END IF;

INSERT INTO risksmart.obligation_assessment_result_audit(
  "Id",
  "Rating",
  "OrgKey",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Action",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CustomAttributeData",
  "Rationale",
  "TestDate",
  "RatingType"
)
values (
         o_nr."Id",
         o_nr."Rating",
         o_nr."OrgKey",
         o_nr."CreatedByUser",
         o_nr."CreatedAtTimestamp",
         TG_OP,
         o_updated_user,
         o_update_timestamp,
         o_nr."CustomAttributeData",
         o_nr."Rationale",
         o_nr."TestDate",
         o_nr."RatingType"
       );

RETURN o_nr;

END;

$body$;

-- Impact Rating
ALTER TABLE risksmart.impact_rating ADD COLUMN "RatingType" text DEFAULT 'rating' NOT NULL;
ALTER TABLE risksmart.impact_rating_audit ADD COLUMN "RatingType" text;

UPDATE risksmart.impact_rating AS IR
SET "RatingType" = AR."ParentType",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
       SELECT OAR."Id", ARP."ParentType"
       FROM risksmart.assessment_result_parent AS ARP
              INNER JOIN risksmart.impact_rating AS OAR ON ARP."Id" = OAR."Id"
       WHERE "ParentType" != 'impact'
     ) AS AR
WHERE IR."Id" = AR."Id";

CREATE OR REPLACE FUNCTION risksmart.impact_rating_modified() RETURNS trigger AS
$body$
DECLARE
  anr                        RECORD;
  DECLARE
  a_updated_user     TEXT;
  DECLARE
  a_update_timestamp timestamp with time zone;

BEGIN
  IF
    (
      TG_OP = 'UPDATE'
        OR TG_OP = 'INSERT'
      ) THEN
    anr := NEW;

    a_updated_user
      := NEW."ModifiedByUser";

    a_update_timestamp
      := NEW."ModifiedAtTimestamp";

  ELSIF
    (TG_OP = 'DELETE') THEN
    anr := OLD;

    a_updated_user
      := risksmart.get_hasura_user_id();

    a_update_timestamp
      := statement_timestamp();

  END IF;

  INSERT INTO risksmart.impact_rating_audit(
    "Id",
    "ImpactId",
    "RatedItemId",
    "SequentialId",
    "Rating",
    "TestDate",
    "RatingType",
    "CompletedBy",
    "CustomAttributeData",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "Action")
  VALUES (anr."Id",
          anr."ImpactId",
          anr."RatedItemId",
          anr."SequentialId",
          anr."Rating",
          anr."TestDate",
          anr."RatingType",
          anr."CompletedBy",
          anr."CustomAttributeData",
          anr."OrgKey",
          anr."CreatedByUser",
          anr."CreatedAtTimestamp",
          a_updated_user,
          a_update_timestamp,
          TG_OP);

  RETURN anr;

END;

$body$
  LANGUAGE plpgsql;

CREATE TRIGGER impact_rating_audit_trigger
  AFTER INSERT OR
    UPDATE OR
    DELETE
  ON risksmart.impact_rating
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.impact_rating_modified();

-- Control Test Result
ALTER TABLE risksmart.test_result ADD COLUMN "RatingType" text DEFAULT 'rating' NOT NULL;
ALTER TABLE risksmart.test_result_audit ADD COLUMN "RatingType" text;

UPDATE risksmart.test_result AS IR
SET "RatingType" = AR."ParentType",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
       SELECT OAR."Id", ARP."ParentType"
       FROM risksmart.assessment_result_parent AS ARP
            INNER JOIN risksmart.test_result AS OAR ON ARP."Id" = OAR."Id"
       WHERE "ParentType" != 'control'
     ) AS AR
WHERE IR."Id" = AR."Id";

CREATE OR REPLACE FUNCTION risksmart.test_result_modified() RETURNS TRIGGER
  language plpgsql
AS
$body$
DECLARE nr RECORD;

  DECLARE updated_user TEXT;

  DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.test_result_audit(
  "Id",
  "CustomAttributeData",
  "Title",
  "Description",
  "Submitter",
  "ParentControlId",
  "TestType",
  "DesignEffectiveness",
  "PerformanceEffectiveness",
  "OverallEffectiveness",
  "TestDate",
  "NextTestDate",
  "RatingType",
  "Meta",
  "OrgKey",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Action"
)
VALUES (
         nr."Id",
         nr."CustomAttributeData",
         nr."Title",
         nr."Description",
         nr."Submitter",
         nr."ParentControlId",
         nr."TestType",
         nr."DesignEffectiveness",
         nr."PerformanceEffectiveness",
         nr."OverallEffectiveness",
         nr."TestDate",
         nr."NextTestDate",
         nr."RatingType",
         nr."Meta",
         nr."OrgKey",
         updated_user,
         update_timestamp,
         nr."CreatedByUser",
         nr."CreatedAtTimestamp",
         TG_OP
       );

RETURN nr;

END;

$body$;

-- Fix customer support visibility for IA and compliance
INSERT INTO risksmart."role_access" (
  "RoleKey",
  "ObjectType",
  "ContributorType",
  "AccessType"
)
VALUES
  ('CustomerSupport','internal_audit_entity','any','insert'),
  ('CustomerSupport','internal_audit_entity','any','read'),
  ('CustomerSupport','internal_audit_entity','any','update'),
  ('CustomerSupport','internal_audit_entity','any','delete'),
  ('CustomerSupport','internal_audit_report','any','insert'),
  ('CustomerSupport','internal_audit_report','any','read'),
  ('CustomerSupport','internal_audit_report','any','update'),
  ('CustomerSupport','internal_audit_report','any','delete'),
  ('CustomerSupport','compliance_monitoring_assessment','any','insert'),
  ('CustomerSupport','compliance_monitoring_assessment','any','read'),
  ('CustomerSupport','compliance_monitoring_assessment','any','update'),
  ('CustomerSupport','compliance_monitoring_assessment','any','delete');
