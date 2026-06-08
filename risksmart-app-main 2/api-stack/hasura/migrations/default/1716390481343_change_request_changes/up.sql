ALTER TABLE "risksmart"."change_request" ADD COLUMN "RequestedChanges" jsonb;
ALTER TABLE "risksmart"."change_request_audit" ADD COLUMN "RequestedChanges" jsonb;

CREATE OR REPLACE FUNCTION risksmart.change_request_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;
DECLARE updated_user TEXT;
DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then
  nr := NEW;
  updated_user := NEW."ModifiedByUser";
  update_timestamp := NEW."ModifiedAtTimestamp";
ELSEIF (TG_OP = 'DELETE') THEN
  nr := OLD;
  updated_user := risksmart.get_hasura_user_id();
  update_timestamp := statement_timestamp();
END IF;

insert into risksmart.change_request_audit(
  "Id",
  "SequentialId",
  "OrgKey",
  "ParentId",
  "ChangeRequestStatus",
  "Changes",
  "RequestedChanges",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "Comment",
  "Action"
)
values (
        nr."Id",
        nr."SequentialId",
        nr."OrgKey",
        nr."ParentId",
        nr."ChangeRequestStatus",
        nr."Changes",
        nr."RequestedChanges",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        nr."Comment",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;


-- MIGRATE OLD CHANGE REQUESTS INTO THE NEW FORMAT SO WHEN THEY MERGE THEY WILL WORK STILL

-- publish-document-version workflow
UPDATE risksmart.change_request SET
	"Changes" = jsonb_set("Changes", '{Id}', to_jsonb("ParentId")),
	"ModifiedAtTimestamp" = now(),
	"ModifiedByUser" = 'SYSTEM'
WHERE "ParentId" IN (
	SELECT "Id" FROM risksmart.node WHERE "ObjectType" = 'document_file'
);

UPDATE risksmart.change_request SET
	"RequestedChanges" = to_jsonb("Changes"),
	"ModifiedAtTimestamp" = now() + INTERVAL '1 second',
	"ModifiedByUser" = 'SYSTEM'
WHERE "ParentId" IN (
	SELECT "Id" FROM risksmart.node WHERE "ObjectType" = 'document_file'
);

UPDATE risksmart.change_request SET
	"Changes" = jsonb_build_array("ParentId", "CreatedByUser", "Changes"),
	"ModifiedAtTimestamp" = now() + INTERVAL '2 second',
	"ModifiedByUser" = 'SYSTEM'
WHERE "ParentId" IN (
	SELECT "Id" FROM risksmart.node WHERE "ObjectType" = 'document_file'
);


-- open-acceptance-workflow
UPDATE risksmart.change_request SET
	"Changes" = jsonb_set("Changes", '{Id}', to_jsonb("ParentId")),
	"ModifiedAtTimestamp" = now(),
	"ModifiedByUser" = 'SYSTEM'
WHERE "ParentId" IN (
	SELECT "Id" FROM risksmart.node WHERE "ObjectType" = 'acceptance'
);

UPDATE risksmart.change_request SET
	"RequestedChanges" = to_jsonb("Changes"),
	"ModifiedAtTimestamp" = now() + INTERVAL '1 second',
	"ModifiedByUser" = 'SYSTEM'
WHERE "ParentId" IN (
	SELECT "Id" FROM risksmart.node WHERE "ObjectType" = 'acceptance'
);

UPDATE risksmart.change_request SET
	"Changes" = jsonb_build_array("ParentId", "CreatedByUser", "Changes"),
	"ModifiedAtTimestamp" = now() + INTERVAL '2 second',
	"ModifiedByUser" = 'SYSTEM'
WHERE "ParentId" IN (
	SELECT "Id" FROM risksmart.node WHERE "ObjectType" = 'acceptance'
);
