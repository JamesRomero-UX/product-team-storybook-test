CREATE OR REPLACE FUNCTION risksmart.set_assessment_sequential_id() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN IF new."SequentialId" IS NULL THEN
  CASE new."Type"
    WHEN 'rating'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'assessment');
    WHEN 'compliance_monitoring_assessment'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'compliance_monitoring_assessment');
    WHEN 'internal_audit_report'
      THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", 'internal_audit_report');
    END CASE;
END IF;

return new;

END $$;

DROP INDEX risksmart.idx_assessment_orgKey_sequentialid;
CREATE UNIQUE INDEX idx_assessment_orgKey_sequentialid ON risksmart.assessment("OrgKey", "SequentialId", "Type");

DROP TRIGGER IF EXISTS set_sequential_id_trigger on risksmart.assessment;
CREATE TRIGGER set_sequential_id_trigger BEFORE
  INSERT ON risksmart.assessment for each ROW
EXECUTE PROCEDURE risksmart.set_assessment_sequential_id()

