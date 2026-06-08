-- Delete any stuff that isn't consistent
ALTER TABLE risksmart.change_request DISABLE TRIGGER change_request_audit_trigger;
ALTER TABLE risksmart.approver_response DISABLE TRIGGER approver_response_audit_trigger;
ALTER TABLE risksmart.approver DISABLE TRIGGER approver_audit_trigger;

DELETE FROM risksmart.approver WHERE NOT EXISTS (
  SELECT approval_level."Id"
    FROM risksmart.approval_level
  WHERE approver."LevelId" = approval_level."Id"
);

DELETE FROM risksmart.approver_response WHERE NOT EXISTS (
  SELECT change_request."Id"
    FROM risksmart.change_request
  WHERE approver_response."ChangeRequestId" = change_request."Id"
);

DELETE FROM risksmart.change_request
WHERE NOT EXISTS (
	SELECT node."Id"
		FROM risksmart.node
	WHERE change_request."ParentId" = node."Id"
);


-- reenable triggers
ALTER TABLE risksmart.change_request ENABLE TRIGGER change_request_audit_trigger;
ALTER TABLE risksmart.approver_response ENABLE TRIGGER approver_response_audit_trigger;
ALTER TABLE risksmart.approver ENABLE TRIGGER approver_audit_trigger;

ALTER TABLE risksmart.change_request
  ADD CONSTRAINT change_request_parent_id_fk
  FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.approver_response DROP CONSTRAINT "approver_response_ChangeRequestId_fkey";
ALTER TABLE risksmart.approver_response
  ADD CONSTRAINT approver_response_change_request_id_fk
  FOREIGN KEY ("ChangeRequestId") REFERENCES risksmart.change_request("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.approver_response_audit DROP CONSTRAINT "approver_response_audit_ChangeRequestId_fkey";
ALTER TABLE risksmart.approver ADD CONSTRAINT approver_level_fk FOREIGN KEY ("LevelId") REFERENCES risksmart.approval_level("Id") ON DELETE CASCADE;
