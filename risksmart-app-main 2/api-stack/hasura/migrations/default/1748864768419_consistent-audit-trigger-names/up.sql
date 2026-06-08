CREATE SCHEMA risksmart_obsolete;

ALTER TABLE risksmart.old_document_assessment
SET SCHEMA risksmart_obsolete;

ALTER TABLE risksmart.old_risk_assessment
SET SCHEMA risksmart_obsolete;

ALTER TABLE risksmart.old_obligation_assessment
SET SCHEMA risksmart_obsolete;

ALTER TRIGGER tag_type_group_audit_insert_trigger ON risksmart.tag_type_group
RENAME TO tag_type_group_audit_trigger;

ALTER TRIGGER department_type_group_audit_insert_trigger ON risksmart.department_type_group
RENAME TO department_type_group_audit_trigger;

DROP TRIGGER tag_audit_delete_trigger ON risksmart.tag;

DROP TRIGGER tag_audit_insert_trigger ON risksmart.tag;

DROP TRIGGER tag_audit_update_trigger ON risksmart.tag;

CREATE TRIGGER tag_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.tag FOR EACH ROW EXECUTE FUNCTION risksmart.tag_modified();

DROP TRIGGER tag_type_audit_delete_trigger ON risksmart.tag_type;

DROP TRIGGER tag_type_audit_insert_trigger ON risksmart.tag_type;

DROP TRIGGER tag_type_audit_update_trigger ON risksmart.tag_type;

CREATE TRIGGER tag_type_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.tag_type FOR EACH ROW EXECUTE FUNCTION risksmart.tag_type_modified();

ALTER TRIGGER user_table_preferences_trigger ON risksmart.user_table_preferences
RENAME TO user_table_preferences_audit_trigger;

CREATE TRIGGER enterprise_risk_score_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.enterprise_risk_score FOR EACH ROW EXECUTE FUNCTION risksmart.enterprise_risk_score_modified();