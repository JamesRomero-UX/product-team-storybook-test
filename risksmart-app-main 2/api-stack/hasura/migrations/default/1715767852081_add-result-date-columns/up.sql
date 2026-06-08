ALTER TABLE risksmart.risk
ADD COLUMN "LatestRatingDate" timestamptz NULL,
    ADD COLUMN "NextTestDate" timestamptz NULL,
    ADD COLUMN "TestFrequency" text NULL,
    ADD CONSTRAINT "risk_frequency_fkey" FOREIGN KEY ("TestFrequency") REFERENCES risksmart.test_frequency("Value");

ALTER TABLE risksmart.risk_audit
ADD COLUMN "LatestRatingDate" timestamptz NULL,
    ADD COLUMN "NextTestDate" timestamptz NULL,
    ADD COLUMN "TestFrequency" text NULL;

ALTER TABLE risksmart.obligation
ADD COLUMN "LatestRatingDate" timestamptz NULL,
    ADD COLUMN "NextTestDate" timestamptz NULL,
    ADD COLUMN "TestFrequency" text NULL,
    ADD CONSTRAINT "obligation_frequency_fkey" FOREIGN KEY ("TestFrequency") REFERENCES risksmart.test_frequency("Value");

ALTER TABLE risksmart.obligation_audit
ADD COLUMN "LatestRatingDate" timestamptz NULL,
    ADD COLUMN "NextTestDate" timestamptz NULL,
    ADD COLUMN "TestFrequency" text NULL;

ALTER TABLE risksmart.control
ADD COLUMN "LatestRatingDate" timestamptz NULL,
    ADD COLUMN "NextTestDate" timestamptz NULL;

ALTER TABLE risksmart.control_audit
ADD COLUMN "LatestRatingDate" timestamptz NULL,
    ADD COLUMN "NextTestDate" timestamptz NULL;

ALTER TABLE risksmart.document
ADD COLUMN "LatestRatingDate" timestamptz NULL,
    ADD COLUMN "NextTestDate" timestamptz NULL,
    ADD COLUMN "TestFrequency" text NULL,
    ADD CONSTRAINT "document_frequency_fkey" FOREIGN KEY ("TestFrequency") REFERENCES risksmart.test_frequency("Value");

ALTER TABLE risksmart.document_audit
ADD COLUMN "LatestRatingDate" timestamptz NULL,
    ADD COLUMN "NextTestDate" timestamptz NULL,
    ADD COLUMN "TestFrequency" text NULL;

CREATE OR REPLACE FUNCTION risksmart.risk_modified() RETURNS trigger AS $body$
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

insert into risksmart.risk_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Tier",
        "ParentRiskId",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "Treatment",
        "Status",
        "SequentialId",
        "LatestRatingDate",
        "NextTestDate",
        "TestFrequency"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Tier",
        nr."ParentRiskId",
        nr."Description",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."Treatment",
        nr."Status",
        nr."SequentialId",
        nr."LatestRatingDate",
        nr."NextTestDate",
        nr."TestFrequency"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.obligation_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_audit(
        "Id",
        "CustomAttributeData",
        "ParentId",
        "Title",
        "Description",
        "Interpretation",
        "Adherence",
        "Type",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "SequentialId",
        "LatestRatingDate",
        "NextTestDate",
        "TestFrequency"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."ParentId",
        nr."Title",
        nr."Description",
        nr."Interpretation",
        nr."Adherence",
        nr."Type",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."SequentialId",
        nr."LatestRatingDate",
        nr."NextTestDate",
        nr."TestFrequency"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.control_modified() RETURNS trigger AS $body$
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

insert into risksmart.control_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Type",
        "Meta",
        "OrgKey",
        "SequentialId",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "LatestRatingDate",
        "NextTestDate",
        "TestFrequency"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Description",
        nr."Type",
        nr."Meta",
        nr."OrgKey",
        nr."SequentialId",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."LatestRatingDate",
        nr."NextTestDate",
        nr."TestFrequency"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.document_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "DocumentType",
        "Purpose",
        "ParentDocument",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action",
        "SequentialId",
        "LatestRatingDate",
        "NextTestDate",
        "TestFrequency"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."DocumentType",
        nr."Purpose",
        nr."ParentDocument",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP,
        nr."SequentialId",
        nr."LatestRatingDate",
        nr."NextTestDate",
        nr."TestFrequency"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

UPDATE risksmart.document as d
SET "LatestRatingDate" = ldar."TestDate",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
        SELECT DISTINCT ON (d."Id") dar."TestDate",
            d."Id"
        FROM risksmart.assessment_result_parent as arp
            INNER JOIN risksmart.document_assessment_result as dar ON dar."Id" = arp."Id"
            JOIN risksmart.document as d on arp."ParentId" = d."Id"
        WHERE arp."ParentId" = d."Id"
            AND arp."ParentType" = 'document'
            AND dar."TestDate" IS NOT NULL
        ORDER BY d."Id",
            dar."TestDate" DESC
    ) as ldar
WHERE d."Id" = ldar."Id";

UPDATE risksmart.risk as r
SET "LatestRatingDate" = lrar."TestDate",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
        SELECT DISTINCT ON (r."Id") rar."TestDate",
            r."Id"
        FROM risksmart.assessment_result_parent as arp
            INNER JOIN risksmart.risk_assessment_result as rar ON rar."Id" = arp."Id"
            JOIN risksmart.risk as r on arp."ParentId" = r."Id"
        WHERE arp."ParentId" = r."Id"
            AND arp."ParentType" = 'risk'
            AND rar."TestDate" IS NOT NULL
        ORDER BY r."Id",
            rar."TestDate" DESC
    ) as lrar
WHERE r."Id" = lrar."Id";

UPDATE risksmart.obligation as o
SET "LatestRatingDate" = loar."TestDate",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
        SELECT DISTINCT ON (o."Id") oar."TestDate",
            o."Id"
        FROM risksmart.assessment_result_parent as arp
            INNER JOIN risksmart.obligation_assessment_result as oar ON oar."Id" = arp."Id"
            JOIN risksmart.obligation as o on arp."ParentId" = o."Id"
        WHERE arp."ParentId" = o."Id"
            AND arp."ParentType" = 'obligation'
            AND oar."TestDate" IS NOT NULL
        ORDER BY o."Id",
            oar."TestDate" DESC
    ) as loar
WHERE o."Id" = loar."Id";

UPDATE risksmart.control as c
SET "LatestRatingDate" = lct."TestDate",
    "NextTestDate" = lct."NextTestDate",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
        SELECT DISTINCT ON (tr."ParentControlId") tr."TestDate",
            tr."NextTestDate",
            c."Id"
        FROM risksmart.test_result as tr
            INNER JOIN risksmart.control as c ON c."Id" = tr."ParentControlId"
        ORDER BY tr."ParentControlId",
            tr."TestDate" DESC
    ) as lct
WHERE c."Id" = lct."Id"