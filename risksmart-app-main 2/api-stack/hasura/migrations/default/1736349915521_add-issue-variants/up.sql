ALTER TABLE risksmart.issue
  ADD COLUMN "Type" TEXT NOT NULL DEFAULT 'issue' check (
    "Type" in (
               'issue',
               'issue_breach_log',
               'issue_sar_log',
               'issue_gdpr_breach_log',
               'issue_pci_breach_log',
               'issue_consumer_duty',
               'issue_customer_trust',
               'issue_risk_event'));

ALTER TABLE risksmart.issue_audit
  ADD COLUMN "Type" TEXT;

CREATE OR REPLACE FUNCTION risksmart.issue_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

  DECLARE updated_user TEXT;

  DECLARE update_timestamp timestamp with time zone;

BEGIN if (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.issue_audit(
  "Id",
  "CustomAttributeData",
  "Title",
  "Details",
  "ImpactsCustomer",
  "IsExternalIssue",
  "DateOccurred",
  "DateIdentified",
  "Meta",
  "OrgKey",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Action",
  "SequentialId",
  "RaisedAtTimestamp",
  "Type"
)
values (
         nr."Id",
         nr."CustomAttributeData",
         nr."Title",
         nr."Details",
         nr."ImpactsCustomer",
         nr."IsExternalIssue",
         nr."DateOccurred",
         nr."DateIdentified",
         nr."Meta",
         nr."OrgKey",
         updated_user,
         update_timestamp,
         nr."CreatedByUser",
         nr."CreatedAtTimestamp",
         TG_OP,
         nr."SequentialId",
         nr."RaisedAtTimestamp",
         nr."Type"
       );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;


INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES
  ('issue_breach_log', 'issue breach log'),
  ('issue_sar_log', 'issue sar log'),
  ('issue_gdpr_breach_log', 'issue gdpr breach log'),
  ('issue_pci_breach_log', 'issue pci breach log'),
  ('issue_consumer_duty', 'issue consumer duty'),
  ('issue_customer_trust', 'issue customer trust'),
  ('issue_risk_event', 'issue risk event');

ALTER TABLE risksmart.issue
  ADD CONSTRAINT "issue_type_parent_type_fkey" FOREIGN KEY ("Type") REFERENCES risksmart.parent_type("Value");

CREATE OR REPLACE FUNCTION risksmart.set_issue_sequential_id() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN IF new."SequentialId" IS NULL THEN
  CASE new."Type"
    WHEN 'issue'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'issue');
    WHEN 'issue_breach_log'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'issue_breach_log');
    WHEN 'issue_sar_log'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'issue_sar_log');
    WHEN 'issue_gdpr_breach_log'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'issue_gdpr_breach_log');
    WHEN 'issue_pci_breach_log'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'issue_pci_breach_log');
    WHEN 'issue_consumer_duty'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'issue_consumer_duty');
    WHEN 'issue_customer_trust'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'issue_customer_trust');
    WHEN 'issue_risk_event'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'issue_risk_event');
    END CASE;
END IF;

return new;

END $$;

DROP INDEX risksmart.idx_issue_orgkey_sequentialid;
CREATE UNIQUE INDEX idx_issue_orgkey_sequentialid ON risksmart.issue("OrgKey", "SequentialId", "Type");

DROP TRIGGER IF EXISTS a_set_sequential_id_trigger on risksmart.issue;
DROP TRIGGER IF EXISTS set_sequential_id_trigger on risksmart.issue;
CREATE TRIGGER set_sequential_id_trigger BEFORE
  INSERT ON risksmart.issue for each ROW
EXECUTE PROCEDURE risksmart.set_issue_sequential_id();

INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES
  ('issue_assessment_breach_log', 'issue assessment breach log'),
  ('issue_assessment_sar_log', 'issue assessment sar log'),
  ('issue_assessment_gdpr_breach_log', 'issue assessment gdpr breach log'),
  ('issue_assessment_pci_breach_log', 'issue assessment pci breach log'),
  ('issue_assessment_consumer_duty', 'issue assessment consumer duty'),
  ('issue_assessment_customer_trust', 'issue assessment customer trust'),
  ('issue_assessment_risk_event', 'issue assessment risk event');

ALTER TABLE risksmart.issue_assessment
  ADD COLUMN "Type" TEXT NOT NULL DEFAULT 'issue_assessment' check (
    "Type" in (
               'issue_assessment_breach_log',
               'issue_assessment_sar_log',
               'issue_assessment_gdpr_breach_log',
               'issue_assessment_pci_breach_log',
               'issue_assessment_consumer_duty',
               'issue_assessment_customer_trust',
               'issue_assessment_risk_event',
               'issue_assessment'));

ALTER TABLE risksmart.issue_assessment_audit
  ADD COLUMN "Type" TEXT NOT NULL DEFAULT 'issue_assessment';

CREATE OR REPLACE FUNCTION risksmart.issue_assessment_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

  DECLARE updated_user TEXT;

  DECLARE update_timestamp timestamp with time zone;

BEGIN if (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.issue_assessment_audit(
  "Id",
  "CustomAttributeData",
  "ParentIssueId",
  "IssueType",
  "Severity",
  "TargetCloseDate",
  "ActualCloseDate",
  "Status",
  "CertifiedIndividual",
  "RegulatoryBreach",
  "RegulationsBreached",
  "Reportable",
  "Rationale",
  "IssueCausedByThirdParty",
  "ThirdPartyResponsible",
  "IssueCausedBySystemIssue",
  "SystemResponsible",
  "PolicyBreach",
  "PoliciesBreached",
  "PolicyOwner",
  "PolicyOwnerCommentary",
  "Meta",
  "Type",
  "OrgKey",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Action"
)
values (
         nr."Id",
         nr."CustomAttributeData",
         nr."ParentIssueId",
         nr."IssueType",
         nr."Severity",
         nr."TargetCloseDate",
         nr."ActualCloseDate",
         nr."Status",
         nr."CertifiedIndividual",
         nr."RegulatoryBreach",
         nr."RegulationsBreached",
         nr."Reportable",
         nr."Rationale",
         nr."IssueCausedByThirdParty",
         nr."ThirdPartyResponsible",
         nr."IssueCausedBySystemIssue",
         nr."SystemResponsible",
         nr."PolicyBreach",
         nr."PoliciesBreached",
         nr."PolicyOwner",
         nr."PolicyOwnerCommentary",
         nr."Meta",
         nr."Type",
         nr."OrgKey",
         updated_user,
         update_timestamp,
         nr."CreatedByUser",
         nr."CreatedAtTimestamp",
         TG_OP
       );

RETURN nr;

END;
$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.issue_assessment
  ADD CONSTRAINT "issue_assessment_type_parent_type_fkey" FOREIGN KEY ("Type") REFERENCES risksmart.parent_type("Value");
