
ALTER TABLE "risksmart"."approval" ALTER COLUMN "ParentId" DROP NOT NULL;
ALTER TABLE "risksmart"."approval_audit" ALTER COLUMN "ParentId" DROP NOT NULL;

CREATE OR REPLACE FUNCTION risksmart.approval_modified() RETURNS trigger AS $body$
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

insert into risksmart.approval_audit(
        "Id",
        "ParentId",
        "ParentType",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ParentId",
        nr."ParentType",
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

-- Rather than storing data in random json blobs for the levels, create tables for them.

CREATE TABLE risksmart.approval_result_level (
    "Id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "ApprovalResultId" uuid NOT NULL,
    "ApprovalLevelId" uuid NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    FOREIGN KEY ("ApprovalResultId") REFERENCES risksmart.approval_result("Id") ON DELETE CASCADE,
    FOREIGN KEY ("ApprovalLevelId") REFERENCES risksmart.approval_level("Id") ON DELETE CASCADE,
    CONSTRAINT "result_and_level_unique" UNIQUE ("ApprovalResultId", "ApprovalLevelId")
);

CREATE DOMAIN risksmart.approver_response AS TEXT CHECK (
    VALUE IN ('APPROVED', 'REJECTED')
);

CREATE TABLE risksmart.approval_result_level_approver (
  "Id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "ApprovalResultLevelId" uuid NOT NULL,
  "ApproverId" uuid NOT NULL,
  "ApproverResponse" risksmart.approver_response,
  "ModifiedByUser" text NULL,
  "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
  "CreatedByUser" text,
  "CreatedAtTimestamp" timestamp with time zone NOT NULL,
  FOREIGN KEY ("ApprovalResultLevelId") REFERENCES risksmart.approval_result_level("Id") ON DELETE CASCADE,
  FOREIGN KEY ("ApproverId") REFERENCES risksmart.approver("Id") ON DELETE CASCADE,
  CONSTRAINT "result_level_and_approver_unique" UNIQUE ("ApprovalResultLevelId", "ApproverId")
);


-- approval result level approver audit
CREATE TABLE IF NOT EXISTS risksmart.approval_result_level_approver_audit (LIKE risksmart.approval_result_level_approver);

ALTER TABLE risksmart.approval_result_level_approver_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_result_level_approver_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.approval_result_level_approver_modified() RETURNS trigger AS $body$
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



insert into risksmart.approval_result_level_approver_audit(
        "Id",
        "ApprovalResultLevelId",
        "ApproverId",
        "ApproverResponse",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ApprovalResultLevelId",
        nr."ApproverId",
        nr."ApproverResponse",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER approval_result_level_approver_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval_result_level_approver FOR EACH ROW EXECUTE FUNCTION risksmart.approval_result_level_approver_modified();




-- approval_result_level audit
CREATE TABLE IF NOT EXISTS risksmart.approval_result_level_audit (LIKE risksmart.approval_result_level);

ALTER TABLE risksmart.approval_result_level_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_result_level_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.approval_result_level_modified() RETURNS trigger AS $body$
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



insert into risksmart.approval_result_level_audit(
        "Id",
        "ApprovalResultId",
        "ApprovalLevelId",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ApprovalResultId",
        nr."ApprovalLevelId",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER approval_result_level_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval_result_level FOR EACH ROW EXECUTE FUNCTION risksmart.approval_result_level_modified();



-- drop old json blobs
ALTER TABLE risksmart.approval_result DROP COLUMN "ApproverData";
ALTER TABLE risksmart.approval_result DROP COLUMN "ApproverDataHistory";
ALTER TABLE risksmart.approval_result_audit DROP COLUMN "ApproverData";
ALTER TABLE risksmart.approval_result_audit DROP COLUMN "ApproverDataHistory";

CREATE OR REPLACE FUNCTION risksmart.approval_result_modified() RETURNS trigger AS $body$
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

insert into risksmart.approval_result_audit(
        "Id",
        "ApprovalId",
        "ParentId",
        "ParentType",
        "ApprovalStatus",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ApprovalId",
        nr."ParentId",
        nr."ParentType",
        nr."ApprovalStatus",
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

ALTER TABLE risksmart.approval_result DROP COLUMN "ApprovalId";
ALTER TABLE risksmart.approval_result_audit DROP COLUMN "ApprovalId";

CREATE OR REPLACE FUNCTION risksmart.approval_result_modified() RETURNS trigger AS $body$
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

insert into risksmart.approval_result_audit(
        "Id",
        "ParentId",
        "ParentType",
        "ApprovalStatus",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ParentId",
        nr."ParentType",
        nr."ApprovalStatus",
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

CREATE VIEW risksmart.global_approvals_view AS
  SELECT * from risksmart.approval WHERE "ParentId" IS NULL;

ALTER TABLE "risksmart"."approver"
  ALTER COLUMN "UserId" DROP NOT NULL,
  ADD COLUMN "OwnerApprover" boolean,
  ADD CONSTRAINT user_id_xor_owner_approver CHECK (
    ("UserId" IS NOT NULL AND "OwnerApprover" IS NOT TRUE) OR
    ("UserId" IS NULL AND "OwnerApprover" IS TRUE)
  );

ALTER TABLE "risksmart"."approver_audit"
  ALTER COLUMN "UserId" DROP NOT NULL,
  ADD COLUMN "OwnerApprover" boolean,
  ADD CONSTRAINT user_id_xor_owner_approver CHECK (
    ("UserId" IS NOT NULL AND "OwnerApprover" IS NOT TRUE) OR
    ("UserId" IS NULL AND "OwnerApprover" IS TRUE)
  );

CREATE OR REPLACE FUNCTION risksmart.approver_modified() RETURNS trigger AS $body$
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

insert into risksmart.approver_audit(
        "Id",
        "UserId",
        "OwnerApprover",
        "LevelId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."UserId",
        nr."OwnerApprover",
        nr."LevelId",
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

CREATE DOMAIN risksmart.approver_response_type AS TEXT CHECK (
    VALUE IN ('APPROVED', 'REJECTED')
);

-- looks scary but it's not i promise 🫶🏻
DROP TABLE "risksmart"."approval_result_level_approver_audit";
DROP TABLE "risksmart"."approval_result_level_approver";
DROP TABLE "risksmart"."approval_result_level_audit";
DROP TABLE "risksmart"."approval_result_level";
DROP FUNCTION "risksmart"."approval_result_level_modified";
DROP FUNCTION "risksmart"."approval_result_level_approver_modified";
DROP DOMAIN risksmart.approver_response;

-- This is the new table that will replace the old ones
CREATE TABLE "risksmart"."approver_response" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "ApproverId" uuid NOT NULL REFERENCES risksmart.approver("Id") ON DELETE CASCADE,
    "Response" risksmart.approver_response_type,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text NOT NULL,
    "Comment" text
);

-- migrate

CREATE TABLE "risksmart"."approver_response_audit" (LIKE risksmart.approver_response);

ALTER TABLE "risksmart"."approver_response_audit"
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE "risksmart"."approver_response_audit"
ADD COLUMN "Action" risksmart.db_action;

-- audit table

CREATE OR REPLACE FUNCTION risksmart.approver_response_modified() RETURNS trigger AS $body$
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

insert into risksmart.approver_response_audit(
  "Id",
  "ApproverId",
  "Response",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Comment",
  "Action"
)
values (
        nr."Id",
        nr."ApproverId",
        nr."Response",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Comment",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER approver_response_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approver_response FOR EACH ROW EXECUTE FUNCTION risksmart.approver_response_modified();

ALTER TABLE "risksmart"."approver_response"
  ADD COLUMN "ParentId" uuid NOT NULL;

ALTER TABLE "risksmart"."approver_response_audit"
  ADD COLUMN "ParentId" uuid NOT NULL;

CREATE OR REPLACE FUNCTION risksmart.approver_response_modified() RETURNS trigger AS $body$
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

insert into risksmart.approver_response_audit(
  "Id",
  "ApproverId",
  "Response",
  "ParentId",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Comment",
  "Action"
)
values (
  nr."Id",
  nr."ApproverId",
  nr."Response",
  nr."ParentId",
  updated_user,
  update_timestamp,
  nr."CreatedByUser",
  nr."CreatedAtTimestamp",
  nr."Comment",
  TG_OP
);

RETURN nr;

END;

$body$ LANGUAGE plpgsql;


CREATE TABLE risksmart.change_request (
  "Id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "OrgKey" text NOT NULL,
  "ParentId" uuid NOT NULL,
  "ChangeRequestStatus" text NOT NULL REFERENCES risksmart.approval_status("Value"),
  "Changes" jsonb NOT NULL,
  "CreatedByUser" text NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
  "Comment" text NOT NULL
);

CREATE TABLE "risksmart"."change_request_audit" (LIKE risksmart.change_request);

ALTER TABLE "risksmart"."change_request_audit"
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE "risksmart"."change_request_audit"
ADD COLUMN "Action" risksmart.db_action;


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
  "OrgKey",
  "ParentId",
  "ChangeRequestStatus",
  "Changes",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "Comment",
  "Action"
)
values (
        nr."Id",
        nr."OrgKey",
        nr."ParentId",
        nr."ChangeRequestStatus",
        nr."Changes",
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

CREATE TRIGGER change_request_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.change_request FOR EACH ROW EXECUTE FUNCTION risksmart.change_request_modified();

ALTER TABLE risksmart.approver_response DROP COLUMN "ParentId";
ALTER TABLE risksmart.approver_response_audit DROP COLUMN "ParentId";
ALTER TABLE risksmart.approver_response ADD COLUMN "ChangeRequestId" uuid NOT NULL REFERENCES risksmart.change_request("Id");
ALTER TABLE risksmart.approver_response_audit ADD COLUMN "ChangeRequestId" uuid NOT NULL REFERENCES risksmart.change_request("Id");

CREATE OR REPLACE FUNCTION risksmart.approver_response_modified() RETURNS trigger AS $body$
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

insert into risksmart.approver_response_audit(
  "Id",
  "ApproverId",
  "Response",
  "ChangeRequestId",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Comment",
  "Action"
)
values (
        nr."Id",
        nr."ApproverId",
        nr."Response",
        nr."ChangeRequestId",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Comment",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE "risksmart"."approver_response" DROP COLUMN "Response";
ALTER TABLE "risksmart"."approver_response" ADD COLUMN "Approved" BOOLEAN;

CREATE OR REPLACE FUNCTION risksmart.approver_response_modified() RETURNS trigger AS $body$
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

insert into risksmart.approver_response_audit(
  "Id",
  "ApproverId",
  "Approved",
  "ParentId",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Comment",
  "Action"
)
values (
  nr."Id",
  nr."ApproverId",
  nr."Approved",
  nr."ParentId",
  updated_user,
  update_timestamp,
  nr."CreatedByUser",
  nr."CreatedAtTimestamp",
  nr."Comment",
  TG_OP
);

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE "risksmart"."approver_response_audit" DROP COLUMN "Response";
ALTER TABLE "risksmart"."approver_response_audit" ADD COLUMN "Approved" BOOLEAN;

CREATE OR REPLACE FUNCTION risksmart.approver_response_modified() RETURNS trigger AS $body$
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

insert into risksmart.approver_response_audit(
  "Id",
  "ApproverId",
  "Approved",
  "ChangeRequestId",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Comment",
  "Action"
)
values (
  nr."Id",
  nr."ApproverId",
  nr."Approved",
  nr."ChangeRequestId",
  updated_user,
  update_timestamp,
  nr."CreatedByUser",
  nr."CreatedAtTimestamp",
  nr."Comment",
  TG_OP
);

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.get_change_request_parent_ancestor_contributors(record risksmart.change_request) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."ParentId") ac;
$$ LANGUAGE SQL STABLE;

-- Drop the table
DROP TABLE "risksmart"."approval_result_audit";
DROP TABLE "risksmart"."approval_result";
DROP FUNCTION "risksmart"."approval_result_modified";

-- migrate old approvals for document files to new format
UPDATE "risksmart"."approval" SET
  "ParentType" = 'document_file',
  "ModifiedAtTimestamp" = statement_timestamp(),
  "ModifiedByUser" = 'SYSTEM'
WHERE "ParentType" = 'document';


CREATE TABLE risksmart.approval_in_flight_edit_rule (
    "Value" text PRIMARY KEY,
    "Comment" text NOT NULL
);

INSERT INTO risksmart.approval_in_flight_edit_rule ("Value", "Comment") VALUES
  ('everyone', 'Everyone who has access can edit'),
  ('approvers', 'Only approvers can edit'),
  ('noone', 'No one can edit');

ALTER TABLE risksmart.approval ADD COLUMN "InFlightEditRule" text NOT NULL DEFAULT 'approvers' REFERENCES risksmart.approval_in_flight_edit_rule("Value");
ALTER TABLE risksmart.approval_audit ADD COLUMN "InFlightEditRule" text NOT NULL DEFAULT 'approvers' REFERENCES risksmart.approval_in_flight_edit_rule("Value");

CREATE OR REPLACE FUNCTION risksmart.approval_modified() RETURNS trigger AS $body$
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

insert into risksmart.approval_audit(
        "Id",
        "ParentId",
        "ParentType",
        "InFlightEditRule",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ParentId",
        nr."ParentType",
        nr."InFlightEditRule",
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
