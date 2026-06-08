ALTER TABLE risksmart.change_request
  DROP CONSTRAINT "change_request_parent_id_fk";
ALTER TABLE risksmart.change_request
  ALTER COLUMN "ParentId" DROP NOT NULL;
ALTER TABLE risksmart.change_request_audit
  ALTER COLUMN "ParentId" DROP NOT NULL;

INSERT INTO risksmart.approval_status ("Value", "Comment") VALUES ('deleted', 'The parent node has been deleted');

CREATE OR REPLACE FUNCTION risksmart.change_request_parent_deleted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE risksmart.change_request
  SET
    "ChangeRequestStatus" = 'deleted',
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
  WHERE "ParentId" = OLD."Id" AND "ChangeRequestStatus" = 'pending';
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER change_request_parent_deleted
BEFORE DELETE ON risksmart.node
FOR EACH ROW
EXECUTE FUNCTION risksmart.change_request_parent_deleted();
