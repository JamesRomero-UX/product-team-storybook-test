
create schema if not exists "config";

CREATE TABLE IF NOT EXISTS config.env(
  "Name" text NOT NULL,
  "ValueString" text,
  "ValueInteger" integer,
  CONSTRAINT env_pkey PRIMARY KEY("Name")
);

create schema risksmart;

create schema auth;

CREATE DOMAIN risksmart.row_status AS TEXT CHECK (VALUE IN ('active', 'orphaned', 'deleted'));

CREATE OR REPLACE FUNCTION risksmart.get_hasura_user_id() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE user_id TEXT;

BEGIN
SELECT cast(current_setting('hasura.user') as JSON)->>'x-hasura-user-id' into user_id;

RETURN user_id;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.get_hasura_org_id() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE org_id TEXT;

BEGIN
SELECT cast(current_setting('hasura.user') as JSON)->>'x-hasura-org-id' into org_id;

RETURN org_id;

END;

$$;

CREATE TABLE auth.organisation(
    "OrgKey" text NOT NULL,
    "Name" text NOT NULL,
    "AuthTenant" text NOT NULL,
    "CreatedOn" timestamp with time zone NOT NULL,
    "Meta" json,
    CONSTRAINT "organisation_pkey" PRIMARY KEY("OrgKey")
);

ALTER TABLE auth.organisation
alter column "CreatedOn"
set default statement_timestamp();

CREATE TABLE auth.organisationUser(
    "OrgKey" text NOT NULL,
    "User_Id" text NOT NULL,
    CONSTRAINT "organisationUser_pkey" PRIMARY KEY("OrgKey", "User_Id")
);

CREATE TABLE auth.user(
    "Id" text,
    "FirstName" text,
    "LastName" text,
    "Email" text,
    "UserName" text,
    "BusinessUnit_Id" uuid,
    "AuthClient_Id" text,
    "AuthClientName" text,
    "AuthTenant" text,
    "AuthConnection_Id" text,
    "AuthConnection" text,
    "RoleKey" text,
    "Status" text,
    "CreatedOn" timestamp with time zone,
    "LastSeen" timestamp with time zone,
    "Meta" json,
    CONSTRAINT "user_pkey" PRIMARY KEY("Id")
);

ALTER TABLE auth.organisationUser
ADD CONSTRAINT "organisationUser_User_Id_fkey" FOREIGN KEY ("User_Id") REFERENCES auth.user ("Id");

ALTER TABLE auth.organisationUser
ADD CONSTRAINT "organisationUser_Organisation_Id_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

CREATE OR REPLACE VIEW risksmart.user_view_active AS
SELECT auth.user."Id",
    "user"."FirstName",
    "user"."LastName",
    "user"."Email",
    "user"."UserName",
    "user"."BusinessUnit_Id",
    "user"."RoleKey",
    o."OrgKey"
FROM auth."user"
    join auth.organisationuser o on "user"."Id" = o."User_Id"
order by "Email" desc;

CREATE TABLE risksmart."roles" (
    "RoleKey" text,
    "Timestamp" timestamp with time zone NOT NULL,
    "OrgKey" text,
    "Title" text,
    "T1_risks" text,
    "T2_risks" text,
    "T3_risks" text,
    "T1_controls" text,
    "T2_controls" text,
    "T3_controls" text,
    "Issues" text,
    "Actions" text,
    CONSTRAINT "Role_pkey" PRIMARY KEY("RoleKey")
);

ALTER TABLE "risksmart"."roles"
alter column "Timestamp"
set default statement_timestamp();

CREATE TABLE risksmart.risk(
    "Id" uuid NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL,
    "User" text NOT NULL,
    "Title" text NOT NULL,
    "Owner" text NOT NULL,
    "Description" text,
    "Tier" integer NOT NULL,
    "ParentRiskId" uuid,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json,
    CONSTRAINT "Risk_pkey" PRIMARY KEY("Id", "Timestamp")
);

ALTER TABLE risksmart.risk
alter column "Timestamp"
set default statement_timestamp();

ALTER TABLE risksmart.risk
alter column "Id"
set default gen_random_uuid();

ALTER TABLE risksmart.risk
ADD CONSTRAINT Tier_check CHECK ("Tier" IN (1, 2, 3));

CREATE UNIQUE INDEX "risk_pkey_Active" on "risksmart"."risk" using btree ("Id", "Timestamp", "RowStatus");

CREATE OR REPLACE VIEW "risksmart"."risk_view_active" AS
SELECT risk."Id",
    risk."Timestamp",
    risk."User",
    risk."Title",
    risk."Owner",
    risk."Description",
    risk."Tier",
    risk."ParentRiskId",
    risk."OrgKey",
    risk."RowStatus",
    risk."Meta"
FROM risksmart.risk
WHERE (
        (
            risk."Timestamp" = (
                SELECT max(risk_1."Timestamp") AS max
                FROM risksmart.risk risk_1
                WHERE (risk_1."Id" = risk."Id")
            )
        )
        AND (risk."RowStatus" = 'active'::text)
    )
ORDER BY risk."Timestamp" DESC;

CREATE TABLE risksmart."risk_assessment" (
    "ParentId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "ControlType" text not null,
    "Likelihood" integer,
    "Impact" integer,
    "Rating" integer not null,
    "Description" text,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "NextTestDate" timestamp with time zone NULL,
    "Meta" json,
    primary key ("ParentId", "Timestamp", "ControlType")
);

ALTER TABLE risksmart."risk_assessment"
ADD CONSTRAINT ControlType_check CHECK ("ControlType" IN ('Controlled', 'Uncontrolled'));

ALTER TABLE risksmart."risk_assessment"
ADD CONSTRAINT Likelihood_check CHECK (
        "Likelihood" IN (1, 2, 3, 4, 5)
        OR "Likelihood" IS NULL
    );

ALTER TABLE risksmart."risk_assessment"
ADD CONSTRAINT Impact_check CHECK (
        "Impact" IN (1, 2, 3, 4, 5)
        OR "Impact" IS NULL
    );

ALTER TABLE risksmart."risk_assessment"
ADD CONSTRAINT Rating_check CHECK ("Rating" IN (1, 2, 3, 4, 5));

CREATE OR REPLACE VIEW "risksmart"."risk_assessment_view_active" AS
SELECT risk_assessment."ParentId",
    risk_assessment."Timestamp",
    risk_assessment."ControlType",
    risk_assessment."Likelihood",
    risk_assessment."Impact",
    risk_assessment."Rating",
    risk_assessment."Description",
    risk_assessment."User",
    risk_assessment."OrgKey",
    risk_assessment."RowStatus",
    risk_assessment."NextTestDate",
    risk_assessment."Meta"
FROM risksmart.risk_assessment
WHERE (
        (
            risk_assessment."Timestamp" = (
                SELECT max(ra."Timestamp") AS max
                FROM risksmart.risk_assessment ra
                WHERE (risk_assessment."ParentId" = ra."ParentId")
                    AND (risk_assessment."ControlType" = ra."ControlType")
            )
        )
        AND (risk_assessment."RowStatus" = 'active'::text)
    )
ORDER BY risk_assessment."Timestamp" DESC;

CREATE TABLE risksmart.tag (
    "ParentId" uuid not null,
    "TagTypeId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "User" text not null,
    primary key ("ParentId", "TagTypeId", "Timestamp")
);

CREATE TABLE risksmart.tag_type (
    "TagTypeId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "Name" text NOT NULL,
    "Description" text,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("TagTypeId", "Timestamp", "OrgKey")
);

CREATE OR REPLACE VIEW risksmart."tag_type_view_active" AS
SELECT tt."TagTypeId",
    tt."Timestamp",
    tt."Name",
    tt."Description",
    tt."OrgKey"
FROM risksmart.tag_type tt
WHERE (
        (
            tt."Timestamp" = (
                SELECT max(tag_1."Timestamp") AS max
                FROM risksmart.tag_type tag_1
                WHERE (tag_1."TagTypeId" = tt."TagTypeId")
            )
        )
        AND (tt."RowStatus" = 'active'::text)
    );

CREATE OR REPLACE VIEW risksmart.tag_view_active AS
SELECT tt."Name",
    tag."ParentId",
    tag."TagTypeId",
    tt."Description",
    tt."OrgKey"
FROM (
        risksmart.tag
        JOIN risksmart.tag_type tt ON ((tag."TagTypeId" = tt."TagTypeId"))
    )
WHERE (
        (
            tag."Timestamp" = (
                SELECT max(tag_1."Timestamp") AS max
                FROM risksmart.tag tag_1
                WHERE (tag_1."ParentId" = tag."ParentId")
                    AND tag_1."TagTypeId" = tag."TagTypeId"
            )
        )
        AND (
            tt."Timestamp" = (
                SELECT max(tag_type."Timestamp") AS max
                FROM risksmart.tag_type
                WHERE (tag_type."TagTypeId" = "TagTypeId")
            )
        )
        AND (tag."RowStatus" = 'active'::text)
        AND (tt."RowStatus" = 'active'::text)
    );

CREATE TABLE risksmart."department" (
    "ParentId" uuid not null,
    "DepartmentTypeId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "User" text not null,
    primary key ("ParentId", "DepartmentTypeId", "Timestamp")
);

CREATE TABLE risksmart."department_type" (
    "DepartmentTypeId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "Name" text NOT NULL,
    "Description" text,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("DepartmentTypeId", "Timestamp", "OrgKey")
);

CREATE OR REPLACE VIEW risksmart."department_view_active" AS
SELECT dt."Name",
    d."ParentId",
    d."DepartmentTypeId",
    dt."Description",
    dt."OrgKey"
FROM risksmart."department" d
    JOIN risksmart.department_type dt on d."DepartmentTypeId" = dt."DepartmentTypeId"
WHERE (
        (
            d."Timestamp" = (
                SELECT max(dd."Timestamp") AS max
                FROM risksmart.department dd
                WHERE (dd."ParentId" = d."ParentId")
            )
        )
        AND (
            dt."Timestamp" = (
                SELECT max(dt."Timestamp") AS max
                FROM risksmart.department_type dt
                WHERE (dt."DepartmentTypeId" = d."DepartmentTypeId")
            )
        )
        AND (d."RowStatus" = 'active'::text)
        AND (dt."RowStatus" = 'active'::text)
    );

CREATE OR REPLACE VIEW risksmart."department_security_risk" AS
SELECT R."Id",
    coalesce(
        d."DepartmentTypeId",
        '00000000-0000-0000-0000-000000000000'
    ) as "DepartmentTypeId"
FROM risksmart."risk_view_active" AS R
    LEFT OUTER JOIN risksmart."department_view_active" D on D."ParentId" = R."Id";

CREATE TABLE risksmart."control"(
    "Id" uuid NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL,
    "User" text NOT NULL,
    "Title" text NOT NULL,
    "Owner" text NOT NULL,
    "Description" text,
    "Type" text NOT NULL,
    "ParentRiskId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json,
    CONSTRAINT "Control_pkey" PRIMARY KEY("Id", "Timestamp")
);

ALTER TABLE "risksmart"."control"
alter column "Timestamp"
set default statement_timestamp();

ALTER TABLE "risksmart"."control"
alter column "Id"
set default gen_random_uuid();

ALTER TABLE "risksmart"."control"
ADD CONSTRAINT Type_check CHECK (
        "Type" IN (
            'Preventive',
            'Corrective',
            'Directive',
            'Detective'
        )
    );

CREATE OR REPLACE VIEW "risksmart"."control_view_active" AS
SELECT "control"."Id",
    "control"."Timestamp",
    "control"."User",
    "control"."Title",
    "control"."Owner",
    "control"."Description",
    "control"."Type",
    "control"."ParentRiskId",
    "control"."OrgKey",
    "control"."RowStatus",
    "control"."Meta"
FROM risksmart."control"
WHERE (
        (
            "control"."Timestamp" = (
                SELECT max(c_1."Timestamp") AS max
                FROM risksmart."control" c_1
                WHERE (c_1."Id" = "control"."Id")
            )
        )
        AND ("control"."RowStatus" = 'active'::text)
    )
ORDER BY "control"."Timestamp" DESC;

CREATE TABLE risksmart.test_result(
    "Id" uuid NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL,
    "User" text NOT NULL,
    "Title" text NOT NULL,
    "Submitter" text NOT NULL,
    "Description" text,
    "ParentControlId" uuid NOT NULL,
    "TestType" text NULL,
    "DesignEffectiveness" integer NULL,
    "PerformanceEffectiveness" integer NULL,
    "OverallEffectiveness" integer NOT NULL,
    "TestDate" timestamp with time zone NOT NULL,
    "NextTestDate" timestamp with time zone NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "Test_Result_pkey" PRIMARY KEY("Id", "Timestamp")
);

ALTER TABLE risksmart.test_result
alter column "Timestamp"
set default statement_timestamp();

ALTER TABLE risksmart.test_result
alter column "Id"
set default gen_random_uuid();

ALTER TABLE risksmart.test_result
ADD CONSTRAINT TestType_check CHECK (
        "TestType" IN ('businessLine', '1stLine', '2ndLine', '3rdLine')
    );

ALTER TABLE risksmart.test_result
ADD CONSTRAINT DesignEffectiveness_check CHECK (
        (
            "DesignEffectiveness" >= 0
            AND "DesignEffectiveness" <= 4
        )
    );

ALTER TABLE risksmart.test_result
ADD CONSTRAINT PerformanceEffectiveness_check CHECK (
        (
            "PerformanceEffectiveness" >= 0
            AND "PerformanceEffectiveness" <= 4
        )
    );

ALTER TABLE risksmart.test_result
ADD CONSTRAINT OverallEffectiveness_check CHECK (
        (
            "OverallEffectiveness" >= 0
            AND "OverallEffectiveness" <= 4
        )
    );

CREATE OR REPLACE VIEW risksmart.test_result_view_active AS WITH cte AS (
        select *,
            ROW_NUMBER() OVER(
                PARTITION BY tr."Id"
                ORDER BY tr."Timestamp" DESC
            ) AS newest
        from risksmart.test_result tr
    )
SELECT cte."Id",
    cte."Timestamp",
    cte."User",
    cte."Title",
    cte."Submitter",
    cte."Description",
    cte."ParentControlId",
    cte."TestType",
    cte."DesignEffectiveness",
    cte."PerformanceEffectiveness",
    cte."OverallEffectiveness",
    cte."TestDate",
    cte."NextTestDate",
    cte."OrgKey",
    cte."RowStatus",
    cte."Meta"
FROM cte
WHERE cte."RowStatus" = 'active'::text
    AND cte.newest = 1;

CREATE OR REPLACE VIEW "risksmart"."control_view_active_flat" AS WITH ltr AS (
        SELECT *,
            ROW_NUMBER() OVER(
                PARTITION BY tr."ParentControlId"
                ORDER BY tr."TestDate" DESC
            ) AS newest
        from risksmart.test_result_view_active tr
    )
SELECT c."Id",
    c."Timestamp",
    "min"."FirstTimestamp" as "CreatedTimestamp",
    c."User",
    uva_user."UserName",
    c."Title",
    c."Owner",
    uva_owner."UserName" as "OwnerName",
    c."Description",
    c."Type",
    c."ParentRiskId",
    rva."Title" as "ParentTitle",
    c."OrgKey",
    c."RowStatus",
    c."Meta",
    ltr."OverallEffectiveness",
    0 as "OpenIssues",
    0 as "OpenActions" --     uncon."Impact" as "UncontrolledImpact",
    --     uncon."Likelihood" as "UncontrolledLikelihood",
    --     uncon."Rating"as "UncontrolledRating",
    --     uncon."Description" as "UncontrolledDescription",
    --     con."Impact" as "ControlledImpact",
    --     con."Likelihood" as "ControlledLikelihood",
    --     con."Rating" as "ControlledRating",
    --     con."Description" as "ControlledDescription"
FROM risksmart."control" c
    LEFT OUTER JOIN risksmart.user_view_active uva_user on c."User" = uva_user."Id"
    LEFT OUTER JOIN risksmart.user_view_active uva_owner on c."Owner" = uva_owner."Id"
    LEFT OUTER JOIN risksmart.risk_view_active rva on c."ParentRiskId" = rva."Id" -- LEFT OUTER JOIN risksmart.risk_assessment_view_active uncon on risk."Id" = uncon."ParentId"  and uncon."ControlType" = 'Uncontrolled'::text
    -- LEFT OUTER JOIN risksmart.risk_assessment_view_active con on risk."Id" = con."ParentId" and con."ControlType" = 'Controlled'::text
    INNER JOIN (
        SELECT "control"."Id",
            MAX("control"."Timestamp") as "LastTimestamp"
        FROM risksmart."control"
        GROUP BY "control"."Id"
    ) max ON c."Id" = max."Id"
    AND c."Timestamp" = max."LastTimestamp"
    INNER JOIN (
        SELECT "control"."Id",
            MIN("control"."Timestamp") as "FirstTimestamp"
        FROM risksmart."control"
        GROUP BY "control"."Id"
    ) min ON c."Id" = min."Id"
    LEFT OUTER JOIN ltr ON ltr."ParentControlId" = c."Id"
    AND ltr.newest = 1
where (c."RowStatus" = 'active'::text);

CREATE OR REPLACE VIEW risksmart."test_result_view_active_flat" AS
SELECT tr."Id",
    tr."Timestamp",
    tr."User",
    tr."Title",
    tr."Submitter",
    tr."Description",
    tr."ParentControlId",
    tr."TestType",
    tr."DesignEffectiveness",
    tr."PerformanceEffectiveness",
    tr."OverallEffectiveness",
    tr."TestDate",
    tr."NextTestDate",
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta",
    s."UserName" as "SubmitterName",
    c."Title" as "ParentTitle",
    u."UserName" as "UserName"
FROM risksmart.test_result_view_active tr
    LEFT OUTER JOIN risksmart.user_view_active s on tr."Submitter" = s."Id"
    LEFT OUTER JOIN risksmart.user_view_active u on tr."User" = u."Id"
    LEFT OUTER JOIN risksmart.control_view_active c on tr."ParentControlId" = c."Id";

CREATE TABLE risksmart.appetite(
    "Id" uuid NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL,
    "User" text NOT NULL,
    "LowerAppetite" integer NOT NULL,
    "UpperAppetite" integer NOT NULL,
    "Statement" text NOT NULL,
    "ParentRiskId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "Appetite_pkey" PRIMARY KEY("Id", "Timestamp")
);

ALTER TABLE risksmart.appetite
ADD CONSTRAINT LowerAppetite_check CHECK (
        --1=Minimal,2=Low,3=Moderate,4=High,5=Critical
        "LowerAppetite" IN (1, 2, 3, 4, 5)
        OR "LowerAppetite" IS NULL
    );

ALTER TABLE risksmart.appetite
ADD CONSTRAINT UpperAppetite_check CHECK (
        --1=Minimal,2=Low,3=Moderate,4=High,5=Critical
        "UpperAppetite" IN (1, 2, 3, 4, 5)
        OR "UpperAppetite" IS NULL
    );

ALTER TABLE risksmart.appetite
alter column "Timestamp"
set default statement_timestamp();

CREATE OR REPLACE VIEW risksmart.appetite_view_active AS WITH cte AS (
        select *,
            ROW_NUMBER() OVER(
                PARTITION BY tr."Id"
                ORDER BY tr."Timestamp" DESC
            ) AS newest,
            MIN(tr."Timestamp") OVER(
                PARTITION BY tr."Id"
                ORDER BY tr."Timestamp" ASC
            ) AS "CreatedTimestamp"
        from risksmart.appetite tr
    )
SELECT cte."Id",
    cte."Timestamp",
    cte."User",
    cte."LowerAppetite",
    cte."UpperAppetite",
    cte."Statement",
    cte."ParentRiskId",
    cte."OrgKey",
    cte."RowStatus",
    cte."Meta",
    cte."CreatedTimestamp"
FROM cte
WHERE cte."RowStatus" = 'active'::text
    AND cte.newest = 1;

CREATE OR REPLACE VIEW risksmart.appetite_view_active_flat AS
SELECT tr."Id",
    tr."Timestamp",
    tr."User",
    tr."LowerAppetite",
    tr."UpperAppetite",
    tr."Statement",
    tr."ParentRiskId",
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta",
    u."UserName",
    r."Title" as "ParentTitle",
    o."UserName" as "Owner",
    r."Tier",
    con."Rating" as "ControlledRating",
    CASE
        WHEN con."Rating" >= tr."LowerAppetite"
        AND con."Rating" <= tr."UpperAppetite" THEN 'inside'
        WHEN con."Rating" < tr."LowerAppetite"
        OR con."Rating" > tr."UpperAppetite" THEN 'outside'
        ELSE NULL
    END AS "Performance",
    tr."CreatedTimestamp",
    CASE
        WHEN ROW_NUMBER() OVER(
            PARTITION BY tr."ParentRiskId"
            ORDER BY tr."CreatedTimestamp" DESC
        ) = 1 THEN TRUE
        ELSE FALSE
    END AS "IsLatestForRisk"
FROM risksmart.appetite_view_active tr
    LEFT OUTER JOIN risksmart.user_view_active u on tr."User" = u."Id"
    LEFT OUTER JOIN risksmart.risk_view_active r on tr."ParentRiskId" = r."Id"
    AND r."OrgKey" = tr."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment_view_active con on tr."ParentRiskId" = con."ParentId"
    and con."ControlType" = 'Controlled'
    AND tr."OrgKey" = con."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active o on r."Owner" = o."Id";

CREATE TABLE risksmart.acceptance(
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "DateAcceptedFrom" timestamp with time zone NOT NULL,
    "DateAcceptedTo" timestamp with time zone NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL,
    "User" text NOT NULL,
    "Details" text NOT NULL,
    "ParentRiskId" uuid NOT NULL,
    "Status" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "Acceptance_pkey" PRIMARY KEY("Id", "Timestamp")
);

ALTER TABLE risksmart.acceptance
ADD CONSTRAINT Status_check CHECK ("Status" IN ('open', 'closed', 'overdue'));

ALTER TABLE risksmart.acceptance
alter column "Timestamp"
set default statement_timestamp();

CREATE OR REPLACE VIEW risksmart.acceptance_view_active AS WITH cte AS (
        select *,
            ROW_NUMBER() OVER(
                PARTITION BY tr."Id"
                ORDER BY tr."Timestamp" DESC
            ) AS newest
        from risksmart.acceptance tr
    )
SELECT cte."Id",
    cte."Title",
    cte."DateAcceptedFrom",
    cte."DateAcceptedTo",
    cte."Timestamp",
    cte."User",
    cte."Details",
    cte."ParentRiskId",
    cte."Status",
    cte."OrgKey",
    cte."RowStatus",
    cte."Meta"
FROM cte
WHERE cte."RowStatus" = 'active'::text
    AND cte.newest = 1;

CREATE OR REPLACE VIEW risksmart.acceptance_view_active_flat AS
SELECT tr."Id",
    tr."Title",
    tr."DateAcceptedFrom",
    tr."DateAcceptedTo",
    tr."Timestamp",
    tr."User",
    tr."Details",
    tr."ParentRiskId",
    tr."Status",
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta",
    u."UserName",
    r."Title" as "ParentTitle",
    o."UserName" as "Owner",
    r."Tier"
FROM risksmart.acceptance_view_active tr
    LEFT OUTER JOIN risksmart.user_view_active u on tr."User" = u."Id"
    LEFT OUTER JOIN risksmart.risk_view_active r on tr."ParentRiskId" = r."Id"
    AND tr."OrgKey" = r."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active o on r."Owner" = o."Id";

CREATE TABLE risksmart.action(
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Owner" text NULL,
    "DateRaised" timestamp with time zone NOT NULL,
    "DateDue" timestamp with time zone NOT NULL,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "Status" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    "Priority" integer NOT NULL,
    "Description" text NOT NULL,
    CONSTRAINT "Action_pkey" PRIMARY KEY("Id", "Timestamp")
);

ALTER TABLE risksmart.action
ADD CONSTRAINT Priority_check CHECK (
        --1=Low,2=Medium,3=High
        "Priority" IN (1, 2, 3)
    );

ALTER TABLE risksmart.action
ADD CONSTRAINT Status_check CHECK ("Status" IN ('open', 'closed'));

CREATE TABLE risksmart.risk_action (
    "RiskId" uuid not null,
    "ActionId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("RiskId", "ActionId", "Timestamp")
);

CREATE TABLE risksmart.issue_action (
    "IssueId" uuid not null,
    "ActionId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("IssueId", "ActionId", "Timestamp")
);

CREATE TABLE risksmart.control_action (
    "ControlId" uuid not null,
    "ActionId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("ControlId", "ActionId", "Timestamp")
);

CREATE OR REPLACE VIEW risksmart.action_view_active AS WITH cte AS (
        SELECT DISTINCT on (a."Id") "Id",
            a."Title",
            a."Owner",
            a."DateRaised",
            a."DateDue",
            a."Timestamp",
            a."User",
            a."Status",
            a."OrgKey",
            a."RowStatus",
            a."Meta",
            a."Priority",
            a."Description"
        FROM risksmart.action a
        ORDER BY a."Id",
            a."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE VIEW risksmart.risk_action_view_active AS WITH cte AS (
        SELECT DISTINCT on (ra."RiskId", ra."ActionId") ra."RiskId",
            ra."ActionId",
            ra."Timestamp",
            ra."User",
            ra."OrgKey",
            ra."RowStatus"
        FROM risksmart.risk_action ra
        ORDER BY ra."RiskId",
            ra."ActionId",
            ra."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE VIEW risksmart.issue_action_view_active AS WITH cte AS (
        SELECT DISTINCT on (ia."IssueId", ia."ActionId") "IssueId",
            "ActionId",
            ia."Timestamp",
            ia."User",
            ia."OrgKey",
            ia."RowStatus"
        FROM risksmart.issue_action ia
        ORDER BY ia."IssueId",
            ia."ActionId",
            ia."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE VIEW risksmart.control_action_view_active AS WITH cte AS (
        SELECT DISTINCT on (ca."ControlId", ca."ActionId") "ControlId",
            ca."ActionId",
            ca."Timestamp",
            ca."User",
            ca."OrgKey",
            ca."RowStatus"
        FROM risksmart.control_action ca
        ORDER BY ca."ControlId",
            ca."ActionId",
            ca."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE TABLE risksmart.action_update(
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NULL,
    "ParentActionId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "ActionUpdate_pkey" PRIMARY KEY("Id", "Timestamp")
);

CREATE OR REPLACE VIEW risksmart.action_update_view_active AS WITH cte AS (
        SELECT DISTINCT on (au."Id") "Id",
            au."Title",
            au."Description",
            au."ParentActionId",
            au."Timestamp",
            au."User",
            au."OrgKey",
            au."RowStatus",
            au."Meta"
        FROM risksmart.action_update au
        ORDER BY au."Id",
            au."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE FUNCTION risksmart.delete_acceptance(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.acceptance AS $$ BEGIN return query
INSERT INTO risksmart.acceptance (
        "Id",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "User",
        "Details",
        "ParentRiskId",
        "Status",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    a."Title",
    a."DateAcceptedFrom",
    a."DateAcceptedTo",
    risksmart.get_hasura_user_id(),
    a."Details",
    a."ParentRiskId",
    a."Status",
    a."OrgKey",
    'deleted',
    a."Meta"
FROM risksmart.acceptance_view_active a -- Only allow the most recent active record to be deleted by using the active view
WHERE a."Timestamp" = original_timestamp
    AND a."Id" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.delete_action(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.action AS $$ BEGIN return query
INSERT INTO risksmart.action (
        "Id",
        "Title",
        "Owner",
        "DateRaised",
        "DateDue",
        "User",
        "Status",
        "OrgKey",
        "RowStatus",
        "Meta",
        "Priority",
        "Description"
    )
SELECT a."Id",
    a."Title",
    a."Owner",
    a."DateRaised",
    a."DateDue",
    risksmart.get_hasura_user_id(),
    a."Status",
    a."OrgKey",
    'deleted',
    a."Meta",
    a."Priority",
    a."Description"
FROM risksmart.action_view_active a -- Only allow the most recent active record to be deleted by using the active view
WHERE a."Timestamp" = original_timestamp
    AND a."Id" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.delete_action_update(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.action_update AS $$ BEGIN return query
INSERT INTO risksmart.action_update (
        "Id",
        "Title",
        "Description",
        "ParentActionId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    a."Title",
    a."Description",
    a."ParentActionId",
    risksmart.get_hasura_user_id(),
    a."OrgKey",
    'deleted',
    a."Meta"
FROM risksmart.action_update_view_active a -- Only allow the most recent active record to be deleted by using the active view
WHERE a."Timestamp" = original_timestamp
    AND a."Id" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.delete_risk(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.risk AS $$ BEGIN
INSERT INTO risksmart.appetite (
        "Id",
        "User",
        "LowerAppetite",
        "UpperAppetite",
        "Statement",
        "ParentRiskId",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    risksmart.get_hasura_user_id(),
    a."LowerAppetite",
    a."UpperAppetite",
    a."Statement",
    a."ParentRiskId",
    a."OrgKey",
    'orphaned',
    a."Meta"
FROM risksmart.appetite_view_active a -- Only allow the most recent active record to be orphaned by using the active view
WHERE a."ParentRiskId" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id();

INSERT INTO risksmart.acceptance (
        "Id",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "User",
        "Details",
        "ParentRiskId",
        "Status",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    a."Title",
    a."DateAcceptedFrom",
    a."DateAcceptedTo",
    risksmart.get_hasura_user_id(),
    a."Details",
    a."ParentRiskId",
    a."Status",
    a."OrgKey",
    'orphaned',
    a."Meta"
FROM risksmart.acceptance_view_active a -- Only allow the most recent active record to be orphaned by using the active view
WHERE a."ParentRiskId" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id();

return query
INSERT INTO risksmart.risk (
        "Id",
        "User",
        "Title",
        "Owner",
        "Description",
        "Tier",
        "ParentRiskId",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    risksmart.get_hasura_user_id(),
    a."Title",
    a."Owner",
    a."Description",
    a."Tier",
    a."ParentRiskId",
    a."OrgKey",
    'deleted',
    a."Meta"
FROM risksmart.risk_view_active a -- Only allow the most recent active record to be deleted by using the active view
WHERE a."Timestamp" = original_timestamp
    AND a."Id" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE VIEW risksmart.action_update_view_active_flat AS
SELECT au."Id",
    au."Title",
    au."Description",
    au."ParentActionId",
    au."Timestamp",
    au."User",
    au."OrgKey",
    au."RowStatus",
    au."Meta",
    a."Title" as "ParentTitle",
    u."UserName" as "UserName"
FROM risksmart.action_update_view_active au
    LEFT OUTER JOIN risksmart.user_view_active u on au."User" = u."Id"
    LEFT OUTER JOIN risksmart.action_view_active a on au."ParentActionId" = a."Id"
    AND au."OrgKey" = a."OrgKey";

CREATE OR REPLACE VIEW risksmart."risk_view_active_flat" AS WITH rc AS (
        SELECT c."ParentRiskId",
            count(*) AS "LinkedControlCount"
        FROM risksmart.control_view_active c
        GROUP BY c."ParentRiskId"
    )
SELECT risk."Id",
    risk."Timestamp",
    min."FirstTimestamp" as "CreatedTimestamp",
    risk."User",
    uva_user."UserName",
    risk."Title",
    risk."Owner",
    uva_owner."UserName" as "OwnerName",
    risk."Description",
    risk."Tier",
    risk."ParentRiskId",
    rva."Title" as "ParentTitle",
    risk."OrgKey",
    risk."RowStatus",
    risk."Meta",
    uncon."Impact" as "UncontrolledImpact",
    uncon."Likelihood" as "UncontrolledLikelihood",
    uncon."Rating" as "UncontrolledRating",
    uncon."Description" as "UncontrolledDescription",
    con."Impact" as "ControlledImpact",
    con."Likelihood" as "ControlledLikelihood",
    con."Rating" as "ControlledRating",
    con."Description" as "ControlledDescription",
    COALESCE(rc."LinkedControlCount", 0) as "LinkedControlCount"
FROM risksmart.risk_view_active AS risk
    LEFT OUTER JOIN risksmart.user_view_active uva_user on risk."User" = uva_user."Id"
    LEFT OUTER JOIN risksmart.user_view_active uva_owner on risk."Owner" = uva_owner."Id"
    LEFT OUTER JOIN risksmart.risk_view_active rva on risk."ParentRiskId" = rva."Id"
    AND risk."OrgKey" = rva."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment_view_active uncon on risk."Id" = uncon."ParentId"
    AND uncon."ControlType" = 'Uncontrolled'
    AND risk."OrgKey" = uncon."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment_view_active con on risk."Id" = con."ParentId"
    AND risk."OrgKey" = con."OrgKey"
    AND con."ControlType" = 'Controlled'
    INNER JOIN (
        SELECT risk."Id",
            MIN(risk."Timestamp") as "FirstTimestamp"
        FROM risksmart.risk
        GROUP BY risk."Id"
    ) min ON risk."Id" = min."Id"
    LEFT JOIN rc ON rc."ParentRiskId" = risk."Id";

CREATE OR REPLACE FUNCTION risksmart.update_risk(
        id uuid,
        title text,
        owner text,
        description text,
        tier int,
        parent_risk_id uuid,
        original_timestamp timestamp,
        tag_type_ids uuid []
    ) RETURNS SETOF risksmart.risk AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.risk a
        WHERE a."Timestamp" = original_timestamp
            AND a."Id" = id
            AND a."OrgKey" = risksmart.get_hasura_org_id()
            AND a."Tier" = tier
    ) THEN -- Remove parent on child risks if parent has changed
INSERT INTO risksmart.risk (
        "Id",
        "User",
        "Title",
        "Owner",
        "Description",
        "Tier",
        "ParentRiskId",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    risksmart.get_hasura_user_id(),
    a."Title",
    a."Owner",
    a."Description",
    a."Tier",
    null,
    a."OrgKey",
    a."RowStatus",
    a."Meta"
FROM risksmart.risk_view_active a -- Only allow the most recent active record to be deleted by using the active view
WHERE a."ParentRiskId" = id
    AND a."Id" <> id
    AND a."OrgKey" = risksmart.get_hasura_org_id();

END IF;

PERFORM risksmart.update_tags(
    parent_id => id,
    tag_type_ids => tag_type_ids
);

return query
INSERT INTO risksmart.risk (
        "Id",
        "User",
        "Title",
        "Owner",
        "Description",
        "Tier",
        "ParentRiskId",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    risksmart.get_hasura_user_id(),
    title,
    owner,
    description,
    tier,
    parent_risk_id,
    a."OrgKey",
    a."RowStatus",
    a."Meta"
FROM risksmart.risk_view_active a -- Only allow the most recent active record to be deleted by using the active view
WHERE a."Timestamp" = original_timestamp
    AND a."Id" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_risk(
        title text,
        owner text,
        description text,
        tier int,
        parent_risk_id uuid,
        tag_type_ids uuid []
    ) RETURNS SETOF risksmart.risk AS $$
DECLARE inserted_risk_id uuid;

BEGIN
INSERT INTO risksmart.risk (
        "User",
        "Title",
        "Owner",
        "Description",
        "Tier",
        "ParentRiskId",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        risksmart.get_hasura_user_id(),
        title,
        owner,
        description,
        tier,
        parent_risk_id,
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING "Id" into inserted_risk_id;

PERFORM risksmart.update_tags(
    parent_id => inserted_risk_id,
    tag_type_ids => tag_type_ids
);

RETURN QUERY
SELECT *
FROM risksmart.risk
WHERE "OrgKey" = risksmart.get_hasura_org_id()
    AND "Id" = inserted_risk_id
ORDER BY "Timestamp" desc
LIMIT 1;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_tags(
        parent_id uuid,
        tag_type_ids uuid []
    ) RETURNS SETOF risksmart.tag AS $$ BEGIN return query
INSERT INTO risksmart.tag (
        "ParentId",
        "TagTypeId",
        "OrgKey",
        "RowStatus",
        "User"
    ) -- tags to delete
SELECT t."ParentId",
    t."TagTypeId",
    t."OrgKey",
    'deleted',
    risksmart.get_hasura_org_id()
FROM risksmart.tag_view_active t
WHERE t."OrgKey" = risksmart.get_hasura_org_id()
    AND t."ParentId" = parent_id
    AND NOT t."TagTypeId" = ANY (tag_type_ids)
UNION
-- tags to add
SELECT parent_id,
    tt."TagTypeId",
    tt."OrgKey",
    'active',
    risksmart.get_hasura_org_id()
FROM unnest(tag_type_ids) tag_type_id
    INNER JOIN risksmart.tag_type tt on tt."TagTypeId" = tag_type_id
WHERE tt."OrgKey" = risksmart.get_hasura_org_id()
    AND tt."TagTypeId" NOT IN (
        SELECT t."TagTypeId"
        FROM risksmart.tag_view_active t
        WHERE t."ParentId" = parent_id
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE risksmart.issue(
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Details" text NOT NULL,
    "ImpactsCustomer" boolean NOT NULL,
    "IsExternalIssue" boolean NOT NULL,
    "DateOccurred" timestamp with time zone NOT NULL,
    "DateIdentified" timestamp with time zone NOT NULL,
    "User" text NOT NULL,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json,
    CONSTRAINT "Issue_pkey" PRIMARY KEY("Id", "Timestamp")
);

ALTER TABLE risksmart.issue
alter column "Id"
set default gen_random_uuid();

CREATE OR REPLACE VIEW risksmart.issue_view_active AS WITH cte AS (
        SELECT DISTINCT ON (i."Id") i."Id",
            i."Title",
            i."Details",
            i."ImpactsCustomer",
            i."IsExternalIssue",
            i."DateOccurred",
            i."DateIdentified",
            i."User",
            i."Timestamp",
            i."OrgKey",
            i."RowStatus",
            i."Meta"
        FROM risksmart.issue i
        ORDER BY i."Id",
            i."Timestamp" desc
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE TABLE risksmart.issue_assessment(
    "ParentIssueId" uuid NOT NULL,
    "IssueType" text NULL,
    "Severity" integer NULL,
    "TargetCloseDate" timestamp with time zone NULL,
    "ActualCloseDate" timestamp with time zone NULL,
    "Status" text NULL,
    "Owner" text NULL,
    "CertifiedIndividual" text NULL,
    "RegulatoryBreach" boolean NULL,
    "RegulationsBreached" text NULL,
    "Reportable" boolean NULL,
    "Rationale" text NULL,
    "IssueCausedByThirdParty" boolean NULL,
    "ThirdPartyResponsible" text NULL,
    "IssueCausedBySystemIssue" boolean NULL,
    "SystemResponsible" text NULL,
    "PolicyBreach" boolean NULL,
    "PoliciesBreached" text NULL,
    "PolicyOwner" text NULL,
    "PolicyOwnerCommentary" text NULL,
    "AssociatedControlId" uuid NULL,
    "User" text NOT NULL,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json,
    CONSTRAINT "Issue_assessment_pkey" PRIMARY KEY("ParentIssueId", "Timestamp")
);

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT IssueType_check CHECK (
        "IssueType" IN (
            'near-miss',
            'material-impact',
            'internal-audit-finding',
            'compliance-finding',
            'control-test-finding'
        )
    );

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT Status_check CHECK ("Status" IN ('open', 'closed', 'overdue'));

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT Severity_check CHECK (
        --1=Minimal,2=Low,3=Moderate,4=High,5=Critical
        "Severity" IN (1, 2, 3, 4, 5)
        OR "Severity" IS NULL
    );

CREATE OR REPLACE VIEW risksmart.issue_assessment_view_active AS WITH cte AS (
        SELECT DISTINCT ON (ia."ParentIssueId") ia."ParentIssueId",
            ia."IssueType",
            ia."Severity",
            ia."TargetCloseDate",
            ia."ActualCloseDate",
            ia."Status",
            ia."Owner",
            ia."CertifiedIndividual",
            ia."RegulatoryBreach",
            ia."RegulationsBreached",
            ia."Reportable",
            ia."Rationale",
            ia."IssueCausedByThirdParty",
            ia."ThirdPartyResponsible",
            ia."IssueCausedBySystemIssue",
            ia."SystemResponsible",
            ia."PolicyBreach",
            ia."PoliciesBreached",
            ia."PolicyOwner",
            ia."PolicyOwnerCommentary",
            ia."AssociatedControlId",
            ia."User",
            ia."Timestamp",
            ia."OrgKey",
            ia."RowStatus",
            ia."Meta"
        FROM risksmart.issue_assessment ia
        ORDER BY ia."ParentIssueId",
            ia."Timestamp" desc
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE VIEW risksmart.issue_view_active_flat AS (
        WITH oa AS (
            SELECT ia."IssueId",
                ia."OrgKey",
                count(*) AS "OpenActions"
            FROM risksmart.issue_action_view_active ia
                INNER JOIN risksmart.action a ON a."Id" = ia."ActionId"
                AND a."OrgKey" = ia."OrgKey"
            WHERE a."Status" = 'open'
            GROUP BY ia."IssueId",
                ia."OrgKey"
        )
        SELECT i."Id",
            i."Title",
            i."Details",
            i."ImpactsCustomer",
            i."IsExternalIssue",
            i."DateOccurred",
            i."DateIdentified",
            i."User",
            i."Timestamp",
            i."OrgKey",
            i."RowStatus",
            i."Meta",
            ia."IssueType",
            ia."Severity",
            ia."TargetCloseDate",
            ia."ActualCloseDate",
            ia."Status",
            ia."Owner",
            ia."CertifiedIndividual",
            ia."RegulatoryBreach",
            ia."RegulationsBreached",
            ia."Reportable",
            ia."Rationale",
            ia."IssueCausedByThirdParty",
            ia."ThirdPartyResponsible",
            ia."IssueCausedBySystemIssue",
            ia."SystemResponsible",
            ia."PolicyBreach",
            ia."PoliciesBreached",
            ia."PolicyOwner",
            ia."PolicyOwnerCommentary",
            ia."AssociatedControlId",
            o."UserName" as "OwnerName",
            u."UserName" as "UserName",
            COALESCE(oa."OpenActions", 0) AS "OpenActions"
        FROM risksmart.issue_view_active i
            LEFT OUTER JOIN risksmart.issue_assessment_view_active ia ON i."Id" = ia."ParentIssueId"
            AND i."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active o on ia."Owner" = o."Id"
            AND o."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active u on i."User" = u."Id"
            AND u."OrgKey" = i."OrgKey"
            LEFT OUTER JOIN oa ON oa."IssueId" = i."Id"
            AND oa."OrgKey" = i."OrgKey"
    );

CREATE OR REPLACE VIEW risksmart.action_view_active_flat AS
SELECT a."Id",
    a."Title",
    a."Owner",
    a."DateRaised",
    a."DateDue",
    a."Timestamp",
    a."User",
    a."Status",
    a."OrgKey",
    a."RowStatus",
    a."Meta",
    a."Priority",
    u."UserName",
    o."UserName" as "OwnerName",
    CASE
        WHEN r."Id" IS NOT NULL THEN r."Title"
        WHEN c."Id" IS NOT NULL THEN c."Title"
        WHEN i."Id" IS NOT NULL THEN i."Title"
        ELSE NULL
    END AS "ParentTitle",
    CASE
        WHEN r."Id" IS NOT NULL THEN 'risk'
        WHEN c."Id" IS NOT NULL THEN 'control'
        WHEN i."Id" IS NOT NULL THEN 'issue'
        ELSE NULL
    END AS "ParentType",
    CASE
        WHEN r."Id" IS NOT NULL THEN r."Id"
        WHEN c."Id" IS NOT NULL THEN c."Id"
        WHEN i."Id" IS NOT NULL THEN i."Id"
        ELSE NULL
    END AS "ParentId",
    a."Description"
FROM risksmart.action_view_active a
    LEFT OUTER JOIN risksmart.user_view_active u on a."User" = u."Id"
    LEFT OUTER JOIN risksmart.user_view_active o on a."Owner" = o."Id"
    LEFT OUTER JOIN risksmart.risk_action_view_active ra on ra."ActionId" = a."Id"
    AND ra."OrgKey" = a."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active r on ra."RiskId" = r."Id"
    AND ra."OrgKey" = r."OrgKey"
    LEFT OUTER JOIN risksmart.control_action_view_active ca on ca."ActionId" = a."Id"
    AND ca."OrgKey" = a."OrgKey"
    LEFT OUTER JOIN risksmart.control_view_active c on ca."ControlId" = c."Id"
    AND ca."OrgKey" = c."OrgKey"
    LEFT OUTER JOIN risksmart.issue_action_view_active ia on ia."ActionId" = a."Id"
    AND ia."OrgKey" = a."OrgKey"
    LEFT OUTER JOIN risksmart.issue_view_active i on ia."IssueId" = i."Id"
    AND ia."OrgKey" = i."OrgKey";

CREATE OR REPLACE FUNCTION risksmart.delete_issue(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.issue AS $$ BEGIN return query
INSERT INTO risksmart.issue (
        "Id",
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT i."Id",
    i."Title",
    i."Details",
    i."ImpactsCustomer",
    i."IsExternalIssue",
    i."DateOccurred",
    i."DateIdentified",
    risksmart.get_hasura_user_id(),
    i."OrgKey",
    'deleted',
    i."Meta"
FROM risksmart.issue_view_active i
WHERE i."Timestamp" = original_timestamp
    AND i."Id" = id
    AND i."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "User",
        "OrgKey",
        "RowStatus"
    )
SELECT ia."ParentIssueId",
    ia."IssueType",
    ia."Severity",
    ia."TargetCloseDate",
    ia."ActualCloseDate",
    ia."Status",
    ia."Owner",
    ia."CertifiedIndividual",
    ia."RegulatoryBreach",
    ia."RegulationsBreached",
    ia."Reportable",
    ia."Rationale",
    ia."IssueCausedByThirdParty",
    ia."ThirdPartyResponsible",
    ia."IssueCausedBySystemIssue",
    ia."SystemResponsible",
    ia."PolicyBreach",
    ia."PoliciesBreached",
    ia."PolicyOwner",
    ia."PolicyOwnerCommentary",
    ia."AssociatedControlId",
    ia."User",
    ia."OrgKey",
    'deleted'
FROM risksmart.issue_assessment_view_active ia
WHERE ia."ParentIssueId" = id
    AND ia."OrgKey" = risksmart.get_hasura_org_id();

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_issue(
        id uuid,
        title text,
        details text,
        impacts_customer boolean,
        is_external_issue boolean,
        date_occurred timestamp with time zone,
        date_identified timestamp with time zone,
        tag_type_ids uuid [],
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.issue AS $$ BEGIN PERFORM risksmart.update_tags(
        parent_id => id,
        tag_type_ids => tag_type_ids
    );

return query
INSERT INTO risksmart.issue (
        "Id",
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT i."Id",
    title,
    details,
    impacts_customer,
    is_external_issue,
    date_occurred,
    date_identified,
    risksmart.get_hasura_user_id(),
    i."OrgKey",
    i."RowStatus",
    i."Meta"
FROM risksmart.issue_view_active i
WHERE i."Timestamp" = original_timestamp
    AND i."Id" = id
    AND i."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE risksmart.issue_update(
    "Id" uuid NOT NULL default gen_random_uuid(),
    "Title" text NOT NULL,
    "Description" text NULL,
    "ParentIssueId" uuid not null,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "IssueUpdate_pkey" PRIMARY KEY("Id", "Timestamp")
);

CREATE OR REPLACE VIEW risksmart.issue_update_view_active AS WITH cte AS (
        SELECT DISTINCT on (au."Id") "Id",
            au."Title",
            au."Description",
            au."ParentIssueId",
            au."Timestamp",
            au."User",
            au."OrgKey",
            au."RowStatus",
            au."Meta"
        FROM risksmart.issue_update au
        ORDER BY au."Id",
            au."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE FUNCTION risksmart.delete_issue_update(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.issue_update AS $$ BEGIN return query
INSERT INTO risksmart.issue_update (
        "Id",
        "Title",
        "Description",
        "ParentIssueId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    a."Title",
    a."Description",
    a."ParentIssueId",
    risksmart.get_hasura_user_id(),
    a."OrgKey",
    'deleted',
    a."Meta"
FROM risksmart.issue_update_view_active a
WHERE a."Timestamp" = original_timestamp
    AND a."Id" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_issue_update(
        title text,
        description text,
        parent_issue_id uuid
    ) RETURNS SETOF risksmart.issue_update AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

return query
INSERT INTO risksmart.issue_update (
        "Title",
        "Description",
        "ParentIssueId",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        title,
        description,
        parent_issue_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_issue_update(
        id uuid,
        title text,
        description text,
        parent_issue_id uuid,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.issue_update AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

return query
INSERT INTO risksmart.issue_update (
        "Id",
        "Title",
        "Description",
        "ParentIssueId",
        "User",
        "OrgKey",
        "RowStatus"
    )
SELECT id,
    title,
    description,
    parent_issue_id,
    risksmart.get_hasura_user_id(),
    iu."OrgKey",
    iu."RowStatus"
FROM risksmart.issue_update_view_active iu
WHERE iu."OrgKey" = risksmart.get_hasura_org_id()
    AND iu."Id" = id
    AND iu."Timestamp" = original_timestamp
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_issue_assessment(
        parent_issue_id uuid,
        issue_type text,
        severity integer,
        target_close_date timestamp with time zone,
        actual_close_date timestamp with time zone,
        status text,
        owner text,
        certified_individual text,
        regulatory_breach boolean,
        regulations_breached text,
        reportable boolean,
        rationale text,
        issue_caused_by_third_party boolean,
        third_party_responsible text,
        issue_caused_by_system_issue boolean,
        system_responsible text,
        policy_breach boolean,
        policies_breached text,
        policy_owner text,
        policy_owner_commentary text,
        associated_control_id uuid
    ) RETURNS SETOF risksmart.issue_assessment AS $$ BEGIN IF EXISTS (
        SELECT 1
        FROM risksmart.issue_assessment_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."ParentIssueId" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue assessment already exists';

END IF;

IF NOT EXISTS (
    SELECT 1
    FROM risksmart.issue_view_active i
    WHERE i."OrgKey" = risksmart.get_hasura_org_id()
        AND i."Id" = parent_issue_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Issue not found';

END IF;

IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

IF owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Owner not found';

END IF;

END IF;

IF policy_owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = policy_owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Policy owner not found';

END IF;

END IF;

IF certified_individual IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = certified_individual
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Certified individual not found';

END IF;

END IF;

return query
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        parent_issue_id,
        issue_type,
        severity,
        target_close_date,
        actual_close_date,
        status,
        owner,
        certified_individual,
        regulatory_breach,
        regulations_breached,
        reportable,
        rationale,
        issue_caused_by_third_party,
        third_party_responsible,
        issue_caused_by_system_issue,
        system_responsible,
        policy_breach,
        policies_breached,
        policy_owner,
        policy_owner_commentary,
        associated_control_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE risksmart.cause(
    "Id" uuid NOT NULL default gen_random_uuid(),
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "Significance" integer NOT NULL,
    "ParentIssueId" uuid NOT NULL,
    "Timestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "Cause_pkey" PRIMARY KEY("Id", "Timestamp")
);

ALTER TABLE risksmart.cause
ADD CONSTRAINT Significance_check CHECK (
        "Significance" IN (1, 2, 3, 4, 5)
        OR "Significance" IS NULL
    );

CREATE OR REPLACE VIEW risksmart.cause_view_active AS WITH cte AS (
        SELECT DISTINCT on (c."Id") c."Id",
            c."Title",
            c."Description",
            c."Significance",
            c."ParentIssueId",
            c."Timestamp",
            c."User",
            c."OrgKey",
            c."RowStatus",
            c."Meta"
        FROM risksmart.cause c
        ORDER BY c."Id",
            c."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE FUNCTION risksmart.delete_cause(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.cause AS $$ BEGIN return query
INSERT INTO risksmart.cause (
        "Id",
        "Title",
        "Description",
        "Significance",
        "ParentIssueId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT c."Id",
    c."Title",
    c."Description",
    c."Significance",
    c."ParentIssueId",
    risksmart.get_hasura_user_id(),
    c."OrgKey",
    'deleted',
    c."Meta"
FROM risksmart.cause_view_active c
WHERE c."Timestamp" = original_timestamp
    AND c."Id" = id
    AND c."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_cause(
        title text,
        description text,
        significance integer,
        parent_issue_id uuid
    ) RETURNS SETOF risksmart.cause AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

RETURN QUERY
INSERT INTO risksmart.cause (
        "Title",
        "Description",
        "Significance",
        "ParentIssueId",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        title,
        description,
        significance,
        parent_issue_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_cause(
        id uuid,
        title text,
        description text,
        significance integer,
        parent_issue_id uuid,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.cause AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

RETURN QUERY
INSERT INTO risksmart.cause (
        "Id",
        "Title",
        "Description",
        "Significance",
        "ParentIssueId",
        "User",
        "OrgKey",
        "RowStatus"
    )
SELECT c."Id",
    title,
    description,
    significance,
    parent_issue_id,
    risksmart.get_hasura_user_id(),
    risksmart.get_hasura_org_id(),
    c."RowStatus"
FROM risksmart.cause_view_active c
WHERE c."Timestamp" = original_timestamp
    AND c."Id" = id
    AND c."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE risksmart.consequence(
    "Id" uuid NOT NULL default gen_random_uuid(),
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "Criticality" integer NOT NULL,
    "CostType" text NOT NULL,
    "CostValue" integer NOT NULL,
    "ParentIssueId" uuid NOT NULL,
    "Timestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "Consequence_pkey" PRIMARY KEY("Id", "Timestamp")
);

ALTER TABLE risksmart.consequence
ADD CONSTRAINT Criticality_check CHECK (
        "Criticality" IN (1, 2, 3, 4, 5)
        OR "Criticality" IS NULL
    );

ALTER TABLE risksmart.consequence
ADD CONSTRAINT CostType_check CHECK (
        "CostType" IN ('hours', 'pounds')
        OR "CostType" IS NULL
    );

CREATE OR REPLACE VIEW risksmart.consequence_view_active AS WITH cte AS (
        SELECT DISTINCT on (c."Id") c."Id",
            c."Title",
            c."Description",
            c."Criticality",
            c."CostType",
            c."CostValue",
            c."ParentIssueId",
            c."Timestamp",
            c."User",
            c."OrgKey",
            c."RowStatus",
            c."Meta"
        FROM risksmart.consequence c
        ORDER BY c."Id",
            c."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE FUNCTION risksmart.delete_consequence(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.consequence AS $$ BEGIN return query
INSERT INTO risksmart.consequence (
        "Id",
        "Title",
        "Description",
        "Criticality",
        "CostType",
        "CostValue",
        "ParentIssueId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT c."Id",
    c."Title",
    c."Description",
    c."Criticality",
    c."CostType",
    c."CostValue",
    c."ParentIssueId",
    risksmart.get_hasura_user_id(),
    c."OrgKey",
    'deleted',
    c."Meta"
FROM risksmart.consequence_view_active c
WHERE c."Timestamp" = original_timestamp
    AND c."Id" = id
    AND c."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_consequence(
        title text,
        description text,
        criticality integer,
        parent_issue_id uuid,
        cost_type text,
        cost_value integer
    ) RETURNS SETOF risksmart.consequence AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

RETURN QUERY
INSERT INTO risksmart.consequence (
        "Title",
        "Description",
        "Criticality",
        "ParentIssueId",
        "User",
        "OrgKey",
        "RowStatus",
        "CostType",
        "CostValue"
    )
VALUES (
        title,
        description,
        criticality,
        parent_issue_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active',
        cost_type,
        cost_value
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_consequence(
        id uuid,
        title text,
        description text,
        criticality integer,
        cost_type text,
        cost_value integer,
        parent_issue_id uuid,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.consequence AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

RETURN QUERY
INSERT INTO risksmart.consequence (
        "Id",
        "Title",
        "Description",
        "Criticality",
        "CostType",
        "CostValue",
        "ParentIssueId",
        "User",
        "OrgKey",
        "RowStatus"
    )
SELECT c."Id",
    title,
    description,
    criticality,
    cost_type,
    cost_value,
    parent_issue_id,
    risksmart.get_hasura_user_id(),
    risksmart.get_hasura_org_id(),
    c."RowStatus"
FROM risksmart.consequence_view_active c
WHERE c."Timestamp" = original_timestamp
    AND c."Id" = id
    AND c."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

DROP FUNCTION IF EXISTS risksmart.insert_issue;

CREATE OR REPLACE FUNCTION risksmart.insert_issue(
        title text,
        details text,
        impacts_customer boolean,
        is_external_issue boolean,
        date_occurred timestamp with time zone,
        date_identified timestamp with time zone,
        tag_type_ids uuid [],
        associated_control_id uuid
    ) RETURNS SETOF risksmart.issue AS $$
DECLARE inserted_issue_id uuid;

BEGIN IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active i
    WHERE i."OrgKey" = risksmart.get_hasura_org_id()
        AND i."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

INSERT INTO risksmart.issue (
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        title,
        details,
        impacts_customer,
        is_external_issue,
        date_occurred,
        date_identified,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING "Id" into inserted_issue_id;

PERFORM risksmart.update_tags(
    parent_id => inserted_issue_id,
    tag_type_ids => tag_type_ids
);

IF associated_control_id IS NOT NULL THEN
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "AssociatedControlId",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        inserted_issue_id,
        associated_control_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    );

END IF;

RETURN QUERY
SELECT *
FROM risksmart.issue i
WHERE i."OrgKey" = risksmart.get_hasura_org_id()
    AND i."Id" = inserted_issue_id
ORDER BY i."Timestamp" desc
LIMIT 1;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE VIEW risksmart.issue_update_view_active_flat AS
SELECT iu."Id",
    iu."Title",
    iu."Description",
    iu."ParentIssueId",
    iu."Timestamp",
    iu."User",
    iu."OrgKey",
    iu."RowStatus",
    iu."Meta",
    iu."Title" as "ParentTitle",
    u."UserName" as "UserName"
FROM risksmart.issue_update_view_active iu
    LEFT OUTER JOIN risksmart.user_view_active u on iu."User" = u."Id"
    AND iu."OrgKey" = u."OrgKey"
    LEFT OUTER JOIN risksmart.action_view_active a on iu."ParentIssueId" = a."Id"
    AND iu."OrgKey" = a."OrgKey";

CREATE OR REPLACE FUNCTION risksmart.update_issue_assessment(
        parent_issue_id uuid,
        issue_type text,
        severity integer,
        target_close_date timestamp with time zone,
        actual_close_date timestamp with time zone,
        status text,
        owner text,
        certified_individual text,
        regulatory_breach boolean,
        regulations_breached text,
        reportable boolean,
        rationale text,
        issue_caused_by_third_party boolean,
        third_party_responsible text,
        issue_caused_by_system_issue boolean,
        system_responsible text,
        policy_breach boolean,
        policies_breached text,
        policy_owner text,
        policy_owner_commentary text,
        associated_control_id uuid,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.issue_assessment AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

IF owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Owner not found';

END IF;

END IF;

IF policy_owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = policy_owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Policy owner not found';

END IF;

END IF;

IF certified_individual IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = certified_individual
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Certified individual not found';

END IF;

END IF;

return query
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "User",
        "OrgKey",
        "RowStatus"
    )
SELECT ia."ParentIssueId",
    issue_type,
    severity,
    target_close_date,
    actual_close_date,
    status,
    owner,
    certified_individual,
    regulatory_breach,
    regulations_breached,
    reportable,
    rationale,
    issue_caused_by_third_party,
    third_party_responsible,
    issue_caused_by_system_issue,
    system_responsible,
    policy_breach,
    policies_breached,
    policy_owner,
    policy_owner_commentary,
    associated_control_id,
    risksmart.get_hasura_user_id(),
    risksmart.get_hasura_org_id(),
    ia."RowStatus"
FROM risksmart.issue_assessment_view_active ia
WHERE ia."Timestamp" = original_timestamp
    AND ia."ParentIssueId" = parent_issue_id
    AND ia."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE OR REPLACE VIEW "risksmart"."control_view_active_flat" AS WITH ltr AS (
        SELECT *,
            ROW_NUMBER() OVER(
                PARTITION BY tr."ParentControlId"
                ORDER BY tr."TestDate" DESC
            ) AS newest
        from risksmart.test_result_view_active tr
    ),
    oa as (
        SELECT ca."ControlId",
            ca."OrgKey",
            count(*) AS "OpenActions"
        FROM risksmart.control_action_view_active ca
            INNER JOIN risksmart.action_view_active a ON a."Id" = ca."ActionId"
            AND a."OrgKey" = ca."OrgKey"
        WHERE a."Status" = 'open'
        GROUP BY ca."ControlId",
            ca."OrgKey"
    ),
    oi as (
        SELECT i."AssociatedControlId" as "ControlId",
            i."OrgKey",
            count(*) AS "OpenIssues"
        FROM risksmart.issue_assessment_view_active i
        WHERE i."Status" = 'open'
        GROUP BY i."AssociatedControlId",
            i."OrgKey"
    )
SELECT c."Id",
    c."Timestamp",
    "min"."FirstTimestamp" as "CreatedTimestamp",
    c."User",
    uva_user."UserName",
    c."Title",
    c."Owner",
    uva_owner."UserName" as "OwnerName",
    c."Description",
    c."Type",
    c."ParentRiskId",
    rva."Title" as "ParentTitle",
    c."OrgKey",
    c."RowStatus",
    c."Meta",
    ltr."OverallEffectiveness",
    CAST(COALESCE(oi."OpenIssues", 0) AS integer) as "OpenIssues",
    CAST(COALESCE(oa."OpenActions", 0) AS integer) as "OpenActions"
FROM risksmart.control_view_active c
    LEFT OUTER JOIN risksmart.user_view_active uva_user on c."User" = uva_user."Id"
    LEFT OUTER JOIN risksmart.user_view_active uva_owner on c."Owner" = uva_owner."Id"
    LEFT OUTER JOIN risksmart.risk_view_active rva on c."ParentRiskId" = rva."Id"
    LEFT JOIN oa ON oa."ControlId" = c."Id"
    AND oa."OrgKey" = c."OrgKey"
    LEFT JOIN oi ON oi."ControlId" = c."Id"
    AND oi."OrgKey" = c."OrgKey"
    INNER JOIN (
        SELECT "control"."Id",
            MIN("control"."Timestamp") as "FirstTimestamp"
        FROM risksmart."control"
        GROUP BY "control"."Id"
    ) min ON c."Id" = min."Id"
    LEFT OUTER JOIN ltr ON ltr."ParentControlId" = c."Id"
    AND ltr.newest = 1;
CREATE OR REPLACE VIEW risksmart."risk_view_active_flat" AS WITH rc AS (
        SELECT c."ParentRiskId",
            c."OrgKey",
            count(*) AS "LinkedControlCount"
        FROM risksmart.control_view_active c
        GROUP BY c."ParentRiskId",
            c."OrgKey"
    )
SELECT risk."Id",
    risk."Timestamp",
    min."FirstTimestamp" as "CreatedTimestamp",
    risk."User",
    uva_user."UserName",
    risk."Title",
    risk."Owner",
    uva_owner."UserName" as "OwnerName",
    risk."Description",
    risk."Tier",
    risk."ParentRiskId",
    rva."Title" as "ParentTitle",
    risk."OrgKey",
    risk."RowStatus",
    risk."Meta",
    uncon."Impact" as "UncontrolledImpact",
    uncon."Likelihood" as "UncontrolledLikelihood",
    uncon."Rating" as "UncontrolledRating",
    uncon."Description" as "UncontrolledDescription",
    con."Impact" as "ControlledImpact",
    con."Likelihood" as "ControlledLikelihood",
    con."Rating" as "ControlledRating",
    con."Description" as "ControlledDescription",
    COALESCE(rc."LinkedControlCount", 0) as "LinkedControlCount"
FROM risksmart.risk_view_active AS risk
    LEFT OUTER JOIN risksmart.user_view_active uva_user on risk."User" = uva_user."Id"
    AND risk."OrgKey" = uva_user."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active uva_owner on risk."Owner" = uva_owner."Id"
    AND risk."OrgKey" = uva_owner."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active rva on risk."ParentRiskId" = rva."Id"
    AND risk."OrgKey" = rva."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment_view_active uncon on risk."Id" = uncon."ParentId"
    AND uncon."ControlType" = 'Uncontrolled'
    AND risk."OrgKey" = uncon."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment_view_active con on risk."Id" = con."ParentId"
    AND risk."OrgKey" = con."OrgKey"
    AND con."ControlType" = 'Controlled'
    INNER JOIN (
        SELECT fr."Id",
            fr."OrgKey",
            MIN(fr."Timestamp") as "FirstTimestamp"
        FROM risksmart.risk fr
        GROUP BY fr."Id",
            fr."OrgKey"
    ) min ON risk."Id" = min."Id"
    AND risk."OrgKey" = min."OrgKey"
    LEFT JOIN rc ON rc."ParentRiskId" = risk."Id"
    AND rc."OrgKey" = risk."OrgKey";

CREATE OR REPLACE VIEW risksmart.action_view_active_flat AS
SELECT a."Id",
    a."Title",
    a."Owner",
    a."DateRaised",
    a."DateDue",
    a."Timestamp",
    a."User",
    a."Status",
    a."OrgKey",
    a."RowStatus",
    a."Meta",
    a."Priority",
    u."UserName",
    o."UserName" as "OwnerName",
    CASE
        WHEN r."Id" IS NOT NULL THEN r."Title"
        WHEN c."Id" IS NOT NULL THEN c."Title"
        WHEN i."Id" IS NOT NULL THEN i."Title"
        ELSE NULL
    END AS "ParentTitle",
    CASE
        WHEN r."Id" IS NOT NULL THEN 'risk'
        WHEN c."Id" IS NOT NULL THEN 'control'
        WHEN i."Id" IS NOT NULL THEN 'issue'
        ELSE NULL
    END AS "ParentType",
    CASE
        WHEN r."Id" IS NOT NULL THEN r."Id"
        WHEN c."Id" IS NOT NULL THEN c."Id"
        WHEN i."Id" IS NOT NULL THEN i."Id"
        ELSE NULL
    END AS "ParentId",
    a."Description"
FROM risksmart.action_view_active a
    LEFT OUTER JOIN risksmart.user_view_active u on a."User" = u."Id"
    AND a."OrgKey" = u."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active o on a."Owner" = o."Id"
    AND a."OrgKey" = o."OrgKey"
    LEFT OUTER JOIN risksmart.risk_action_view_active ra on ra."ActionId" = a."Id"
    AND ra."OrgKey" = a."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active r on ra."RiskId" = r."Id"
    AND ra."OrgKey" = r."OrgKey"
    LEFT OUTER JOIN risksmart.control_action_view_active ca on ca."ActionId" = a."Id"
    AND ca."OrgKey" = a."OrgKey"
    LEFT OUTER JOIN risksmart.control_view_active c on ca."ControlId" = c."Id"
    AND ca."OrgKey" = c."OrgKey"
    LEFT OUTER JOIN risksmart.issue_action_view_active ia on ia."ActionId" = a."Id"
    AND ia."OrgKey" = a."OrgKey"
    LEFT OUTER JOIN risksmart.issue_view_active i on ia."IssueId" = i."Id"
    AND ia."OrgKey" = i."OrgKey";

CREATE OR REPLACE VIEW risksmart.action_update_view_active_flat AS
SELECT au."Id",
    au."Title",
    au."Description",
    au."ParentActionId",
    au."Timestamp",
    au."User",
    au."OrgKey",
    au."RowStatus",
    au."Meta",
    a."Title" as "ParentTitle",
    u."UserName" as "UserName"
FROM risksmart.action_update_view_active au
    LEFT OUTER JOIN risksmart.user_view_active u on au."User" = u."Id"
    AND au."OrgKey" = u."OrgKey"
    LEFT OUTER JOIN risksmart.action_view_active a on au."ParentActionId" = a."Id"
    AND au."OrgKey" = a."OrgKey";

CREATE OR REPLACE VIEW risksmart.acceptance_view_active_flat AS
SELECT tr."Id",
    tr."Title",
    tr."DateAcceptedFrom",
    tr."DateAcceptedTo",
    tr."Timestamp",
    tr."User",
    tr."Details",
    tr."ParentRiskId",
    tr."Status",
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta",
    u."UserName",
    r."Title" as "ParentTitle",
    o."UserName" as "Owner",
    r."Tier"
FROM risksmart.acceptance_view_active tr
    LEFT OUTER JOIN risksmart.user_view_active u on tr."User" = u."Id"
    AND tr."OrgKey" = u."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active r on tr."ParentRiskId" = r."Id"
    AND tr."OrgKey" = r."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active o on r."Owner" = o."Id"
    AND r."OrgKey" = o."OrgKey";

CREATE OR REPLACE VIEW risksmart.appetite_view_active_flat AS
SELECT tr."Id",
    tr."Timestamp",
    tr."User",
    tr."LowerAppetite",
    tr."UpperAppetite",
    tr."Statement",
    tr."ParentRiskId",
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta",
    u."UserName",
    r."Title" as "ParentTitle",
    o."UserName" as "Owner",
    r."Tier",
    con."Rating" as "ControlledRating",
    CASE
        WHEN con."Rating" >= tr."LowerAppetite"
        AND con."Rating" <= tr."UpperAppetite" THEN 'inside'
        WHEN con."Rating" < tr."LowerAppetite"
        OR con."Rating" > tr."UpperAppetite" THEN 'outside'
        ELSE NULL
    END AS "Performance",
    tr."CreatedTimestamp",
    CASE
        WHEN ROW_NUMBER() OVER(
            PARTITION BY tr."ParentRiskId"
            ORDER BY tr."CreatedTimestamp" DESC
        ) = 1 THEN TRUE
        ELSE FALSE
    END AS "IsLatestForRisk"
FROM risksmart.appetite_view_active tr
    LEFT OUTER JOIN risksmart.user_view_active u on tr."User" = u."Id"
    AND tr."OrgKey" = u."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active r on tr."ParentRiskId" = r."Id"
    AND r."OrgKey" = tr."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment_view_active con on tr."ParentRiskId" = con."ParentId"
    and con."ControlType" = 'Controlled'
    AND tr."OrgKey" = con."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active o on r."Owner" = o."Id"
    AND r."OrgKey" = o."OrgKey";

CREATE OR REPLACE VIEW risksmart."test_result_view_active_flat" AS
SELECT tr."Id",
    tr."Timestamp",
    tr."User",
    tr."Title",
    tr."Submitter",
    tr."Description",
    tr."ParentControlId",
    tr."TestType",
    tr."DesignEffectiveness",
    tr."PerformanceEffectiveness",
    tr."OverallEffectiveness",
    tr."TestDate",
    tr."NextTestDate",
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta",
    s."UserName" as "SubmitterName",
    c."Title" as "ParentTitle",
    u."UserName" as "UserName"
FROM risksmart.test_result_view_active tr
    LEFT OUTER JOIN risksmart.user_view_active s on tr."Submitter" = s."Id"
    AND tr."OrgKey" = s."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active u on tr."User" = u."Id"
    AND tr."OrgKey" = u."OrgKey"
    LEFT OUTER JOIN risksmart.control_view_active c on tr."ParentControlId" = c."Id"
    AND tr."OrgKey" = c."OrgKey";

CREATE OR REPLACE VIEW "risksmart"."control_view_active_flat" AS WITH ltr AS (
        SELECT *,
            ROW_NUMBER() OVER(
                PARTITION BY tr."ParentControlId",
                tr."OrgKey"
                ORDER BY tr."TestDate" DESC
            ) AS newest
        from risksmart.test_result_view_active tr
    ),
    oa as (
        SELECT ca."ControlId",
            ca."OrgKey",
            count(*) AS "OpenActions"
        FROM risksmart.control_action_view_active ca
            INNER JOIN risksmart.action_view_active a ON a."Id" = ca."ActionId"
            AND a."OrgKey" = ca."OrgKey"
        WHERE a."Status" = 'open'
        GROUP BY ca."ControlId",
            ca."OrgKey"
    ),
    oi as (
        SELECT i."AssociatedControlId" as "ControlId",
            i."OrgKey",
            count(*) AS "OpenIssues"
        FROM risksmart.issue_assessment_view_active i
        WHERE i."Status" = 'open'
        GROUP BY i."AssociatedControlId",
            i."OrgKey"
    )
SELECT c."Id",
    c."Timestamp",
    "min"."FirstTimestamp" as "CreatedTimestamp",
    c."User",
    uva_user."UserName",
    c."Title",
    c."Owner",
    uva_owner."UserName" as "OwnerName",
    c."Description",
    c."Type",
    c."ParentRiskId",
    rva."Title" as "ParentTitle",
    c."OrgKey",
    c."RowStatus",
    c."Meta",
    ltr."OverallEffectiveness",
    CAST(COALESCE(oi."OpenIssues", 0) AS integer) as "OpenIssues",
    CAST(COALESCE(oa."OpenActions", 0) AS integer) as "OpenActions"
FROM risksmart.control_view_active c
    LEFT OUTER JOIN risksmart.user_view_active uva_user on c."User" = uva_user."Id"
    AND c."OrgKey" = uva_user."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active uva_owner on c."Owner" = uva_owner."Id"
    AND c."OrgKey" = uva_owner."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active rva on c."ParentRiskId" = rva."Id"
    AND c."OrgKey" = rva."OrgKey"
    LEFT JOIN oa ON oa."ControlId" = c."Id"
    AND oa."OrgKey" = c."OrgKey"
    LEFT JOIN oi ON oi."ControlId" = c."Id"
    AND oi."OrgKey" = c."OrgKey"
    INNER JOIN (
        SELECT fc."Id",
            fc."OrgKey",
            MIN(fc."Timestamp") as "FirstTimestamp"
        FROM risksmart."control" fc
        GROUP BY fc."Id",
            fc."OrgKey"
    ) min ON c."Id" = min."Id"
    AND c."OrgKey" = min."OrgKey"
    LEFT OUTER JOIN ltr ON ltr."ParentControlId" = c."Id"
    AND ltr."OrgKey" = c."OrgKey"
    AND ltr.newest = 1;
ALTER TABLE risksmart."risk_assessment" ALTER "Rating" DROP NOT NULL;
CREATE OR REPLACE FUNCTION risksmart.update_tags(
        parent_id uuid,
        tag_type_ids uuid []
    ) RETURNS SETOF risksmart.tag AS $$ BEGIN return query
INSERT INTO risksmart.tag (
        "ParentId",
        "TagTypeId",
        "OrgKey",
        "RowStatus",
        "User"
    ) -- tags to delete
SELECT t."ParentId",
    t."TagTypeId",
    t."OrgKey",
    'deleted',
    risksmart.get_hasura_user_id()
FROM risksmart.tag_view_active t
WHERE t."OrgKey" = risksmart.get_hasura_org_id()
    AND t."ParentId" = parent_id
    AND NOT t."TagTypeId" = ANY (tag_type_ids)
UNION
-- tags to add
SELECT parent_id,
    tt."TagTypeId",
    tt."OrgKey",
    'active',
    risksmart.get_hasura_user_id()
FROM unnest(tag_type_ids) tag_type_id
    INNER JOIN risksmart.tag_type tt on tt."TagTypeId" = tag_type_id
WHERE tt."OrgKey" = risksmart.get_hasura_org_id()
    AND tt."TagTypeId" NOT IN (
        SELECT t."TagTypeId"
        FROM risksmart.tag_view_active t
        WHERE t."ParentId" = parent_id
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE OR REPLACE FUNCTION risksmart.delete_appetite(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.appetite AS $$ BEGIN return query
INSERT INTO risksmart.appetite (
        "Id",
        "LowerAppetite",
        "UpperAppetite",
        "Statement",
        "ParentRiskId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    a."LowerAppetite",
    a."UpperAppetite",
    a."Statement",
    a."ParentRiskId",
    risksmart.get_hasura_user_id(),
    a."OrgKey",
    'deleted',
    a."Meta"
FROM risksmart.appetite_view_active a
WHERE a."Timestamp" = original_timestamp
    AND a."Id" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE OR REPLACE FUNCTION risksmart.delete_test_result(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.test_result AS $$ BEGIN return query
INSERT INTO risksmart.test_result (
        "Id",
        "Title",
        "Submitter",
        "Description",
        "ParentControlId",
        "TestType",
        "DesignEffectiveness",
        "PerformanceEffectiveness",
        "OverallEffectiveness",
        "TestDate",
        "NextTestDate",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT tr."Id",
    tr."Title",
    tr."Submitter",
    tr."Description",
    tr."ParentControlId",
    tr."TestType",
    tr."DesignEffectiveness",
    tr."PerformanceEffectiveness",
    tr."OverallEffectiveness",
    tr."TestDate",
    tr."NextTestDate",
    risksmart.get_hasura_user_id(),
    tr."OrgKey",
    'deleted',
    tr."Meta"
FROM risksmart.test_result_view_active tr
WHERE tr."Timestamp" = original_timestamp
    AND tr."Id" = id
    AND tr."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE OR REPLACE VIEW risksmart.tag_view_active AS
SELECT tt."Name",
    tag."ParentId",
    tag."TagTypeId",
    tt."Description",
    tt."OrgKey"
FROM (
        risksmart.tag
        JOIN risksmart.tag_type tt ON (
            tag."TagTypeId" = tt."TagTypeId"
            AND tag."OrgKey" = tt."OrgKey"
        )
    )
WHERE (
        (
            tag."Timestamp" = (
                SELECT max(tag_1."Timestamp") AS max
                FROM risksmart.tag tag_1
                WHERE (tag_1."ParentId" = tag."ParentId")
                    AND tag_1."TagTypeId" = tag."TagTypeId"
            )
        )
        AND (
            tt."Timestamp" = (
                SELECT max(ltt."Timestamp") AS max
                FROM risksmart.tag_type ltt
                WHERE (ltt."TagTypeId" = tt."TagTypeId")
            )
        )
        AND (tag."RowStatus" = 'active'::text)
        AND (tt."RowStatus" = 'active'::text)
    );
CREATE OR REPLACE FUNCTION risksmart.delete_control(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.control AS $$ BEGIN return query
INSERT INTO risksmart.control (
        "Id",
        "Title",
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT tr."Id",
    tr."Title",
    tr."Owner",
    tr."Description",
    tr."Type",
    tr."ParentRiskId",
    risksmart.get_hasura_user_id(),
    tr."OrgKey",
    'deleted',
    tr."Meta"
FROM risksmart.control_view_active tr
WHERE tr."Timestamp" = original_timestamp
    AND tr."Id" = id
    AND tr."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE OR REPLACE VIEW risksmart.issue_view_active_flat AS (
        WITH oa AS (
            SELECT ia."IssueId",
                ia."OrgKey",
                count(*) AS "OpenActions"
            FROM risksmart.issue_action_view_active ia
                INNER JOIN risksmart.action a ON a."Id" = ia."ActionId"
                AND a."OrgKey" = ia."OrgKey"
            WHERE a."Status" = 'open'
            GROUP BY ia."IssueId",
                ia."OrgKey"
        ),
        ci AS (
            SELECT i."Id",
                i."OrgKey",
                min(i."Timestamp") AS "CreatedTimestamp"
            FROM risksmart.issue_view_active i
            GROUP BY i."Id",
                i."OrgKey"
        )
        SELECT i."Id",
            i."Title",
            i."Details",
            i."ImpactsCustomer",
            i."IsExternalIssue",
            i."DateOccurred",
            i."DateIdentified",
            i."User",
            i."Timestamp",
            i."OrgKey",
            i."RowStatus",
            i."Meta",
            ia."IssueType",
            ia."Severity",
            ia."TargetCloseDate",
            ia."ActualCloseDate",
            ia."Status",
            ia."Owner",
            ia."CertifiedIndividual",
            ia."RegulatoryBreach",
            ia."RegulationsBreached",
            ia."Reportable",
            ia."Rationale",
            ia."IssueCausedByThirdParty",
            ia."ThirdPartyResponsible",
            ia."IssueCausedBySystemIssue",
            ia."SystemResponsible",
            ia."PolicyBreach",
            ia."PoliciesBreached",
            ia."PolicyOwner",
            ia."PolicyOwnerCommentary",
            ia."AssociatedControlId",
            o."UserName" as "OwnerName",
            u."UserName" as "UserName",
            COALESCE(oa."OpenActions", 0) AS "OpenActions",
            ci."CreatedTimestamp"
        FROM risksmart.issue_view_active i
            LEFT OUTER JOIN risksmart.issue_assessment_view_active ia ON i."Id" = ia."ParentIssueId"
            AND i."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active o on ia."Owner" = o."Id"
            AND o."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active u on i."User" = u."Id"
            AND u."OrgKey" = i."OrgKey"
            LEFT OUTER JOIN oa ON oa."IssueId" = i."Id"
            AND oa."OrgKey" = i."OrgKey"
            LEFT OUTER JOIN ci ON ci."Id" = i."Id"
            AND ci."OrgKey" = i."OrgKey"
    );
CREATE OR REPLACE VIEW risksmart.issue_view_active_flat AS (
        WITH oa AS (
            SELECT ia."IssueId",
                ia."OrgKey",
                count(*) AS "OpenActions"
            FROM risksmart.issue_action_view_active ia
                INNER JOIN risksmart.action a ON a."Id" = ia."ActionId"
                AND a."OrgKey" = ia."OrgKey"
            WHERE a."Status" = 'open'
            GROUP BY ia."IssueId",
                ia."OrgKey"
        ),
        ci AS (
            SELECT i."Id",
                i."OrgKey",
                min(i."Timestamp") AS "CreatedTimestamp"
            FROM risksmart.issue i
            GROUP BY i."Id",
                i."OrgKey"
        )
        SELECT i."Id",
            i."Title",
            i."Details",
            i."ImpactsCustomer",
            i."IsExternalIssue",
            i."DateOccurred",
            i."DateIdentified",
            i."User",
            i."Timestamp",
            i."OrgKey",
            i."RowStatus",
            i."Meta",
            ia."IssueType",
            ia."Severity",
            ia."TargetCloseDate",
            ia."ActualCloseDate",
            ia."Status",
            ia."Owner",
            ia."CertifiedIndividual",
            ia."RegulatoryBreach",
            ia."RegulationsBreached",
            ia."Reportable",
            ia."Rationale",
            ia."IssueCausedByThirdParty",
            ia."ThirdPartyResponsible",
            ia."IssueCausedBySystemIssue",
            ia."SystemResponsible",
            ia."PolicyBreach",
            ia."PoliciesBreached",
            ia."PolicyOwner",
            ia."PolicyOwnerCommentary",
            ia."AssociatedControlId",
            o."UserName" as "OwnerName",
            u."UserName" as "UserName",
            COALESCE(oa."OpenActions", 0) AS "OpenActions",
            ci."CreatedTimestamp"
        FROM risksmart.issue_view_active i
            LEFT OUTER JOIN risksmart.issue_assessment_view_active ia ON i."Id" = ia."ParentIssueId"
            AND i."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active o on ia."Owner" = o."Id"
            AND o."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active u on i."User" = u."Id"
            AND u."OrgKey" = i."OrgKey"
            LEFT OUTER JOIN oa ON oa."IssueId" = i."Id"
            AND oa."OrgKey" = i."OrgKey"
            LEFT OUTER JOIN ci ON ci."Id" = i."Id"
            AND ci."OrgKey" = i."OrgKey"
    );
CREATE TABLE risksmart.file(
    "Id" uuid NOT NULL default gen_random_uuid(),
    "FileName" text NOT NULL,
    --bytes
    "FileSize" integer NOT NULL,
    "ContentType" text NOT NULL,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "File_pkey" PRIMARY KEY("Id", "Timestamp")
);

CREATE OR REPLACE VIEW risksmart.file_view_active AS WITH cte AS (
        SELECT DISTINCT on (f."Id") f."Id",
            f."FileName",
            --bytes
            f."FileSize",
            f."ContentType",
            f."Timestamp",
            f."User",
            f."OrgKey",
            f."RowStatus",
            f."Meta"
        FROM risksmart.file f
        ORDER BY f."Id",
            f."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE FUNCTION risksmart.insert_file(
        id uuid,
        file_name text,
        file_size integer,
        content_type text
    ) RETURNS SETOF risksmart.file AS $$ BEGIN IF EXISTS (
        SELECT 1
        FROM risksmart.file_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'File already exists';

END IF;

return query
INSERT INTO risksmart.file (
        "Id",
        "FileName",
        "FileSize",
        "ContentType",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        id,
        file_name,
        file_size,
        content_type,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.delete_file(id uuid) RETURNS SETOF risksmart.file AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.file_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'File does not exist';

END IF;

return query
INSERT INTO risksmart.file (
        "Id",
        "FileName",
        "FileSize",
        "ContentType",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT f."Id",
    f."FileName",
    f."FileSize",
    f."ContentType",
    risksmart.get_hasura_user_id(),
    f."OrgKey",
    'deleted',
    f."Meta"
FROM risksmart.file_view_active f
WHERE f."Id" = id
    AND f."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE TABLE risksmart.appetite_file(
    "AppetiteId" uuid NOT NULL,
    "FileId" uuid NOT NULL,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "AppetiteFile_pkey" PRIMARY KEY("AppetiteId", "FileId", "Timestamp")
);

CREATE OR REPLACE VIEW risksmart.appetite_file_view_active AS WITH cte AS (
        SELECT DISTINCT on (f."AppetiteId", f."FileId") f."AppetiteId",
            f."FileId",
            f."Timestamp",
            f."User",
            f."OrgKey",
            f."RowStatus",
            f."Meta"
        FROM risksmart.appetite_file f
        ORDER BY f."AppetiteId",
            f."FileId",
            f."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';
drop view risksmart.appetite_file_view_active;

drop table risksmart.appetite_file;

CREATE TABLE risksmart.relation_file(
    "ParentId" uuid NOT NULL,
    "ParentType" text NOT NULL,
    "FileId" uuid NOT NULL,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "RelationFile_pkey" PRIMARY KEY("ParentId", "FileId", "Timestamp")
);

ALTER TABLE risksmart.relation_file
ADD CONSTRAINT ParentType_check CHECK (
        "ParentType" IN (
            'appetite',
            'action_update',
            'issue',
            'acceptance',
            'action',
            'issue_update',
            'test_result'
        )
    );

CREATE OR REPLACE VIEW risksmart.relation_file_view_active AS WITH cte AS (
        SELECT DISTINCT on (f."ParentId", f."FileId") f."ParentId",
            f."ParentType",
            f."FileId",
            f."Timestamp",
            f."User",
            f."OrgKey",
            f."RowStatus",
            f."Meta"
        FROM risksmart.relation_file f
        ORDER BY f."ParentId",
            f."FileId",
            f."Timestamp" DESC
    )
SELECT c.*
FROM cte c
    INNER JOIN risksmart.file_view_active f ON c."FileId" = f."Id"
WHERE c."RowStatus" = 'active';

CREATE OR REPLACE VIEW risksmart.relation_file_view_active_flat AS
SELECT rf."ParentId",
    f."Id",
    f."FileName",
    --bytes
    f."FileSize",
    f."ContentType",
    f."Timestamp",
    f."User",
    f."OrgKey",
    f."RowStatus",
    f."Meta"
FROM risksmart.relation_file_view_active rf
    INNER JOIN risksmart.file_view_active f ON rf."FileId" = f."Id"
    AND f."OrgKey" = rf."OrgKey";

CREATE OR REPLACE FUNCTION risksmart.delete_relation_file(parent_id uuid, file_id uuid) RETURNS SETOF risksmart.relation_file AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.relation_file_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."ParentId" = parent_id
            AND i."FileId" = file_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'File does not exist';

END IF;

return query
INSERT INTO risksmart.relation_file (
        "ParentId",
        "ParentType",
        "FileId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT f."ParentId",
    f."ParentType",
    f."FileId",
    risksmart.get_hasura_user_id(),
    f."OrgKey",
    'deleted',
    f."Meta"
FROM risksmart.relation_file_view_active f
WHERE f."ParentId" = parent_id
    AND f."FileId" = file_id
    AND f."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

PERFORM risksmart.delete_file(id => file_id);

END $$ LANGUAGE plpgsql VOLATILE;
CREATE TABLE risksmart.control_group(
    "Id" uuid NOT NULL default gen_random_uuid(),
    "Title" text NOT NULL,
    "Owner" text NOT NULL,
    "Timestamp" timestamp with time zone default statement_timestamp() not null,
    "User" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowStatus" risksmart.row_status NOT NULL,
    "Meta" json NULL,
    CONSTRAINT "ControlGroup_pkey" PRIMARY KEY("Id", "Timestamp")
);

CREATE OR REPLACE VIEW risksmart.control_group_view_active AS WITH cte AS (
        SELECT DISTINCT on (cg."Id") cg."Id",
            cg."Title",
            cg."Owner",
            cg."Timestamp",
            cg."User",
            cg."OrgKey",
            cg."RowStatus",
            cg."Meta"
        FROM risksmart.control_group cg
        ORDER BY cg."Id",
            cg."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

ALTER TABLE risksmart.control
ADD COLUMN "GroupId" uuid NULL;

CREATE OR REPLACE VIEW risksmart.control_view_active AS WITH cte AS (
        SELECT DISTINCT on (c."Id") c."Id",
            c."Timestamp",
            c."User",
            c."Title",
            c."Owner",
            c."Description",
            c."Type",
            c."ParentRiskId",
            c."OrgKey",
            c."RowStatus",
            c."Meta",
            c."GroupId"
        FROM risksmart.control c
        ORDER BY c."Id",
            c."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

CREATE OR REPLACE FUNCTION risksmart.delete_control_group(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.control_group AS $$ BEGIN return query
INSERT INTO risksmart.control_group (
        "Id",
        "Title",
        "Owner",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT cg."Id",
    cg."Title",
    cg."Owner",
    risksmart.get_hasura_user_id(),
    cg."OrgKey",
    'deleted',
    cg."Meta"
FROM risksmart.control_group_view_active cg
WHERE cg."Timestamp" = original_timestamp
    AND cg."Id" = id
    AND cg."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

-- unset GroupId on child controls
INSERT INTO risksmart.control (
        "Id",
        "Title",
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "GroupId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT tr."Id",
    tr."Title",
    tr."Owner",
    tr."Description",
    tr."Type",
    tr."ParentRiskId",
    null,
    risksmart.get_hasura_user_id(),
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta"
FROM risksmart.control_view_active tr
WHERE tr."GroupId" = id
    AND tr."OrgKey" = risksmart.get_hasura_org_id();

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.delete_control(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.control AS $$ BEGIN return query
INSERT INTO risksmart.control (
        "Id",
        "Title",
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "GroupId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT tr."Id",
    tr."Title",
    tr."Owner",
    tr."Description",
    tr."Type",
    tr."ParentRiskId",
    tr."GroupId",
    risksmart.get_hasura_user_id(),
    tr."OrgKey",
    'deleted',
    tr."Meta"
FROM risksmart.control_view_active tr
WHERE tr."Timestamp" = original_timestamp
    AND tr."Id" = id
    AND tr."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE VIEW risksmart."test_result_view_active_flat" AS
SELECT tr."Id",
    tr."Timestamp",
    tr."User",
    tr."Title",
    tr."Submitter",
    tr."Description",
    tr."ParentControlId",
    tr."TestType",
    tr."DesignEffectiveness",
    tr."PerformanceEffectiveness",
    tr."OverallEffectiveness",
    tr."TestDate",
    tr."NextTestDate",
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta",
    s."UserName" as "SubmitterName",
    c."Title" as "ParentTitle",
    u."UserName" as "UserName"
FROM risksmart.test_result_view_active tr
    LEFT OUTER JOIN risksmart.user_view_active s on tr."Submitter" = s."Id"
    AND tr."OrgKey" = s."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active u on tr."User" = u."Id"
    AND tr."OrgKey" = u."OrgKey"
    LEFT OUTER JOIN risksmart.control_view_active c on tr."ParentControlId" = c."Id"
    AND tr."OrgKey" = c."OrgKey";

CREATE OR REPLACE VIEW "risksmart"."control_view_active_flat" AS WITH ltr AS (
        SELECT *,
            ROW_NUMBER() OVER(
                PARTITION BY tr."ParentControlId",
                tr."OrgKey"
                ORDER BY tr."TestDate" DESC
            ) AS newest
        from risksmart.test_result_view_active tr
    ),
    oa as (
        SELECT ca."ControlId",
            ca."OrgKey",
            count(*) AS "OpenActions"
        FROM risksmart.control_action_view_active ca
            INNER JOIN risksmart.action_view_active a ON a."Id" = ca."ActionId"
            AND a."OrgKey" = ca."OrgKey"
        WHERE a."Status" = 'open'
        GROUP BY ca."ControlId",
            ca."OrgKey"
    ),
    oi as (
        SELECT i."AssociatedControlId" as "ControlId",
            i."OrgKey",
            count(*) AS "OpenIssues"
        FROM risksmart.issue_assessment_view_active i
        WHERE i."Status" = 'open'
        GROUP BY i."AssociatedControlId",
            i."OrgKey"
    )
SELECT c."Id",
    c."Timestamp",
    "min"."FirstTimestamp" as "CreatedTimestamp",
    c."User",
    uva_user."UserName",
    c."Title",
    c."Owner",
    uva_owner."UserName" as "OwnerName",
    c."Description",
    c."Type",
    c."ParentRiskId",
    rva."Title" as "ParentTitle",
    c."OrgKey",
    c."RowStatus",
    c."Meta",
    ltr."OverallEffectiveness",
    CAST(COALESCE(oi."OpenIssues", 0) AS integer) as "OpenIssues",
    CAST(COALESCE(oa."OpenActions", 0) AS integer) as "OpenActions",
    c."GroupId"
FROM risksmart.control_view_active c
    LEFT OUTER JOIN risksmart.user_view_active uva_user on c."User" = uva_user."Id"
    AND c."OrgKey" = uva_user."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active uva_owner on c."Owner" = uva_owner."Id"
    AND c."OrgKey" = uva_owner."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active rva on c."ParentRiskId" = rva."Id"
    AND c."OrgKey" = rva."OrgKey"
    LEFT JOIN oa ON oa."ControlId" = c."Id"
    AND oa."OrgKey" = c."OrgKey"
    LEFT JOIN oi ON oi."ControlId" = c."Id"
    AND oi."OrgKey" = c."OrgKey"
    INNER JOIN (
        SELECT fc."Id",
            fc."OrgKey",
            MIN(fc."Timestamp") as "FirstTimestamp"
        FROM risksmart."control" fc
        GROUP BY fc."Id",
            fc."OrgKey"
    ) min ON c."Id" = min."Id"
    AND c."OrgKey" = min."OrgKey"
    LEFT OUTER JOIN ltr ON ltr."ParentControlId" = c."Id"
    AND ltr."OrgKey" = c."OrgKey"
    AND ltr.newest = 1;
CREATE OR REPLACE VIEW risksmart.control_group_view_active_flat AS WITH lc AS (
        SELECT c."GroupId",
            c."OrgKey",
            count(*) AS "LinkedControlCount"
        FROM risksmart.control_view_active c
        GROUP BY c."OrgKey",
            c."GroupId"
    )
SELECT cg."Id",
    cg."Title",
    cg."Owner",
    cg."Timestamp",
    cg."User",
    cg."OrgKey",
    cg."RowStatus",
    cg."Meta",
    COALESCE(lc."LinkedControlCount", 0) as "LinkedControlCount",
    uva_user."UserName",
    uva_owner."UserName" as "OwnerName"
FROM risksmart.control_group_view_active cg
    LEFT JOIN lc ON lc."GroupId" = cg."Id"
    AND lc."OrgKey" = cg."OrgKey"
    LEFT JOIN risksmart.user_view_active uva_user on cg."User" = uva_user."Id"
    AND cg."OrgKey" = uva_user."OrgKey"
    LEFT JOIN risksmart.user_view_active uva_owner on cg."Owner" = uva_owner."Id"
    AND cg."OrgKey" = uva_owner."OrgKey"
ORDER BY cg."Id",
    cg."Timestamp" DESC;

CREATE OR REPLACE FUNCTION risksmart.update_control_group(
        id uuid,
        title text,
        owner text,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.control_group AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.user_view_active c
        WHERE c."OrgKey" = risksmart.get_hasura_org_id()
            AND c."Id" = owner
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Owner not found';

END IF;

return query
INSERT INTO risksmart.control_group (
        "Id",
        "Title",
        "Owner",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT cg."Id",
    title,
    owner,
    risksmart.get_hasura_user_id(),
    cg."OrgKey",
    cg."RowStatus",
    cg."Meta"
FROM risksmart.control_group_view_active cg
WHERE cg."OrgKey" = risksmart.get_hasura_org_id()
    AND cg."Id" = id
    AND cg."Timestamp" = original_timestamp
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_control_group(title text, owner text) RETURNS SETOF risksmart.control_group AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.user_view_active c
        WHERE c."OrgKey" = risksmart.get_hasura_org_id()
            AND c."Id" = owner
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Owner not found';

END IF;

return query
INSERT INTO risksmart.control_group (
        "Title",
        "Owner",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES(
        title,
        owner,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE OR REPLACE FUNCTION risksmart.update_departments(
        parent_id uuid,
        department_type_ids uuid []
    ) RETURNS SETOF risksmart.department AS $$ BEGIN return query
INSERT INTO risksmart.department (
        "ParentId",
        "DepartmentTypeId",
        "OrgKey",
        "RowStatus",
        "User"
    ) -- tags to delete
SELECT t."ParentId",
    t."DepartmentTypeId",
    t."OrgKey",
    'deleted',
    risksmart.get_hasura_user_id()
FROM risksmart.department_view_active t
WHERE t."OrgKey" = risksmart.get_hasura_org_id()
    AND t."ParentId" = parent_id
    AND NOT t."DepartmentTypeId" = ANY (department_type_ids)
UNION
-- tags to add
SELECT parent_id,
    tt."DepartmentTypeId",
    tt."OrgKey",
    'active',
    risksmart.get_hasura_user_id()
FROM unnest(department_type_ids) department_type_id
    INNER JOIN risksmart.department_type tt on tt."DepartmentTypeId" = department_type_id
WHERE tt."OrgKey" = risksmart.get_hasura_org_id()
    AND tt."DepartmentTypeId" NOT IN (
        SELECT t."DepartmentTypeId"
        FROM risksmart.department_view_active t
        WHERE t."ParentId" = parent_id
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;




CREATE
OR REPLACE VIEW "risksmart"."department_type_view_active" AS
SELECT
  tt."DepartmentTypeId",
  tt."Timestamp",
  tt."Name",
  tt."Description",
  tt."OrgKey"
FROM
  risksmart.department_type tt
WHERE
  (
    (
      tt."Timestamp" = (
        SELECT
          max(department_1."Timestamp") AS max
        FROM
          risksmart.department_type department_1
        WHERE
          (department_1."DepartmentTypeId" = tt."DepartmentTypeId")
      )
    )
    AND ((tt."RowStatus") :: text = 'active' :: text)
  );



DROP FUNCTION IF EXISTS risksmart.insert_risk(text, text, text, integer, uuid, uuid[]);

DROP FUNCTION IF EXISTS risksmart.update_risk(uuid, text, text, text, integer, uuid, timestamp without time zone, uuid[]);

DROP FUNCTION IF EXISTS risksmart.insert_issue(text, text, boolean, boolean, timestamp with time zone, timestamp with time zone, uuid[], uuid);

DROP FUNCTION IF EXISTS risksmart.update_issue(uuid, text, text, boolean, boolean, timestamp with time zone, timestamp with time zone, uuid[], timestamp without time zone);



CREATE OR REPLACE FUNCTION risksmart.insert_risk(
	title text,
	owner text,
	description text,
	tier integer,
	parent_risk_id uuid,
	tag_type_ids uuid[],
	department_type_ids uuid[])
    RETURNS SETOF risksmart.risk
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE inserted_risk_id uuid;

BEGIN
INSERT INTO risksmart.risk (
        "User",
        "Title",
        "Owner",
        "Description",
        "Tier",
        "ParentRiskId",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        risksmart.get_hasura_user_id(),
        title,
        owner,
        description,
        tier,
        parent_risk_id,
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING "Id" into inserted_risk_id;

PERFORM risksmart.update_tags(
    parent_id => inserted_risk_id,
    tag_type_ids => tag_type_ids
);

PERFORM risksmart.update_departments(
    parent_id => inserted_risk_id,
    department_type_ids => department_type_ids
  );

RETURN QUERY
SELECT *
FROM risksmart.risk
WHERE "OrgKey" = risksmart.get_hasura_org_id()
    AND "Id" = inserted_risk_id
ORDER BY "Timestamp" desc
LIMIT 1;

END
$BODY$;



-----


-- FUNCTION: risksmart.update_risk(uuid, text, text, text, integer, uuid, timestamp without time zone, uuid[])

CREATE OR REPLACE FUNCTION risksmart.update_risk(
	id uuid,
	title text,
	owner text,
	description text,
	tier integer,
	parent_risk_id uuid,
	original_timestamp timestamp without time zone,
	tag_type_ids uuid[],
	department_type_ids uuid[])
    RETURNS SETOF risksmart.risk
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.risk a
        WHERE a."Timestamp" = original_timestamp
            AND a."Id" = id
            AND a."OrgKey" = risksmart.get_hasura_org_id()
            AND a."Tier" = tier
    ) THEN -- Remove parent on child risks if parent has changed
INSERT INTO risksmart.risk (
        "Id",
        "User",
        "Title",
        "Owner",
        "Description",
        "Tier",
        "ParentRiskId",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    risksmart.get_hasura_user_id(),
    a."Title",
    a."Owner",
    a."Description",
    a."Tier",
    null,
    a."OrgKey",
    a."RowStatus",
    a."Meta"
FROM risksmart.risk_view_active a -- Only allow the most recent active record to be deleted by using the active view
WHERE a."ParentRiskId" = id
    AND a."Id" <> id
    AND a."OrgKey" = risksmart.get_hasura_org_id();

END IF;

PERFORM risksmart.update_tags(
    parent_id => id,
    tag_type_ids => tag_type_ids
);

PERFORM risksmart.update_departments(
    parent_id => id,
    department_type_ids => department_type_ids
);

return query
INSERT INTO risksmart.risk (
        "Id",
        "User",
        "Title",
        "Owner",
        "Description",
        "Tier",
        "ParentRiskId",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT a."Id",
    risksmart.get_hasura_user_id(),
    title,
    owner,
    description,
    tier,
    parent_risk_id,
    a."OrgKey",
    a."RowStatus",
    a."Meta"
FROM risksmart.risk_view_active a -- Only allow the most recent active record to be deleted by using the active view
WHERE a."Timestamp" = original_timestamp
    AND a."Id" = id
    AND a."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END
$BODY$;


---


-- FUNCTION: risksmart.insert_issue(text, text, boolean, boolean, timestamp with time zone, timestamp with time zone, uuid[], uuid)

CREATE OR REPLACE FUNCTION risksmart.insert_issue(
	title text,
	details text,
	impacts_customer boolean,
	is_external_issue boolean,
	date_occurred timestamp with time zone,
	date_identified timestamp with time zone,
	tag_type_ids uuid[],
  department_type_ids uuid[],
	associated_control_id uuid)
    RETURNS SETOF risksmart.issue
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE inserted_issue_id uuid;

BEGIN IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active i
    WHERE i."OrgKey" = risksmart.get_hasura_org_id()
        AND i."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

INSERT INTO risksmart.issue (
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        title,
        details,
        impacts_customer,
        is_external_issue,
        date_occurred,
        date_identified,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING "Id" into inserted_issue_id;

PERFORM risksmart.update_tags(
    parent_id => inserted_issue_id,
    tag_type_ids => tag_type_ids
);

PERFORM risksmart.update_departments(
    parent_id => inserted_issue_id,
    department_type_ids => department_type_ids
);

IF associated_control_id IS NOT NULL THEN
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "AssociatedControlId",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        inserted_issue_id,
        associated_control_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    );

END IF;

RETURN QUERY
SELECT *
FROM risksmart.issue i
WHERE i."OrgKey" = risksmart.get_hasura_org_id()
    AND i."Id" = inserted_issue_id
ORDER BY i."Timestamp" desc
LIMIT 1;

END
$BODY$;




--

-- FUNCTION: risksmart.update_issue(uuid, text, text, boolean, boolean, timestamp with time zone, timestamp with time zone, uuid[], timestamp without time zone)

CREATE OR REPLACE FUNCTION risksmart.update_issue(
	id uuid,
	title text,
	details text,
	impacts_customer boolean,
	is_external_issue boolean,
	date_occurred timestamp with time zone,
	date_identified timestamp with time zone,
	tag_type_ids uuid[],
	department_type_ids uuid[],
	original_timestamp timestamp without time zone)
    RETURNS SETOF risksmart.issue
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
 BEGIN PERFORM risksmart.update_tags(
        parent_id => id,
        tag_type_ids => tag_type_ids
    );

PERFORM risksmart.update_departments(
        parent_id => id,
        department_type_ids => department_type_ids
    );

return query
INSERT INTO risksmart.issue (
        "Id",
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT i."Id",
    title,
    details,
    impacts_customer,
    is_external_issue,
    date_occurred,
    date_identified,
    risksmart.get_hasura_user_id(),
    i."OrgKey",
    i."RowStatus",
    i."Meta"
FROM risksmart.issue_view_active i
WHERE i."Timestamp" = original_timestamp
    AND i."Id" = id
    AND i."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END
$BODY$;



CREATE OR REPLACE VIEW risksmart."department_view_active" AS
 SELECT dt."Name",
    Department."ParentId",
    Department."DepartmentTypeId",
    dt."Description",
    dt."OrgKey"
   FROM risksmart.Department
     JOIN risksmart.Department_type dt ON Department."DepartmentTypeId" = dt."DepartmentTypeId" AND Department."OrgKey" = dt."OrgKey"
  WHERE Department."Timestamp" = (( SELECT max(Department_1."Timestamp") AS max
           FROM risksmart.Department Department_1
          WHERE Department_1."ParentId" = Department."ParentId" AND Department_1."DepartmentTypeId" = Department."DepartmentTypeId")) AND dt."Timestamp" = (( SELECT max(ldt."Timestamp") AS max
           FROM risksmart.Department_type ldt
          WHERE ldt."DepartmentTypeId" = dt."DepartmentTypeId")) AND Department."RowStatus"::text = 'active'::text AND dt."RowStatus"::text = 'active'::text;

ALTER TABLE risksmart.control_group
ADD COLUMN "Description" text NOT NULL DEFAULT '';

CREATE OR REPLACE VIEW risksmart.control_group_view_active AS WITH cte AS (
        SELECT DISTINCT on (cg."Id") cg."Id",
            cg."Title",
            cg."Owner",
            cg."Timestamp",
            cg."User",
            cg."OrgKey",
            cg."RowStatus",
            cg."Meta",
            cg."Description"
        FROM risksmart.control_group cg
        ORDER BY cg."Id",
            cg."Timestamp" DESC
    )
SELECT *
FROM cte
WHERE cte."RowStatus" = 'active';

DROP FUNCTION risksmart.delete_control_group;

CREATE OR REPLACE FUNCTION risksmart.delete_control_group(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.control_group AS $$ BEGIN return query
INSERT INTO risksmart.control_group (
        "Id",
        "Title",
        "Owner",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta",
        "Description"
    )
SELECT cg."Id",
    cg."Title",
    cg."Owner",
    risksmart.get_hasura_user_id(),
    cg."OrgKey",
    'deleted',
    cg."Meta",
    cg."Description"
FROM risksmart.control_group_view_active cg
WHERE cg."Timestamp" = original_timestamp
    AND cg."Id" = id
    AND cg."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

-- unset GroupId on child controls
INSERT INTO risksmart.control (
        "Id",
        "Title",
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "GroupId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT tr."Id",
    tr."Title",
    tr."Owner",
    tr."Description",
    tr."Type",
    tr."ParentRiskId",
    null,
    risksmart.get_hasura_user_id(),
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta"
FROM risksmart.control_view_active tr
WHERE tr."GroupId" = id
    AND tr."OrgKey" = risksmart.get_hasura_org_id();

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE VIEW risksmart.control_group_view_active_flat AS WITH lc AS (
        SELECT c."GroupId",
            c."OrgKey",
            count(*) AS "LinkedControlCount"
        FROM risksmart.control_view_active c
        GROUP BY c."OrgKey",
            c."GroupId"
    )
SELECT cg."Id",
    cg."Title",
    cg."Owner",
    cg."Timestamp",
    cg."User",
    cg."OrgKey",
    cg."RowStatus",
    cg."Meta",
    COALESCE(lc."LinkedControlCount", 0) as "LinkedControlCount",
    uva_user."UserName",
    uva_owner."UserName" as "OwnerName",
    cg."Description"
FROM risksmart.control_group_view_active cg
    LEFT JOIN lc ON lc."GroupId" = cg."Id"
    AND lc."OrgKey" = cg."OrgKey"
    LEFT JOIN risksmart.user_view_active uva_user on cg."User" = uva_user."Id"
    AND cg."OrgKey" = uva_user."OrgKey"
    LEFT JOIN risksmart.user_view_active uva_owner on cg."Owner" = uva_owner."Id"
    AND cg."OrgKey" = uva_owner."OrgKey"
ORDER BY cg."Id",
    cg."Timestamp" DESC;

DROP FUNCTION risksmart.update_control_group;

CREATE OR REPLACE FUNCTION risksmart.update_control_group(
        id uuid,
        title text,
        owner text,
        original_timestamp timestamp,
        description text
    ) RETURNS SETOF risksmart.control_group AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.user_view_active c
        WHERE c."OrgKey" = risksmart.get_hasura_org_id()
            AND c."Id" = owner
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Owner not found';

END IF;

return query
INSERT INTO risksmart.control_group (
        "Id",
        "Title",
        "Owner",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta",
        "Description"
    )
SELECT cg."Id",
    title,
    owner,
    risksmart.get_hasura_user_id(),
    cg."OrgKey",
    cg."RowStatus",
    cg."Meta",
    cg."Description"
FROM risksmart.control_group_view_active cg
WHERE cg."OrgKey" = risksmart.get_hasura_org_id()
    AND cg."Id" = id
    AND cg."Timestamp" = original_timestamp
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

DROP FUNCTION risksmart.insert_control_group;

CREATE OR REPLACE FUNCTION risksmart.insert_control_group(title text, owner text, description text) RETURNS SETOF risksmart.control_group AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.user_view_active c
        WHERE c."OrgKey" = risksmart.get_hasura_org_id()
            AND c."Id" = owner
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Owner not found';

END IF;

return query
INSERT INTO risksmart.control_group (
        "Title",
        "Owner",
        "User",
        "OrgKey",
        "RowStatus",
        "Description"
    )
VALUES(
        title,
        owner,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active',
        description
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE UNIQUE INDEX "risk_register_index" on
  "risksmart"."risk" using btree ("OrgKey", "RowStatus", "Timestamp", "Id", "User", "Owner", "ParentRiskId");

CREATE OR REPLACE FUNCTION risksmart.update_control_group(
        id uuid,
        title text,
        owner text,
        original_timestamp timestamp,
        description text
    ) RETURNS SETOF risksmart.control_group AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.user_view_active c
        WHERE c."OrgKey" = risksmart.get_hasura_org_id()
            AND c."Id" = owner
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Owner not found';

END IF;

return query
INSERT INTO risksmart.control_group (
        "Id",
        "Title",
        "Owner",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta",
        "Description"
    )
SELECT cg."Id",
    title,
    owner,
    risksmart.get_hasura_user_id(),
    cg."OrgKey",
    cg."RowStatus",
    cg."Meta",
    description
FROM risksmart.control_group_view_active cg
WHERE cg."OrgKey" = risksmart.get_hasura_org_id()
    AND cg."Id" = id
    AND cg."Timestamp" = original_timestamp
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;
-- delete org users that aren't in other orgs
CREATE OR REPLACE FUNCTION risksmart.delete_organisation_users(orgKey text) RETURNS SETOF auth.user AS $$ BEGIN return query
delete from auth.user u
where u."Id" in (
        select ou."User_Id"
        from auth.organisationuser ou
        where ou."OrgKey" = orgKey
    )
    AND u."Id" not in (
        select ou."User_Id"
        from auth.organisationuser ou
        where ou."OrgKey" <> orgKey
    )
returning *;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE OR REPLACE FUNCTION risksmart.insert_control_group(title text, owner text, description text) RETURNS SETOF risksmart.control_group AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.user_view_active c
        WHERE c."OrgKey" = risksmart.get_hasura_org_id()
            AND c."Id" = owner
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Owner not found';

END IF;

IF EXISTS (
    SELECT 1
    FROM risksmart.control_group_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Title" = title
    LIMIT 1
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'You have another control group with this title. Please enter a unique value.';

END IF;

return query
INSERT INTO risksmart.control_group (
        "Title",
        "Owner",
        "User",
        "OrgKey",
        "RowStatus",
        "Description"
    )
VALUES(
        title,
        owner,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active',
        description
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_control_group(
        id uuid,
        title text,
        owner text,
        original_timestamp timestamp,
        description text
    ) RETURNS SETOF risksmart.control_group AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.user_view_active c
        WHERE c."OrgKey" = risksmart.get_hasura_org_id()
            AND c."Id" = owner
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Owner not found';

END IF;

IF EXISTS (
    SELECT 1
    FROM risksmart.control_group_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Title" = title
        AND c."Id" <> id
    LIMIT 1
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'You have another control group with this title. Please enter a unique value.';

END IF;

return query
INSERT INTO risksmart.control_group (
        "Id",
        "Title",
        "Owner",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta",
        "Description"
    )
SELECT cg."Id",
    title,
    owner,
    risksmart.get_hasura_user_id(),
    cg."OrgKey",
    cg."RowStatus",
    cg."Meta",
    description
FROM risksmart.control_group_view_active cg
WHERE cg."OrgKey" = risksmart.get_hasura_org_id()
    AND cg."Id" = id
    AND cg."Timestamp" = original_timestamp
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;
-- delete org users that aren't in other orgs
CREATE OR REPLACE FUNCTION risksmart.delete_organisation_users(orgKey text) RETURNS SETOF auth.user AS $$ BEGIN CREATE TEMP TABLE users ("id" text);

insert into users ("id")
select u."Id"
from auth.user u
where u."Id" in (
        select ou."User_Id"
        from auth.organisationuser ou
        where ou."OrgKey" = orgKey
    )
    AND u."Id" not in (
        select ou."User_Id"
        from auth.organisationuser ou
        where ou."OrgKey" <> orgKey
    );

delete from auth.organisationuser
where "OrgKey" = orgKey;

return query
delete from auth.user u
where u."Id" in (
        select "id"
        from users
    )
returning *;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE TABLE risksmart.obligation(
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "ParentId" uuid,
    "Title" text NOT NULL,
    "Owner" text NOT NULL,
    "Description" text,
    "Interpretation" text,
    "Adherence" text,
    "Type" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE risksmart.obligation_type (
  "Value" text PRIMARY KEY,
  "Comment" text
);

ALTER TABLE risksmart.obligation ADD CONSTRAINT
  "Obligation_type_fkey" 
  FOREIGN KEY ("Type") REFERENCES risksmart.obligation_type("Value");

INSERT INTO risksmart.obligation_type ("Value", "Comment") VALUES
  ('standard', 'High-level Standard'),
  ('chapter', 'Chapter'),
  ('rule', 'Rule');

/** obligation assessments **/

CREATE TABLE risksmart.obligation_assessment(
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "ParentObligationId" uuid NOT NULL,
    "Title" text NULL,
    "Summary" text NULL,
    "TargetCompletionDate" timestamp with time zone NULL,
    "ActualCompletionDate" timestamp with time zone NULL,
    "StartDate" timestamp with time zone NULL,
    "Status" text NULL,
    "Owner" text NULL,
    "Result" smallint NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE risksmart.obligation_assessment_status (
  "Value" text PRIMARY KEY,
  "Comment" text
);

ALTER TABLE risksmart.obligation_assessment ADD CONSTRAINT
  "Obligation_assessment_status_fkey" 
  FOREIGN KEY ("Status") REFERENCES risksmart.obligation_assessment_status("Value");

INSERT INTO risksmart.obligation_assessment_status ("Value", "Comment") VALUES
  ('complete', 'Complete'),
  ('notstarted', 'Not Started'),
  ('inprogress', 'In Progress');

/** obligation impact **/

CREATE TABLE risksmart.obligation_impact (
  "Id" uuid default gen_random_uuid() not null PRIMARY KEY,
  "ParentObligationId" uuid NOT NULL,
  "Description" text NOT NULL,
  "ImpactRating" smallint NOT NULL,
  "OrgKey" text NOT NULL, 
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE DOMAIN risksmart.db_action AS TEXT CHECK (
    VALUE IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
);

-- Update get_hasura_user_id to return null if hasura.user isn't set. That way we can handle modifications on tables outside of hasura without error
CREATE OR REPLACE FUNCTION risksmart.get_hasura_user_id() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE user_id TEXT;

BEGIN
SELECT cast(current_setting('hasura.user', 't') as JSON)->>'x-hasura-user-id' into user_id;

RETURN user_id;

END;

$$;

-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.tag_type_audit (
    "TagTypeId" uuid default gen_random_uuid() NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "Action" risksmart.db_action,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("TagTypeId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.tag_type
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.tag_type
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.tag_type
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.tag_type_audit (
        "TagTypeId",
        "Name",
        "Description",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "RowStatus"
    )
SELECT tt."TagTypeId",
    tt."Name",
    tt."Description",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END,
    tt."RowStatus"
FROM risksmart.tag_type tt
    INNER JOIN (
        SELECT distinct on (tag."TagTypeId") tag."TagTypeId",
            tag."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            tag."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.tag_type tag
        ORDER BY tag."TagTypeId",
            tag."ModifiedAtTimestamp"
    ) As created ON created."TagTypeId" = tt."TagTypeId";

truncate table risksmart.tag_type;

ALTER TABLE risksmart.tag_type DROP CONSTRAINT tag_type_pkey;

ALTER TABLE risksmart.tag_type
ADD PRIMARY KEY ("TagTypeId");

-- Populate table with latest record
INSERT INTO risksmart.tag_type (
        "TagTypeId",
        "Name",
        "Description",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT tt."TagTypeId",
    tt."Name",
    tt."Description",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    tt."CreatedByUser",
    tt."CreatedAtTimestamp",
    tt."RowStatus"
FROM risksmart.tag_type_audit tt
WHERE (
        (
            tt."ModifiedAtTimestamp" = (
                SELECT max(tag_1."ModifiedAtTimestamp") AS max
                FROM risksmart.tag_type_audit tag_1
                WHERE (tag_1."TagTypeId" = tt."TagTypeId")
            )
        )
        AND (tt."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.tag_type_modified() RETURNS trigger AS $body$
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

insert into risksmart.tag_type_audit(
        "TagTypeId",
        "Name",
        "Description",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."TagTypeId",
        nr."Name",
        nr."Description",
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

CREATE TRIGGER tag_type_audit_insert_trigger
AFTER
INSERT ON risksmart.tag_type FOR EACH ROW EXECUTE FUNCTION risksmart.tag_type_modified();

CREATE TRIGGER tag_type_audit_delete_trigger
AFTER DELETE ON risksmart.tag_type FOR EACH ROW EXECUTE FUNCTION risksmart.tag_type_modified();

CREATE TRIGGER tag_type_audit_update_trigger
AFTER
UPDATE ON risksmart.tag_type FOR EACH ROW EXECUTE FUNCTION risksmart.tag_type_modified();

DROP VIEW risksmart."tag_type_view_active";

-- No need to filter in latest tag type
CREATE OR REPLACE VIEW risksmart.tag_view_active AS
SELECT tt."Name",
    tag."ParentId",
    tag."TagTypeId",
    tt."Description",
    tt."OrgKey"
FROM (
        risksmart.tag
        JOIN risksmart.tag_type tt ON (
            tag."TagTypeId" = tt."TagTypeId"
            AND tag."OrgKey" = tt."OrgKey"
        )
    )
WHERE (
        (
            tag."Timestamp" = (
                SELECT max(tag_1."Timestamp") AS max
                FROM risksmart.tag tag_1
                WHERE (tag_1."ParentId" = tag."ParentId")
                    AND tag_1."TagTypeId" = tag."TagTypeId"
            )
        )
        AND (tag."RowStatus" = 'active'::text)
    );

-- remove row status
ALTER TABLE risksmart.tag_type_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.tag_type DROP COLUMN "RowStatus";

CREATE OR REPLACE FUNCTION risksmart.update_tags(
        parent_id uuid,
        tag_type_ids uuid []
    ) RETURNS SETOF risksmart.tag AS $$ BEGIN return query
INSERT INTO risksmart.tag (
        "ParentId",
        "TagTypeId",
        "OrgKey",
        "RowStatus",
        "User"
    ) -- tags to delete
SELECT t."ParentId",
    t."TagTypeId",
    t."OrgKey",
    'deleted',
    risksmart.get_hasura_user_id()
FROM risksmart.tag_view_active t
WHERE t."OrgKey" = risksmart.get_hasura_org_id()
    AND t."ParentId" = parent_id
    AND NOT t."TagTypeId" = ANY (tag_type_ids)
UNION
-- tags to add
SELECT parent_id,
    tt."TagTypeId",
    tt."OrgKey",
    'active',
    risksmart.get_hasura_user_id()
FROM unnest(tag_type_ids) tag_type_id
    INNER JOIN risksmart.tag_type tt on tt."TagTypeId" = tag_type_id
WHERE tt."OrgKey" = risksmart.get_hasura_org_id()
    AND tt."TagTypeId" NOT IN (
        SELECT t."TagTypeId"
        FROM risksmart.tag_view_active t
        WHERE t."ParentId" = parent_id
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE TABLE IF NOT EXISTS risksmart.tag_audit (
    "ParentId" uuid NOT NULL,
    "TagTypeId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "Action" risksmart.db_action,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("ParentId", "TagTypeId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.tag
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.tag
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.tag
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

ALTER TABLE risksmart.tag
alter column "TagTypeId"
set default gen_random_uuid();

INSERT INTO risksmart.tag_audit (
        "ParentId",
        "TagTypeId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "RowStatus"
    )
SELECT t."ParentId",
    t."TagTypeId",
    t."OrgKey",
    t."ModifiedByUser",
    t."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    CASE
        WHEN t."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN t."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END,
    t."RowStatus"
FROM risksmart.tag t
    INNER JOIN (
        SELECT distinct on (tag."ParentId", tag."TagTypeId") tag."ParentId",
            tag."TagTypeId",
            tag."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            tag."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.tag tag
        ORDER BY tag."ParentId",
            tag."TagTypeId",
            tag."ModifiedAtTimestamp"
    ) As created ON created."TagTypeId" = t."TagTypeId"
    AND created."ParentId" = t."ParentId";

truncate table risksmart.tag;

ALTER TABLE risksmart.tag DROP CONSTRAINT tag_pkey;

ALTER TABLE risksmart.tag
ADD PRIMARY KEY ("ParentId", "TagTypeId");

-- Populate table with latest record
INSERT INTO risksmart.tag (
        "ParentId",
        "TagTypeId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT t."ParentId",
    t."TagTypeId",
    t."OrgKey",
    t."ModifiedByUser",
    t."ModifiedAtTimestamp",
    t."CreatedByUser",
    t."CreatedAtTimestamp",
    t."RowStatus"
FROM risksmart.tag_audit t
WHERE (
        t."ModifiedAtTimestamp" = (
            SELECT max(tag_1."ModifiedAtTimestamp") AS max
            FROM risksmart.tag_audit tag_1
            WHERE tag_1."TagTypeId" = t."TagTypeId"
                AND tag_1."ParentId" = t."ParentId"
        )
        AND (t."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.tag_modified() RETURNS trigger AS $body$
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

insert into risksmart.tag_audit(
        "ParentId",
        "TagTypeId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentId",
        nr."TagTypeId",
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

CREATE TRIGGER tag_audit_insert_trigger
AFTER
INSERT ON risksmart.tag FOR EACH ROW EXECUTE FUNCTION risksmart.tag_modified();

CREATE TRIGGER tag_audit_delete_trigger
AFTER DELETE ON risksmart.tag FOR EACH ROW EXECUTE FUNCTION risksmart.tag_modified();

CREATE TRIGGER tag_audit_update_trigger
AFTER
UPDATE ON risksmart.tag FOR EACH ROW EXECUTE FUNCTION risksmart.tag_modified();

CREATE OR REPLACE FUNCTION risksmart.update_tags(
        parent_id uuid,
        tag_type_ids uuid []
    ) RETURNS SETOF risksmart.tag AS $$ BEGIN
DELETE FROM risksmart.tag
WHERE "OrgKey" = risksmart.get_hasura_org_id()
    AND "ParentId" = parent_id
    AND NOT "TagTypeId" = ANY (tag_type_ids);

return query
INSERT INTO risksmart.tag (
        "ParentId",
        "TagTypeId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
SELECT parent_id,
    tt."TagTypeId",
    tt."OrgKey",
    risksmart.get_hasura_user_id(),
    risksmart.get_hasura_user_id()
FROM unnest(tag_type_ids) tag_type_id
    INNER JOIN risksmart.tag_type tt on tt."TagTypeId" = tag_type_id
WHERE tt."OrgKey" = risksmart.get_hasura_org_id()
    AND tt."TagTypeId" NOT IN (
        SELECT t."TagTypeId"
        FROM risksmart.tag t
        WHERE t."ParentId" = parent_id
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

DROP VIEW risksmart.tag_view_active;

ALTER TABLE risksmart.tag_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.tag DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.department_type_audit (
    "DepartmentTypeId" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("DepartmentTypeId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.department_type
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.department_type
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.department_type
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.department_type_audit (
        "DepartmentTypeId",
        "Name",
        "Description",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "RowStatus"
    )
SELECT tt."DepartmentTypeId",
    tt."Name",
    tt."Description",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END,
    tt."RowStatus"
FROM risksmart.department_type tt
    INNER JOIN (
        SELECT distinct on (dep."DepartmentTypeId") dep."DepartmentTypeId",
            dep."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            dep."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.department_type dep
        ORDER BY dep."DepartmentTypeId",
            dep."ModifiedAtTimestamp"
    ) As created ON created."DepartmentTypeId" = tt."DepartmentTypeId";

truncate table risksmart.department_type;

ALTER TABLE risksmart.department_type DROP CONSTRAINT department_type_pkey;

ALTER TABLE risksmart.department_type
ADD PRIMARY KEY ("DepartmentTypeId");

-- Populate table with latest record
INSERT INTO risksmart.department_type (
        "DepartmentTypeId",
        "Name",
        "Description",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT tt."DepartmentTypeId",
    tt."Name",
    tt."Description",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    tt."CreatedByUser",
    tt."CreatedAtTimestamp",
    tt."RowStatus"
FROM risksmart.department_type_audit tt
WHERE (
        (
            tt."ModifiedAtTimestamp" = (
                SELECT max(dep_1."ModifiedAtTimestamp") AS max
                FROM risksmart.department_type_audit dep_1
                WHERE (dep_1."DepartmentTypeId" = tt."DepartmentTypeId")
            )
        )
        AND (tt."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.department_type_modified() RETURNS trigger AS $body$
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

insert into risksmart.department_type_audit(
        "DepartmentTypeId",
        "Name",
        "Description",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."DepartmentTypeId",
        nr."Name",
        nr."Description",
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

CREATE TRIGGER department_type_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.department_type FOR EACH ROW EXECUTE FUNCTION risksmart.department_type_modified();

DROP VIEW risksmart."department_type_view_active";

-- No need to filter in latest department type
CREATE OR REPLACE VIEW risksmart.department_view_active AS
SELECT tt."Name",
    dep."ParentId",
    dep."DepartmentTypeId",
    tt."Description",
    tt."OrgKey"
FROM (
        risksmart.department dep
        JOIN risksmart.department_type tt ON (
            dep."DepartmentTypeId" = tt."DepartmentTypeId"
            AND dep."OrgKey" = tt."OrgKey"
        )
    )
WHERE (
        (
            dep."Timestamp" = (
                SELECT max(dep_1."Timestamp") AS max
                FROM risksmart.department dep_1
                WHERE (dep_1."ParentId" = dep."ParentId")
                    AND dep_1."DepartmentTypeId" = dep."DepartmentTypeId"
            )
        )
        AND (dep."RowStatus" = 'active'::text)
    );

-- remove row status
ALTER TABLE risksmart.department_type_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.department_type DROP COLUMN "RowStatus";

CREATE OR REPLACE FUNCTION risksmart.update_departments(
        parent_id uuid,
        department_type_ids uuid []
    ) RETURNS SETOF risksmart.department AS $$ BEGIN return query
INSERT INTO risksmart.department (
        "ParentId",
        "DepartmentTypeId",
        "OrgKey",
        "RowStatus",
        "User"
    ) -- departments to delete
SELECT t."ParentId",
    t."DepartmentTypeId",
    t."OrgKey",
    'deleted',
    risksmart.get_hasura_user_id()
FROM risksmart.department_view_active t
WHERE t."OrgKey" = risksmart.get_hasura_org_id()
    AND t."ParentId" = parent_id
    AND NOT t."DepartmentTypeId" = ANY (department_type_ids)
UNION
-- departments to add
SELECT parent_id,
    tt."DepartmentTypeId",
    tt."OrgKey",
    'active',
    risksmart.get_hasura_user_id()
FROM unnest(department_type_ids) department_type_id
    INNER JOIN risksmart.department_type tt on tt."DepartmentTypeId" = department_type_id
WHERE tt."OrgKey" = risksmart.get_hasura_org_id()
    AND tt."DepartmentTypeId" NOT IN (
        SELECT t."DepartmentTypeId"
        FROM risksmart.department_view_active t
        WHERE t."ParentId" = parent_id
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;
CREATE TABLE IF NOT EXISTS risksmart.department_audit (
    "ParentId" uuid NOT NULL,
    "DepartmentTypeId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    primary key (
        "ParentId",
        "DepartmentTypeId",
        "ModifiedAtTimestamp"
    )
);

ALTER TABLE risksmart.department
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.department
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.department
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

ALTER TABLE risksmart.department
alter column "DepartmentTypeId"
set default gen_random_uuid();

INSERT INTO risksmart.department_audit (
        "ParentId",
        "DepartmentTypeId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "RowStatus"
    )
SELECT t."ParentId",
    t."DepartmentTypeId",
    t."OrgKey",
    t."ModifiedByUser",
    t."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    CASE
        WHEN t."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN t."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END,
    t."RowStatus"
FROM risksmart.department t
    INNER JOIN (
        SELECT distinct on (dep."ParentId", dep."DepartmentTypeId") dep."ParentId",
            dep."DepartmentTypeId",
            dep."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            dep."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.department dep
        ORDER BY dep."ParentId",
            dep."DepartmentTypeId",
            dep."ModifiedAtTimestamp"
    ) As created ON created."DepartmentTypeId" = t."DepartmentTypeId"
    AND created."ParentId" = t."ParentId";

truncate table risksmart.department;

ALTER TABLE risksmart.department DROP CONSTRAINT department_pkey;

ALTER TABLE risksmart.department
ADD PRIMARY KEY ("ParentId", "DepartmentTypeId");

-- Populate table with latest record
INSERT INTO risksmart.department (
        "ParentId",
        "DepartmentTypeId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT t."ParentId",
    t."DepartmentTypeId",
    t."OrgKey",
    t."ModifiedByUser",
    t."ModifiedAtTimestamp",
    t."CreatedByUser",
    t."CreatedAtTimestamp",
    t."RowStatus"
FROM risksmart.department_audit t
WHERE t."ModifiedAtTimestamp" = (
        SELECT max(dep_1."ModifiedAtTimestamp") AS max
        FROM risksmart.department_audit dep_1
        WHERE dep_1."DepartmentTypeId" = t."DepartmentTypeId"
            AND dep_1."ParentId" = t."ParentId"
    )
    AND (t."RowStatus" = 'active'::text);

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.department_modified() RETURNS trigger AS $body$
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

insert into risksmart.department_audit(
        "ParentId",
        "DepartmentTypeId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentId",
        nr."DepartmentTypeId",
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

CREATE TRIGGER department_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.department FOR EACH ROW EXECUTE FUNCTION risksmart.department_modified();

CREATE OR REPLACE FUNCTION risksmart.update_departments(
        parent_id uuid,
        department_type_ids uuid []
    ) RETURNS SETOF risksmart.department AS $$ BEGIN
DELETE FROM risksmart.department
WHERE "OrgKey" = risksmart.get_hasura_org_id()
    AND "ParentId" = parent_id
    AND NOT "DepartmentTypeId" = ANY (department_type_ids);

return query
INSERT INTO risksmart.department (
        "ParentId",
        "DepartmentTypeId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
SELECT parent_id,
    tt."DepartmentTypeId",
    tt."OrgKey",
    risksmart.get_hasura_user_id(),
    risksmart.get_hasura_user_id()
FROM unnest(department_type_ids) department_type_id
    INNER JOIN risksmart.department_type tt on tt."DepartmentTypeId" = department_type_id
WHERE tt."OrgKey" = risksmart.get_hasura_org_id()
    AND tt."DepartmentTypeId" NOT IN (
        SELECT t."DepartmentTypeId"
        FROM risksmart.department t
        WHERE t."ParentId" = parent_id
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE VIEW risksmart.department_security_risk AS
SELECT R."Id",
    coalesce(
        d."DepartmentTypeId",
        '00000000-0000-0000-0000-000000000000'
    ) as "DepartmentTypeId"
FROM risksmart.risk_view_active AS R
    LEFT OUTER JOIN risksmart.department D on D."ParentId" = R."Id";

DROP VIEW risksmart.department_view_active;

ALTER TABLE risksmart.department_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.department DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.file_audit (
    "Id" uuid NOT NULL,
    "FileName" text NOT NULL,
    "FileSize" integer NOT NULL,
    "ContentType" text NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Meta" json,
    "Action" risksmart.db_action,
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.file
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.file
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.file
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.file_audit (
        "Id",
        "FileName",
        "FileSize",
        "ContentType",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action",
        "RowStatus"
    )
SELECT tt."Id",
    tt."FileName",
    tt."FileSize",
    tt."ContentType",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."Meta",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END,
    tt."RowStatus"
FROM risksmart.file tt
    INNER JOIN (
        SELECT distinct on (f."Id") f."Id",
            f."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            f."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.file f
        ORDER BY f."Id",
            f."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.file;

ALTER TABLE risksmart.file DROP CONSTRAINT "File_pkey";

ALTER TABLE risksmart.file
ADD PRIMARY KEY ("Id");

-- Populate table with latest record
INSERT INTO risksmart.file (
        "Id",
        "FileName",
        "FileSize",
        "ContentType",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "RowStatus"
    )
SELECT tt."Id",
    tt."FileName",
    tt."FileSize",
    tt."ContentType",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    tt."CreatedByUser",
    tt."CreatedAtTimestamp",
    tt."Meta",
    tt."RowStatus"
FROM risksmart.file_audit tt
WHERE (
        (
            tt."ModifiedAtTimestamp" = (
                SELECT max(f."ModifiedAtTimestamp") AS max
                FROM risksmart.file_audit f
                WHERE (f."Id" = tt."Id")
            )
        )
        AND (tt."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.file_modified() RETURNS trigger AS $body$
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

insert into risksmart.file_audit(
        "Id",
        "FileName",
        "FileSize",
        "ContentType",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action"
    )
values (
        nr."Id",
        nr."FileName",
        nr."FileSize",
        nr."ContentType",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER file_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.file FOR EACH ROW EXECUTE FUNCTION risksmart.file_modified();

DROP FUNCTION risksmart.insert_file;

DROP FUNCTION risksmart.delete_file;

DROP VIEW risksmart.relation_file_view_active_flat;

DROP VIEW risksmart.relation_file_view_active;
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.relation_file_audit (
    "ParentId" uuid NOT NULL,
    "ParentType" text NOT NULL,
    "FileId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Meta" json,
    "Action" risksmart.db_action,
    "RowStatus" risksmart.row_status NOT NULL,
    primary key ("ParentId", "FileId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.relation_file
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.relation_file
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.relation_file
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.relation_file_audit (
        "ParentId",
        "ParentType",
        "FileId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action",
        "RowStatus"
    )
SELECT tt."ParentId",
    tt."ParentType",
    tt."FileId",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."Meta",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END,
    tt."RowStatus"
FROM risksmart.relation_file tt
    INNER JOIN (
        SELECT distinct on (f."ParentId", f."FileId") f."ParentId",
            f."FileId",
            f."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            f."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.relation_file f
        ORDER BY f."ParentId",
            f."FileId",
            f."ModifiedAtTimestamp"
    ) As created ON created."ParentId" = tt."ParentId"
    AND created."FileId" = tt."FileId";

truncate table risksmart.relation_file;

ALTER TABLE risksmart.relation_file DROP CONSTRAINT "RelationFile_pkey";

ALTER TABLE risksmart.relation_file
ADD PRIMARY KEY ("ParentId", "FileId");

-- Populate table with latest record
INSERT INTO risksmart.relation_file (
        "ParentId",
        "ParentType",
        "FileId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "RowStatus"
    )
SELECT tt."ParentId",
    tt."ParentType",
    tt."FileId",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    tt."CreatedByUser",
    tt."CreatedAtTimestamp",
    tt."Meta",
    tt."RowStatus"
FROM risksmart.relation_file_audit tt
WHERE (
        (
            tt."ModifiedAtTimestamp" = (
                SELECT max(f."ModifiedAtTimestamp") AS max
                FROM risksmart.relation_file_audit f
                WHERE (
                        f."ParentId" = tt."ParentId"
                        AND f."FileId" = tt."FileId"
                    )
            )
        )
        AND (tt."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.relation_file_modified() RETURNS trigger AS $body$
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

insert into risksmart.relation_file_audit(
        "ParentId",
        "ParentType",
        "FileId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action"
    )
values (
        nr."ParentId",
        nr."ParentType",
        nr."FileId",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER relation_file_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.relation_file FOR EACH ROW EXECUTE FUNCTION risksmart.relation_file_modified();

DROP FUNCTION risksmart.delete_relation_file;

-- remove row status
ALTER TABLE risksmart.relation_file_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.relation_file DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.cause_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "Significance" integer NOT NULL,
    "ParentIssueId" uuid NOT NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.cause
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.cause
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.cause
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.cause_audit (
        "Id",
        "Title",
        "Description",
        "Significance",
        "ParentIssueId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Description",
    tt."Significance",
    tt."ParentIssueId",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.cause tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.cause c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.cause;

ALTER TABLE risksmart.cause DROP CONSTRAINT "Cause_pkey";

ALTER TABLE risksmart.cause
ADD PRIMARY KEY ("Id");

-- Populate table with latest record
INSERT INTO risksmart.cause (
        "Id",
        "Title",
        "Description",
        "Significance",
        "ParentIssueId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Description",
    c."Significance",
    c."ParentIssueId",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.cause_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.cause_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.cause_modified() RETURNS trigger AS $body$
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

insert into risksmart.cause_audit(
        "Id",
        "Title",
        "Description",
        "Significance",
        "ParentIssueId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Description",
        nr."Significance",
        nr."ParentIssueId",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER cause_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.cause FOR EACH ROW EXECUTE FUNCTION risksmart.cause_modified();

DROP FUNCTION risksmart.delete_cause;

DROP FUNCTION risksmart.insert_cause;

DROP FUNCTION risksmart.update_cause;

DROP VIEW risksmart.cause_view_active;

-- remove row status
ALTER TABLE risksmart.cause_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.cause DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.consequence_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "Criticality" integer NOT NULL,
    "CostType" text NOT NULL,
    "CostValue" integer NOT NULL,
    "ParentIssueId" uuid NOT NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.consequence
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.consequence
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.consequence
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.consequence_audit (
        "Id",
        "Title",
        "Description",
        "Criticality",
        "CostType",
        "CostValue",
        "ParentIssueId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Description",
    tt."Criticality",
    tt."CostType",
    tt."CostValue",
    tt."ParentIssueId",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.consequence tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.consequence c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.consequence;

ALTER TABLE risksmart.consequence DROP CONSTRAINT "Consequence_pkey";

ALTER TABLE risksmart.consequence
ADD PRIMARY KEY ("Id");

-- Populate table with latest record
INSERT INTO risksmart.consequence (
        "Id",
        "Title",
        "Description",
        "Criticality",
        "CostType",
        "CostValue",
        "ParentIssueId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Description",
    c."Criticality",
    c."CostType",
    c."CostValue",
    c."ParentIssueId",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.consequence_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.consequence_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.consequence_modified() RETURNS trigger AS $body$
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

insert into risksmart.consequence_audit(
        "Id",
        "Title",
        "Description",
        "Criticality",
        "CostType",
        "CostValue",
        "ParentIssueId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Description",
        nr."Criticality",
        nr."CostType",
        nr."CostValue",
        nr."ParentIssueId",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER consequence_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.consequence FOR EACH ROW EXECUTE FUNCTION risksmart.consequence_modified();

DROP FUNCTION risksmart.delete_consequence;

CREATE OR REPLACE FUNCTION risksmart.insert_consequence(
        title text,
        description text,
        criticality integer,
        parent_issue_id uuid,
        cost_type text,
        cost_value integer
    ) RETURNS SETOF risksmart.consequence AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

RETURN QUERY
INSERT INTO risksmart.consequence (
        "Title",
        "Description",
        "Criticality",
        "ParentIssueId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "CostType",
        "CostValue"
    )
VALUES (
        title,
        description,
        criticality,
        parent_issue_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        cost_type,
        cost_value
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_consequence(
        id uuid,
        title text,
        description text,
        criticality integer,
        cost_type text,
        cost_value integer,
        parent_issue_id uuid,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.consequence AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

RETURN QUERY
UPDATE risksmart.consequence
SET "Title" = title,
    "Description" = description,
    "Criticality" = criticality,
    "CostType" = cost_type,
    "CostValue" = cost_value,
    "ParentIssueId" = parent_issue_id,
    "ModifiedByUser" = risksmart.get_hasura_user_id(),
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Id" = id
    AND "OrgKey" = risksmart.get_hasura_org_id()
    AND "ModifiedAtTimestamp" = original_timestamp
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

DROP VIEW risksmart.consequence_view_active;

-- remove row status
ALTER TABLE risksmart.consequence_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.consequence DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.control_group_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "Owner" text NOT NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.control_group
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.control_group
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.control_group
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.control_group_audit (
        "Id",
        "Title",
        "Description",
        "Owner",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Description",
    tt."Owner",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.control_group tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.control_group c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.control_group;

CREATE UNIQUE INDEX ix_control_group_orgkey_title ON risksmart.control_group("OrgKey", "Title");

ALTER TABLE risksmart.control_group DROP CONSTRAINT "ControlGroup_pkey";

ALTER TABLE risksmart.control_group
ADD PRIMARY KEY ("Id");

-- Populate table with latest record
INSERT INTO risksmart.control_group (
        "Id",
        "Title",
        "Description",
        "Owner",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Description",
    c."Owner",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.control_group_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.control_group_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.control_group_modified() RETURNS trigger AS $body$
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

insert into risksmart.control_group_audit(
        "Id",
        "Title",
        "Description",
        "Owner",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Description",
        nr."Owner",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER control_group_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.control_group FOR EACH ROW EXECUTE FUNCTION risksmart.control_group_modified();

CREATE OR REPLACE FUNCTION risksmart.delete_control_group(id uuid, original_timestamp timestamp) RETURNS SETOF risksmart.control_group AS $$ BEGIN return query
DELETE FROM risksmart.control_group
WHERE "ModifiedAtTimestamp" = original_timestamp
    AND "Id" = id
    AND "OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

-- unset GroupId on child controls
INSERT INTO risksmart.control (
        "Id",
        "Title",
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "GroupId",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT tr."Id",
    tr."Title",
    tr."Owner",
    tr."Description",
    tr."Type",
    tr."ParentRiskId",
    null,
    risksmart.get_hasura_user_id(),
    tr."OrgKey",
    tr."RowStatus",
    tr."Meta"
FROM risksmart.control_view_active tr
WHERE tr."GroupId" = id
    AND tr."OrgKey" = risksmart.get_hasura_org_id();

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_control_group(title text, owner text, description text) RETURNS SETOF risksmart.control_group AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.user_view_active c
        WHERE c."OrgKey" = risksmart.get_hasura_org_id()
            AND c."Id" = owner
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Owner not found';

END IF;

IF EXISTS (
    SELECT 1
    FROM risksmart.control_group c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Title" = title
    LIMIT 1
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'You have another control group with this title. Please enter a unique value.';

END IF;

return query
INSERT INTO risksmart.control_group (
        "Title",
        "Owner",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "Description"
    )
VALUES(
        title,
        owner,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        description
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_control_group(
        id uuid,
        title text,
        owner text,
        original_timestamp timestamp,
        description text
    ) RETURNS SETOF risksmart.control_group AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.user_view_active c
        WHERE c."OrgKey" = risksmart.get_hasura_org_id()
            AND c."Id" = owner
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Owner not found';

END IF;

IF EXISTS (
    SELECT 1
    FROM risksmart.control_group c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Title" = title
        AND c."Id" <> id
    LIMIT 1
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'You have another control group with this title. Please enter a unique value.';

END IF;

return query
UPDATE risksmart.control_group
SET "Title" = title,
    "Owner" = owner,
    "ModifiedByUser" = risksmart.get_hasura_user_id(),
    "ModifiedAtTimestamp" = statement_timestamp(),
    "Description" = description
WHERE "OrgKey" = risksmart.get_hasura_org_id()
    AND "Id" = id
    AND "ModifiedAtTimestamp" = original_timestamp
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

DROP VIEW risksmart.control_group_view_active_flat;

DROP VIEW risksmart.control_group_view_active;

-- remove row status
ALTER TABLE risksmart.control_group_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.control_group DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.action_update_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NULL,
    "ParentActionId" uuid NOT NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.action_update
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.action_update
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.action_update
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.action_update_audit (
        "Id",
        "Title",
        "Description",
        "ParentActionId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Description",
    tt."ParentActionId",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.action_update tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.action_update c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.action_update;

ALTER TABLE risksmart.action_update DROP CONSTRAINT "ActionUpdate_pkey";

ALTER TABLE risksmart.action_update
ADD PRIMARY KEY ("Id");

ALTER TABLE risksmart.action_update
alter column "Id"
set default gen_random_uuid();

-- Populate table with latest record
INSERT INTO risksmart.action_update (
        "Id",
        "Title",
        "Description",
        "ParentActionId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Description",
    c."ParentActionId",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.action_update_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.action_update_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.action_update_modified() RETURNS trigger AS $body$
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

insert into risksmart.action_update_audit(
        "Id",
        "Title",
        "Description",
        "ParentActionId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Description",
        nr."ParentActionId",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER action_update_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.action_update FOR EACH ROW EXECUTE FUNCTION risksmart.action_update_modified();

DROP FUNCTION risksmart.delete_action_update;

DROP VIEW risksmart.action_update_view_active_flat;

DROP VIEW risksmart.action_update_view_active;

-- remove row status
ALTER TABLE risksmart.action_update_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.action_update DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.issue_update_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NULL,
    "ParentIssueId" uuid NOT NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.issue_update
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.issue_update
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.issue_update
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.issue_update_audit (
        "Id",
        "Title",
        "Description",
        "ParentIssueId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Description",
    tt."ParentIssueId",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.issue_update tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.issue_update c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.issue_update;

ALTER TABLE risksmart.issue_update DROP CONSTRAINT "IssueUpdate_pkey";

ALTER TABLE risksmart.issue_update
ADD PRIMARY KEY ("Id");

ALTER TABLE risksmart.issue_update
alter column "Id"
set default gen_random_uuid();

-- Populate table with latest record
INSERT INTO risksmart.issue_update (
        "Id",
        "Title",
        "Description",
        "ParentIssueId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Description",
    c."ParentIssueId",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.issue_update_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.issue_update_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.issue_update_modified() RETURNS trigger AS $body$
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

insert into risksmart.issue_update_audit(
        "Id",
        "Title",
        "Description",
        "ParentIssueId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Description",
        nr."ParentIssueId",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER issue_update_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.issue_update FOR EACH ROW EXECUTE FUNCTION risksmart.issue_update_modified();

DROP FUNCTION risksmart.delete_issue_update;

DROP FUNCTION risksmart.update_issue_update;

DROP FUNCTION risksmart.insert_issue_update;

DROP VIEW risksmart.issue_update_view_active_flat;

DROP VIEW risksmart.issue_update_view_active;

-- remove row status
ALTER TABLE risksmart.issue_update_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.issue_update DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.test_result_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NULL,
    "Submitter" text NOT NULL,
    "ParentControlId" uuid NOT NULL,
    "TestType" text,
    "DesignEffectiveness" integer,
    "PerformanceEffectiveness" integer,
    "OverallEffectiveness" integer NOT NULL,
    "TestDate" timestamp with time zone NOT NULL,
    "NextTestDate" timestamp with time zone,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.test_result
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.test_result
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.test_result
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.test_result_audit (
        "Id",
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
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Description",
    tt."Submitter",
    tt."ParentControlId",
    tt."TestType",
    tt."DesignEffectiveness",
    tt."PerformanceEffectiveness",
    tt."OverallEffectiveness",
    tt."TestDate",
    tt."NextTestDate",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.test_result tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.test_result c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.test_result;

ALTER TABLE risksmart.test_result DROP CONSTRAINT "Test_Result_pkey";

ALTER TABLE risksmart.test_result
ADD PRIMARY KEY ("Id");

ALTER TABLE risksmart.test_result
alter column "Id"
set default gen_random_uuid();

-- Populate table with latest record
INSERT INTO risksmart.test_result (
        "Id",
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
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Description",
    c."Submitter",
    c."ParentControlId",
    c."TestType",
    c."DesignEffectiveness",
    c."PerformanceEffectiveness",
    c."OverallEffectiveness",
    c."TestDate",
    c."NextTestDate",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.test_result_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.test_result_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.test_result_modified() RETURNS trigger AS $body$
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

insert into risksmart.test_result_audit(
        "Id",
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
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER test_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.test_result FOR EACH ROW EXECUTE FUNCTION risksmart.test_result_modified();

DROP FUNCTION risksmart.delete_test_result;

DROP VIEW risksmart.test_result_view_active_flat;

CREATE OR REPLACE VIEW "risksmart"."control_view_active_flat" AS WITH ltr AS (
        SELECT distinct on (tr."ParentControlId") tr."ParentControlId",
            tr."OverallEffectiveness",
            tr."OrgKey"
        from risksmart.test_result tr
        order by tr."ParentControlId",
            tr."TestDate" desc
    ),
    oa as (
        SELECT ca."ControlId",
            ca."OrgKey",
            count(*) AS "OpenActions"
        FROM risksmart.control_action_view_active ca
            INNER JOIN risksmart.action_view_active a ON a."Id" = ca."ActionId"
            AND a."OrgKey" = ca."OrgKey"
        WHERE a."Status" = 'open'
        GROUP BY ca."ControlId",
            ca."OrgKey"
    ),
    oi as (
        SELECT i."AssociatedControlId" as "ControlId",
            i."OrgKey",
            count(*) AS "OpenIssues"
        FROM risksmart.issue_assessment_view_active i
        WHERE i."Status" = 'open'
        GROUP BY i."AssociatedControlId",
            i."OrgKey"
    )
SELECT c."Id",
    c."Timestamp",
    "min"."FirstTimestamp" as "CreatedTimestamp",
    c."User",
    uva_user."UserName",
    c."Title",
    c."Owner",
    uva_owner."UserName" as "OwnerName",
    c."Description",
    c."Type",
    c."ParentRiskId",
    rva."Title" as "ParentTitle",
    c."OrgKey",
    c."RowStatus",
    c."Meta",
    ltr."OverallEffectiveness",
    CAST(COALESCE(oi."OpenIssues", 0) AS integer) as "OpenIssues",
    CAST(COALESCE(oa."OpenActions", 0) AS integer) as "OpenActions",
    c."GroupId"
FROM risksmart.control_view_active c
    LEFT OUTER JOIN risksmart.user_view_active uva_user on c."User" = uva_user."Id"
    AND c."OrgKey" = uva_user."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active uva_owner on c."Owner" = uva_owner."Id"
    AND c."OrgKey" = uva_owner."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active rva on c."ParentRiskId" = rva."Id"
    AND c."OrgKey" = rva."OrgKey"
    LEFT JOIN oa ON oa."ControlId" = c."Id"
    AND oa."OrgKey" = c."OrgKey"
    LEFT JOIN oi ON oi."ControlId" = c."Id"
    AND oi."OrgKey" = c."OrgKey"
    INNER JOIN (
        SELECT fc."Id",
            fc."OrgKey",
            MIN(fc."Timestamp") as "FirstTimestamp"
        FROM risksmart."control" fc
        GROUP BY fc."Id",
            fc."OrgKey"
    ) min ON c."Id" = min."Id"
    AND c."OrgKey" = min."OrgKey"
    LEFT OUTER JOIN ltr ON ltr."ParentControlId" = c."Id"
    AND ltr."OrgKey" = c."OrgKey";

DROP VIEW risksmart.test_result_view_active;

-- remove row status
ALTER TABLE risksmart.test_result_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.test_result DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.acceptance_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "DateAcceptedFrom" timestamp with time zone NOT NULL,
    "DateAcceptedTo" timestamp with time zone NOT NULL,
    "Details" text NOT NULL,
    "ParentRiskId" uuid NOT NULL,
    "Status" text NOT NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.acceptance
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.acceptance
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.acceptance
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.acceptance_audit (
        "Id",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "Details",
        "ParentRiskId",
        "Status",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."DateAcceptedFrom",
    tt."DateAcceptedTo",
    tt."Details",
    tt."ParentRiskId",
    tt."Status",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.acceptance tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.acceptance c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.acceptance;

ALTER TABLE risksmart.acceptance DROP CONSTRAINT "Acceptance_pkey";

ALTER TABLE risksmart.acceptance
ADD PRIMARY KEY ("Id");

ALTER TABLE risksmart.acceptance
alter column "Id"
set default gen_random_uuid();

-- Populate table with latest record
INSERT INTO risksmart.acceptance (
        "Id",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "Details",
        "ParentRiskId",
        "Status",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."DateAcceptedFrom",
    c."DateAcceptedTo",
    c."Details",
    c."ParentRiskId",
    c."Status",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.acceptance_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.acceptance_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.acceptance_modified() RETURNS trigger AS $body$
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

insert into risksmart.acceptance_audit(
        "Id",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "Details",
        "ParentRiskId",
        "Status",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."DateAcceptedFrom",
        nr."DateAcceptedTo",
        nr."Details",
        nr."ParentRiskId",
        nr."Status",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER acceptance_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.acceptance FOR EACH ROW EXECUTE FUNCTION risksmart.acceptance_modified();

DROP FUNCTION risksmart.delete_acceptance;

DROP VIEW risksmart.acceptance_view_active_flat;

;

DROP VIEW risksmart.acceptance_view_active;

-- remove row status
ALTER TABLE risksmart.acceptance_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.acceptance DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.appetite_audit (
    "Id" uuid NOT NULL,
    "LowerAppetite" integer NOT NULL,
    "UpperAppetite" integer NOT NULL,
    "Statement" text NOT NULL,
    "ParentRiskId" uuid NOT NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.appetite
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.appetite
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.appetite
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.appetite_audit (
        "Id",
        "LowerAppetite",
        "UpperAppetite",
        "Statement",
        "ParentRiskId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."LowerAppetite",
    tt."UpperAppetite",
    tt."Statement",
    tt."ParentRiskId",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.appetite tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.appetite c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.appetite;

ALTER TABLE risksmart.appetite DROP CONSTRAINT "Appetite_pkey";

ALTER TABLE risksmart.appetite
ADD PRIMARY KEY ("Id");

ALTER TABLE risksmart.appetite
alter column "Id"
set default gen_random_uuid();

-- Populate table with latest record
INSERT INTO risksmart.appetite (
        "Id",
        "LowerAppetite",
        "UpperAppetite",
        "Statement",
        "ParentRiskId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."LowerAppetite",
    c."UpperAppetite",
    c."Statement",
    c."ParentRiskId",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.appetite_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.appetite_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.appetite_modified() RETURNS trigger AS $body$
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

insert into risksmart.appetite_audit(
        "Id",
        "LowerAppetite",
        "UpperAppetite",
        "Statement",
        "ParentRiskId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."LowerAppetite",
        nr."UpperAppetite",
        nr."Statement",
        nr."ParentRiskId",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER appetite_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.appetite FOR EACH ROW EXECUTE FUNCTION risksmart.appetite_modified();

DROP FUNCTION risksmart.delete_appetite;

DROP VIEW risksmart.appetite_view_active_flat;

DROP VIEW risksmart.appetite_view_active;

-- remove row status
ALTER TABLE risksmart.appetite_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.appetite DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.action_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Owner" text,
    "DateRaised" timestamp with time zone NOT NULL,
    "DateDue" timestamp with time zone NOT NULL,
    "Status" text NOT NULL,
    "Priority" integer NOT NULL,
    "Description" text NOT NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.action
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.action
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.action
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.action_audit (
        "Id",
        "Title",
        "Owner",
        "DateRaised",
        "DateDue",
        "Status",
        "Priority",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Owner",
    tt."DateRaised",
    tt."DateDue",
    tt."Status",
    tt."Priority",
    tt."Description",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.action tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.action c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.action;

ALTER TABLE risksmart.action DROP CONSTRAINT "Action_pkey";

ALTER TABLE risksmart.action
ADD PRIMARY KEY ("Id");

ALTER TABLE risksmart.action
alter column "Id"
set default gen_random_uuid();

-- Populate table with latest record
INSERT INTO risksmart.action (
        "Id",
        "Title",
        "Owner",
        "DateRaised",
        "DateDue",
        "Status",
        "Priority",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Owner",
    c."DateRaised",
    c."DateDue",
    c."Status",
    c."Priority",
    c."Description",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.action_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.action_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.action_modified() RETURNS trigger AS $body$
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

insert into risksmart.action_audit(
        "Id",
        "Title",
        "Owner",
        "DateRaised",
        "DateDue",
        "Status",
        "Priority",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Owner",
        nr."DateRaised",
        nr."DateDue",
        nr."Status",
        nr."Priority",
        nr."Description",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER action_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.action FOR EACH ROW EXECUTE FUNCTION risksmart.action_modified();

DROP FUNCTION risksmart.delete_action;

CREATE OR REPLACE VIEW risksmart.control_view_active_flat AS WITH ltr AS (
        SELECT DISTINCT ON (tr."ParentControlId") tr."ParentControlId",
            tr."OverallEffectiveness",
            tr."OrgKey"
        FROM risksmart.test_result tr
        ORDER BY tr."ParentControlId",
            tr."TestDate" DESC
    ),
    oa AS (
        SELECT ca."ControlId",
            ca."OrgKey",
            count(*) AS "OpenActions"
        FROM risksmart.control_action_view_active ca
            JOIN risksmart.action a ON a."Id" = ca."ActionId"
            AND a."OrgKey" = ca."OrgKey"
        WHERE a."Status" = 'open'::text
        GROUP BY ca."ControlId",
            ca."OrgKey"
    ),
    oi AS (
        SELECT i."AssociatedControlId" AS "ControlId",
            i."OrgKey",
            count(*) AS "OpenIssues"
        FROM risksmart.issue_assessment_view_active i
        WHERE i."Status" = 'open'::text
        GROUP BY i."AssociatedControlId",
            i."OrgKey"
    )
SELECT c."Id",
    c."Timestamp",
    min."FirstTimestamp" AS "CreatedTimestamp",
    c."User",
    uva_user."UserName",
    c."Title",
    c."Owner",
    uva_owner."UserName" AS "OwnerName",
    c."Description",
    c."Type",
    c."ParentRiskId",
    rva."Title" AS "ParentTitle",
    c."OrgKey",
    c."RowStatus",
    c."Meta",
    ltr."OverallEffectiveness",
    COALESCE(oi."OpenIssues", 0::bigint)::integer AS "OpenIssues",
    COALESCE(oa."OpenActions", 0::bigint)::integer AS "OpenActions",
    c."GroupId"
FROM risksmart.control_view_active c
    LEFT JOIN risksmart.user_view_active uva_user ON c."User" = uva_user."Id"
    AND c."OrgKey" = uva_user."OrgKey"
    LEFT JOIN risksmart.user_view_active uva_owner ON c."Owner" = uva_owner."Id"
    AND c."OrgKey" = uva_owner."OrgKey"
    LEFT JOIN risksmart.risk_view_active rva ON c."ParentRiskId" = rva."Id"
    AND c."OrgKey" = rva."OrgKey"
    LEFT JOIN oa ON oa."ControlId" = c."Id"
    AND oa."OrgKey" = c."OrgKey"
    LEFT JOIN oi ON oi."ControlId" = c."Id"
    AND oi."OrgKey" = c."OrgKey"
    JOIN (
        SELECT fc."Id",
            fc."OrgKey",
            min(fc."Timestamp") AS "FirstTimestamp"
        FROM risksmart.control fc
        GROUP BY fc."Id",
            fc."OrgKey"
    ) min ON c."Id" = min."Id"
    AND c."OrgKey" = min."OrgKey"
    LEFT JOIN ltr ON ltr."ParentControlId" = c."Id"
    AND ltr."OrgKey" = c."OrgKey";

DROP VIEW risksmart.action_view_active_flat;

DROP VIEW risksmart.action_view_active;

-- remove row status
ALTER TABLE risksmart.action_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.action DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.control_action_audit (
    "ControlId" uuid NOT NULL,
    "ActionId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ControlId", "ActionId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.control_action
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.control_action
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.control_action
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.control_action_audit (
        "ControlId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."ControlId",
    tt."ActionId",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.control_action tt
    INNER JOIN (
        SELECT distinct on (c."ControlId", c."ActionId") c."ControlId",
            c."ActionId",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.control_action c
        ORDER BY c."ControlId",
            c."ActionId",
            c."ModifiedAtTimestamp"
    ) As created ON created."ControlId" = tt."ControlId"
    AND created."ActionId" = tt."ActionId";

truncate table risksmart.control_action;

ALTER TABLE risksmart.control_action DROP CONSTRAINT "control_action_pkey";

ALTER TABLE risksmart.control_action
ADD PRIMARY KEY ("ControlId", "ActionId");

-- Populate table with latest record
INSERT INTO risksmart.control_action (
        "ControlId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."ControlId",
    c."ActionId",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.control_action_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.control_action_audit cc
                WHERE (
                        cc."ControlId" = c."ControlId"
                        AND cc."ActionId" = c."ActionId"
                    )
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.control_action_modified() RETURNS trigger AS $body$
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

insert into risksmart.control_action_audit(
        "ControlId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ControlId",
        nr."ActionId",
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

CREATE TRIGGER control_action_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.control_action FOR EACH ROW EXECUTE FUNCTION risksmart.control_action_modified();

CREATE OR REPLACE VIEW risksmart.control_view_active_flat AS WITH ltr AS (
        SELECT DISTINCT ON (tr."ParentControlId") tr."ParentControlId",
            tr."OverallEffectiveness",
            tr."OrgKey"
        FROM risksmart.test_result tr
        ORDER BY tr."ParentControlId",
            tr."TestDate" DESC
    ),
    oa AS (
        SELECT ca."ControlId",
            ca."OrgKey",
            count(*) AS "OpenActions"
        FROM risksmart.control_action ca
            JOIN risksmart.action a ON a."Id" = ca."ActionId"
            AND a."OrgKey" = ca."OrgKey"
        WHERE a."Status" = 'open'::text
        GROUP BY ca."ControlId",
            ca."OrgKey"
    ),
    oi AS (
        SELECT i."AssociatedControlId" AS "ControlId",
            i."OrgKey",
            count(*) AS "OpenIssues"
        FROM risksmart.issue_assessment_view_active i
        WHERE i."Status" = 'open'::text
        GROUP BY i."AssociatedControlId",
            i."OrgKey"
    )
SELECT c."Id",
    c."Timestamp",
    min."FirstTimestamp" AS "CreatedTimestamp",
    c."User",
    uva_user."UserName",
    c."Title",
    c."Owner",
    uva_owner."UserName" AS "OwnerName",
    c."Description",
    c."Type",
    c."ParentRiskId",
    rva."Title" AS "ParentTitle",
    c."OrgKey",
    c."RowStatus",
    c."Meta",
    ltr."OverallEffectiveness",
    COALESCE(oi."OpenIssues", 0::bigint)::integer AS "OpenIssues",
    COALESCE(oa."OpenActions", 0::bigint)::integer AS "OpenActions",
    c."GroupId"
FROM risksmart.control_view_active c
    LEFT JOIN risksmart.user_view_active uva_user ON c."User" = uva_user."Id"
    AND c."OrgKey" = uva_user."OrgKey"
    LEFT JOIN risksmart.user_view_active uva_owner ON c."Owner" = uva_owner."Id"
    AND c."OrgKey" = uva_owner."OrgKey"
    LEFT JOIN risksmart.risk_view_active rva ON c."ParentRiskId" = rva."Id"
    AND c."OrgKey" = rva."OrgKey"
    LEFT JOIN oa ON oa."ControlId" = c."Id"
    AND oa."OrgKey" = c."OrgKey"
    LEFT JOIN oi ON oi."ControlId" = c."Id"
    AND oi."OrgKey" = c."OrgKey"
    JOIN (
        SELECT fc."Id",
            fc."OrgKey",
            min(fc."Timestamp") AS "FirstTimestamp"
        FROM risksmart.control fc
        GROUP BY fc."Id",
            fc."OrgKey"
    ) min ON c."Id" = min."Id"
    AND c."OrgKey" = min."OrgKey"
    LEFT JOIN ltr ON ltr."ParentControlId" = c."Id"
    AND ltr."OrgKey" = c."OrgKey";

DROP VIEW risksmart.control_action_view_active;

-- remove row status
ALTER TABLE risksmart.control_action_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.control_action DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.risk_action_audit (
    "RiskId" uuid NOT NULL,
    "ActionId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("RiskId", "ActionId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.risk_action
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.risk_action
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.risk_action
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.risk_action_audit (
        "RiskId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."RiskId",
    tt."ActionId",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.risk_action tt
    INNER JOIN (
        SELECT distinct on (c."RiskId", c."ActionId") c."RiskId",
            c."ActionId",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.risk_action c
        ORDER BY c."RiskId",
            c."ActionId",
            c."ModifiedAtTimestamp"
    ) As created ON created."RiskId" = tt."RiskId"
    AND created."ActionId" = tt."ActionId";

truncate table risksmart.risk_action;

ALTER TABLE risksmart.risk_action DROP CONSTRAINT "risk_action_pkey";

ALTER TABLE risksmart.risk_action
ADD PRIMARY KEY ("RiskId", "ActionId");

-- Populate table with latest record
INSERT INTO risksmart.risk_action (
        "RiskId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."RiskId",
    c."ActionId",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.risk_action_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.risk_action_audit cc
                WHERE (
                        cc."RiskId" = c."RiskId"
                        AND cc."ActionId" = c."ActionId"
                    )
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.risk_action_modified() RETURNS trigger AS $body$
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

insert into risksmart.risk_action_audit(
        "RiskId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."RiskId",
        nr."ActionId",
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

CREATE TRIGGER risk_action_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.risk_action FOR EACH ROW EXECUTE FUNCTION risksmart.risk_action_modified();

DROP VIEW risksmart.risk_action_view_active;

-- remove row status
ALTER TABLE risksmart.risk_action_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.risk_action DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.issue_action_audit (
    "IssueId" uuid NOT NULL,
    "ActionId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("IssueId", "ActionId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.issue_action
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.issue_action
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.issue_action
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.issue_action_audit (
        "IssueId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."IssueId",
    tt."ActionId",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.issue_action tt
    INNER JOIN (
        SELECT distinct on (c."IssueId", c."ActionId") c."IssueId",
            c."ActionId",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.issue_action c
        ORDER BY c."IssueId",
            c."ActionId",
            c."ModifiedAtTimestamp"
    ) As created ON created."IssueId" = tt."IssueId"
    AND created."ActionId" = tt."ActionId";

truncate table risksmart.issue_action;

ALTER TABLE risksmart.issue_action DROP CONSTRAINT "issue_action_pkey";

ALTER TABLE risksmart.issue_action
ADD PRIMARY KEY ("IssueId", "ActionId");

-- Populate table with latest record
INSERT INTO risksmart.issue_action (
        "IssueId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."IssueId",
    c."ActionId",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.issue_action_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.issue_action_audit cc
                WHERE (
                        cc."IssueId" = c."IssueId"
                        AND cc."ActionId" = c."ActionId"
                    )
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.issue_action_modified() RETURNS trigger AS $body$
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

insert into risksmart.issue_action_audit(
        "IssueId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."IssueId",
        nr."ActionId",
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

CREATE TRIGGER issue_action_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.issue_action FOR EACH ROW EXECUTE FUNCTION risksmart.issue_action_modified();

CREATE OR REPLACE VIEW risksmart.issue_view_active_flat AS (
        WITH oa AS (
            SELECT ia."IssueId",
                ia."OrgKey",
                count(*) AS "OpenActions"
            FROM risksmart.issue_action ia
                INNER JOIN risksmart.action a ON a."Id" = ia."ActionId"
                AND a."OrgKey" = ia."OrgKey"
            WHERE a."Status" = 'open'
            GROUP BY ia."IssueId",
                ia."OrgKey"
        ),
        ci AS (
            SELECT i."Id",
                i."OrgKey",
                min(i."Timestamp") AS "CreatedTimestamp"
            FROM risksmart.issue i
            GROUP BY i."Id",
                i."OrgKey"
        )
        SELECT i."Id",
            i."Title",
            i."Details",
            i."ImpactsCustomer",
            i."IsExternalIssue",
            i."DateOccurred",
            i."DateIdentified",
            i."User",
            i."Timestamp",
            i."OrgKey",
            i."RowStatus",
            i."Meta",
            ia."IssueType",
            ia."Severity",
            ia."TargetCloseDate",
            ia."ActualCloseDate",
            ia."Status",
            ia."Owner",
            ia."CertifiedIndividual",
            ia."RegulatoryBreach",
            ia."RegulationsBreached",
            ia."Reportable",
            ia."Rationale",
            ia."IssueCausedByThirdParty",
            ia."ThirdPartyResponsible",
            ia."IssueCausedBySystemIssue",
            ia."SystemResponsible",
            ia."PolicyBreach",
            ia."PoliciesBreached",
            ia."PolicyOwner",
            ia."PolicyOwnerCommentary",
            ia."AssociatedControlId",
            o."UserName" as "OwnerName",
            u."UserName" as "UserName",
            COALESCE(oa."OpenActions", 0) AS "OpenActions",
            ci."CreatedTimestamp"
        FROM risksmart.issue_view_active i
            LEFT OUTER JOIN risksmart.issue_assessment_view_active ia ON i."Id" = ia."ParentIssueId"
            AND i."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active o on ia."Owner" = o."Id"
            AND o."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active u on i."User" = u."Id"
            AND u."OrgKey" = i."OrgKey"
            LEFT OUTER JOIN oa ON oa."IssueId" = i."Id"
            AND oa."OrgKey" = i."OrgKey"
            LEFT OUTER JOIN ci ON ci."Id" = i."Id"
            AND ci."OrgKey" = i."OrgKey"
    );

DROP VIEW risksmart.issue_action_view_active;

-- remove row status
ALTER TABLE risksmart.issue_action_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.issue_action DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.issue_assessment_audit (
    "ParentIssueId" uuid NOT NULL,
    "IssueType" text,
    "Severity" integer,
    "TargetCloseDate" timestamp with time zone,
    "ActualCloseDate" timestamp with time zone,
    "Status" text,
    "Owner" text,
    "CertifiedIndividual" text,
    "RegulatoryBreach" boolean,
    "RegulationsBreached" text,
    "Reportable" boolean,
    "Rationale" text,
    "IssueCausedByThirdParty" boolean,
    "ThirdPartyResponsible" text,
    "IssueCausedBySystemIssue" boolean,
    "SystemResponsible" text,
    "PolicyBreach" boolean,
    "PoliciesBreached" text,
    "PolicyOwner" text,
    "PolicyOwnerCommentary" text,
    "AssociatedControlId" uuid,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentIssueId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.issue_assessment
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.issue_assessment
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.issue_assessment
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.issue_assessment_audit (
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."ParentIssueId",
    tt."IssueType",
    tt."Severity",
    tt."TargetCloseDate",
    tt."ActualCloseDate",
    tt."Status",
    tt."Owner",
    tt."CertifiedIndividual",
    tt."RegulatoryBreach",
    tt."RegulationsBreached",
    tt."Reportable",
    tt."Rationale",
    tt."IssueCausedByThirdParty",
    tt."ThirdPartyResponsible",
    tt."IssueCausedBySystemIssue",
    tt."SystemResponsible",
    tt."PolicyBreach",
    tt."PoliciesBreached",
    tt."PolicyOwner",
    tt."PolicyOwnerCommentary",
    tt."AssociatedControlId",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.issue_assessment tt
    INNER JOIN (
        SELECT distinct on (c."ParentIssueId") c."ParentIssueId",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.issue_assessment c
        ORDER BY c."ParentIssueId",
            c."ModifiedAtTimestamp"
    ) As created ON created."ParentIssueId" = tt."ParentIssueId";

truncate table risksmart.issue_assessment;

ALTER TABLE risksmart.issue_assessment DROP CONSTRAINT "Issue_assessment_pkey";

ALTER TABLE risksmart.issue_assessment
ADD PRIMARY KEY ("ParentIssueId");

-- Populate table with latest record
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."ParentIssueId",
    c."IssueType",
    c."Severity",
    c."TargetCloseDate",
    c."ActualCloseDate",
    c."Status",
    c."Owner",
    c."CertifiedIndividual",
    c."RegulatoryBreach",
    c."RegulationsBreached",
    c."Reportable",
    c."Rationale",
    c."IssueCausedByThirdParty",
    c."ThirdPartyResponsible",
    c."IssueCausedBySystemIssue",
    c."SystemResponsible",
    c."PolicyBreach",
    c."PoliciesBreached",
    c."PolicyOwner",
    c."PolicyOwnerCommentary",
    c."AssociatedControlId",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.issue_assessment_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.issue_assessment_audit cc
                WHERE (cc."ParentIssueId" = c."ParentIssueId")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
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
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentIssueId",
        nr."IssueType",
        nr."Severity",
        nr."TargetCloseDate",
        nr."ActualCloseDate",
        nr."Status",
        nr."Owner",
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
        nr."AssociatedControlId",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER issue_assessment_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.issue_assessment FOR EACH ROW EXECUTE FUNCTION risksmart.issue_assessment_modified();

CREATE OR REPLACE VIEW risksmart.control_view_active_flat AS WITH ltr AS (
        SELECT DISTINCT ON (tr."ParentControlId") tr."ParentControlId",
            tr."OverallEffectiveness",
            tr."OrgKey"
        FROM risksmart.test_result tr
        ORDER BY tr."ParentControlId",
            tr."TestDate" DESC
    ),
    oa AS (
        SELECT ca."ControlId",
            ca."OrgKey",
            count(*) AS "OpenActions"
        FROM risksmart.control_action ca
            JOIN risksmart.action a ON a."Id" = ca."ActionId"
            AND a."OrgKey" = ca."OrgKey"
        WHERE a."Status" = 'open'::text
        GROUP BY ca."ControlId",
            ca."OrgKey"
    ),
    oi AS (
        SELECT i."AssociatedControlId" AS "ControlId",
            i."OrgKey",
            count(*) AS "OpenIssues"
        FROM risksmart.issue_assessment i
        WHERE i."Status" = 'open'::text
        GROUP BY i."AssociatedControlId",
            i."OrgKey"
    )
SELECT c."Id",
    c."Timestamp",
    min."FirstTimestamp" AS "CreatedTimestamp",
    c."User",
    uva_user."UserName",
    c."Title",
    c."Owner",
    uva_owner."UserName" AS "OwnerName",
    c."Description",
    c."Type",
    c."ParentRiskId",
    rva."Title" AS "ParentTitle",
    c."OrgKey",
    c."RowStatus",
    c."Meta",
    ltr."OverallEffectiveness",
    COALESCE(oi."OpenIssues", 0::bigint)::integer AS "OpenIssues",
    COALESCE(oa."OpenActions", 0::bigint)::integer AS "OpenActions",
    c."GroupId"
FROM risksmart.control_view_active c
    LEFT JOIN risksmart.user_view_active uva_user ON c."User" = uva_user."Id"
    AND c."OrgKey" = uva_user."OrgKey"
    LEFT JOIN risksmart.user_view_active uva_owner ON c."Owner" = uva_owner."Id"
    AND c."OrgKey" = uva_owner."OrgKey"
    LEFT JOIN risksmart.risk_view_active rva ON c."ParentRiskId" = rva."Id"
    AND c."OrgKey" = rva."OrgKey"
    LEFT JOIN oa ON oa."ControlId" = c."Id"
    AND oa."OrgKey" = c."OrgKey"
    LEFT JOIN oi ON oi."ControlId" = c."Id"
    AND oi."OrgKey" = c."OrgKey"
    JOIN (
        SELECT fc."Id",
            fc."OrgKey",
            min(fc."Timestamp") AS "FirstTimestamp"
        FROM risksmart.control fc
        GROUP BY fc."Id",
            fc."OrgKey"
    ) min ON c."Id" = min."Id"
    AND c."OrgKey" = min."OrgKey"
    LEFT JOIN ltr ON ltr."ParentControlId" = c."Id"
    AND ltr."OrgKey" = c."OrgKey";

CREATE OR REPLACE FUNCTION risksmart.delete_issue(
        id uuid,
        original_timestamp timestamp without time zone
    ) RETURNS SETOF risksmart.issue LANGUAGE 'plpgsql' COST 100 VOLATILE PARALLEL UNSAFE ROWS 1000 AS $BODY$ BEGIN return query
INSERT INTO risksmart.issue (
        "Id",
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "User",
        "OrgKey",
        "RowStatus",
        "Meta"
    )
SELECT i."Id",
    i."Title",
    i."Details",
    i."ImpactsCustomer",
    i."IsExternalIssue",
    i."DateOccurred",
    i."DateIdentified",
    risksmart.get_hasura_user_id(),
    i."OrgKey",
    'deleted',
    i."Meta"
FROM risksmart.issue_view_active i
WHERE i."Timestamp" = original_timestamp
    AND i."Id" = id
    AND i."OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

DELETE FROM risksmart.issue_assessment
WHERE "ParentIssueId" = id
    AND "OrgKey" = risksmart.get_hasura_org_id();

END $BODY$;

CREATE OR REPLACE FUNCTION risksmart.insert_issue(
        title text,
        details text,
        impacts_customer boolean,
        is_external_issue boolean,
        date_occurred timestamp with time zone,
        date_identified timestamp with time zone,
        tag_type_ids uuid [],
        department_type_ids uuid [],
        associated_control_id uuid
    ) RETURNS SETOF risksmart.issue LANGUAGE 'plpgsql' COST 100 VOLATILE PARALLEL UNSAFE ROWS 1000 AS $BODY$
DECLARE inserted_issue_id uuid;

BEGIN IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active i
    WHERE i."OrgKey" = risksmart.get_hasura_org_id()
        AND i."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

INSERT INTO risksmart.issue (
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "User",
        "OrgKey",
        "RowStatus"
    )
VALUES (
        title,
        details,
        impacts_customer,
        is_external_issue,
        date_occurred,
        date_identified,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        'active'
    )
RETURNING "Id" into inserted_issue_id;

PERFORM risksmart.update_tags(
    parent_id => inserted_issue_id,
    tag_type_ids => tag_type_ids
);

PERFORM risksmart.update_departments(
    parent_id => inserted_issue_id,
    department_type_ids => department_type_ids
);

IF associated_control_id IS NOT NULL THEN
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "AssociatedControlId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
VALUES (
        inserted_issue_id,
        associated_control_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id()
    );

END IF;

RETURN QUERY
SELECT *
FROM risksmart.issue i
WHERE i."OrgKey" = risksmart.get_hasura_org_id()
    AND i."Id" = inserted_issue_id
ORDER BY i."Timestamp" desc
LIMIT 1;

END $BODY$;

CREATE OR REPLACE FUNCTION risksmart.insert_issue_assessment(
        parent_issue_id uuid,
        issue_type text,
        severity integer,
        target_close_date timestamp with time zone,
        actual_close_date timestamp with time zone,
        status text,
        owner text,
        certified_individual text,
        regulatory_breach boolean,
        regulations_breached text,
        reportable boolean,
        rationale text,
        issue_caused_by_third_party boolean,
        third_party_responsible text,
        issue_caused_by_system_issue boolean,
        system_responsible text,
        policy_breach boolean,
        policies_breached text,
        policy_owner text,
        policy_owner_commentary text,
        associated_control_id uuid
    ) RETURNS SETOF risksmart.issue_assessment AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

IF owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Owner not found';

END IF;

END IF;

IF policy_owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = policy_owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Policy owner not found';

END IF;

END IF;

IF certified_individual IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = certified_individual
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Certified individual not found';

END IF;

END IF;

return query
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
VALUES (
        parent_issue_id,
        issue_type,
        severity,
        target_close_date,
        actual_close_date,
        status,
        owner,
        certified_individual,
        regulatory_breach,
        regulations_breached,
        reportable,
        rationale,
        issue_caused_by_third_party,
        third_party_responsible,
        issue_caused_by_system_issue,
        system_responsible,
        policy_breach,
        policies_breached,
        policy_owner,
        policy_owner_commentary,
        associated_control_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id()
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_issue_assessment(
        parent_issue_id uuid,
        issue_type text,
        severity integer,
        target_close_date timestamp with time zone,
        actual_close_date timestamp with time zone,
        status text,
        owner text,
        certified_individual text,
        regulatory_breach boolean,
        regulations_breached text,
        reportable boolean,
        rationale text,
        issue_caused_by_third_party boolean,
        third_party_responsible text,
        issue_caused_by_system_issue boolean,
        system_responsible text,
        policy_breach boolean,
        policies_breached text,
        policy_owner text,
        policy_owner_commentary text,
        associated_control_id uuid,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.issue_assessment AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue_view_active i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

IF owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Owner not found';

END IF;

END IF;

IF policy_owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = policy_owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Policy owner not found';

END IF;

END IF;

IF certified_individual IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = certified_individual
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Certified individual not found';

END IF;

END IF;

return query
UPDATE risksmart.issue_assessment
SET "IssueType" = issue_type,
    "Severity" = severity,
    "TargetCloseDate" = target_close_date,
    "ActualCloseDate" = actual_close_date,
    "Status" = status,
    "Owner" = owner,
    "CertifiedIndividual" = certified_individual,
    "RegulatoryBreach" = regulatory_breach,
    "RegulationsBreached" = regulations_breached,
    "Reportable" = reportable,
    "Rationale" = rationale,
    "IssueCausedByThirdParty" = issue_caused_by_third_party,
    "ThirdPartyResponsible" = third_party_responsible,
    "IssueCausedBySystemIssue" = issue_caused_by_system_issue,
    "SystemResponsible" = system_responsible,
    "PolicyBreach" = policy_breach,
    "PoliciesBreached" = policies_breached,
    "PolicyOwner" = policy_owner,
    "PolicyOwnerCommentary" = policy_owner_commentary,
    "AssociatedControlId" = associated_control_id,
    "ModifiedByUser" = risksmart.get_hasura_user_id(),
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "ModifiedAtTimestamp" = original_timestamp
    AND "ParentIssueId" = parent_issue_id
    AND "OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE VIEW risksmart.issue_view_active_flat AS (
        WITH oa AS (
            SELECT ia."IssueId",
                ia."OrgKey",
                count(*) AS "OpenActions"
            FROM risksmart.issue_action ia
                INNER JOIN risksmart.action a ON a."Id" = ia."ActionId"
                AND a."OrgKey" = ia."OrgKey"
            WHERE a."Status" = 'open'
            GROUP BY ia."IssueId",
                ia."OrgKey"
        ),
        ci AS (
            SELECT i."Id",
                i."OrgKey",
                min(i."Timestamp") AS "CreatedTimestamp"
            FROM risksmart.issue i
            GROUP BY i."Id",
                i."OrgKey"
        )
        SELECT i."Id",
            i."Title",
            i."Details",
            i."ImpactsCustomer",
            i."IsExternalIssue",
            i."DateOccurred",
            i."DateIdentified",
            i."User",
            i."Timestamp",
            i."OrgKey",
            i."RowStatus",
            i."Meta",
            ia."IssueType",
            ia."Severity",
            ia."TargetCloseDate",
            ia."ActualCloseDate",
            ia."Status",
            ia."Owner",
            ia."CertifiedIndividual",
            ia."RegulatoryBreach",
            ia."RegulationsBreached",
            ia."Reportable",
            ia."Rationale",
            ia."IssueCausedByThirdParty",
            ia."ThirdPartyResponsible",
            ia."IssueCausedBySystemIssue",
            ia."SystemResponsible",
            ia."PolicyBreach",
            ia."PoliciesBreached",
            ia."PolicyOwner",
            ia."PolicyOwnerCommentary",
            ia."AssociatedControlId",
            o."UserName" as "OwnerName",
            u."UserName" as "UserName",
            COALESCE(oa."OpenActions", 0) AS "OpenActions",
            ci."CreatedTimestamp"
        FROM risksmart.issue_view_active i
            LEFT OUTER JOIN risksmart.issue_assessment ia ON i."Id" = ia."ParentIssueId"
            AND i."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active o on ia."Owner" = o."Id"
            AND o."OrgKey" = ia."OrgKey"
            LEFT OUTER JOIN risksmart.user_view_active u on i."User" = u."Id"
            AND u."OrgKey" = i."OrgKey"
            LEFT OUTER JOIN oa ON oa."IssueId" = i."Id"
            AND oa."OrgKey" = i."OrgKey"
            LEFT OUTER JOIN ci ON ci."Id" = i."Id"
            AND ci."OrgKey" = i."OrgKey"
    );

DROP VIEW risksmart.issue_assessment_view_active;

-- remove row status
ALTER TABLE risksmart.issue_assessment_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.issue_assessment DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.issue_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Details" text NOT NULL,
    "ImpactsCustomer" boolean NOT NULL,
    "IsExternalIssue" boolean NOT NULL,
    "DateOccurred" timestamp with time zone NOT NULL,
    "DateIdentified" timestamp with time zone NOT NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.issue
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.issue
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.issue
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.issue_audit (
        "Id",
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
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Details",
    tt."ImpactsCustomer",
    tt."IsExternalIssue",
    tt."DateOccurred",
    tt."DateIdentified",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.issue tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.issue c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.issue;

ALTER TABLE risksmart.issue DROP CONSTRAINT "Issue_pkey";

ALTER TABLE risksmart.issue
ADD PRIMARY KEY ("Id");

ALTER TABLE risksmart.issue
alter column "Id"
set default gen_random_uuid();

-- Populate table with latest record
INSERT INTO risksmart.issue (
        "Id",
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
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Details",
    c."ImpactsCustomer",
    c."IsExternalIssue",
    c."DateOccurred",
    c."DateIdentified",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.issue_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.issue_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
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
        "Action"
    )
values (
        nr."Id",
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
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER issue_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.issue FOR EACH ROW EXECUTE FUNCTION risksmart.issue_modified();

CREATE OR REPLACE FUNCTION risksmart.insert_issue(
        title text,
        details text,
        impacts_customer boolean,
        is_external_issue boolean,
        date_occurred timestamp with time zone,
        date_identified timestamp with time zone,
        tag_type_ids uuid [],
        department_type_ids uuid [],
        associated_control_id uuid
    ) RETURNS SETOF risksmart.issue LANGUAGE 'plpgsql' COST 100 VOLATILE PARALLEL UNSAFE ROWS 1000 AS $BODY$
DECLARE inserted_issue_id uuid;

BEGIN IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active i
    WHERE i."OrgKey" = risksmart.get_hasura_org_id()
        AND i."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

INSERT INTO risksmart.issue (
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
VALUES (
        title,
        details,
        impacts_customer,
        is_external_issue,
        date_occurred,
        date_identified,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id()
    )
RETURNING "Id" into inserted_issue_id;

PERFORM risksmart.update_tags(
    parent_id => inserted_issue_id,
    tag_type_ids => tag_type_ids
);

PERFORM risksmart.update_departments(
    parent_id => inserted_issue_id,
    department_type_ids => department_type_ids
);

IF associated_control_id IS NOT NULL THEN
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "AssociatedControlId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
VALUES (
        inserted_issue_id,
        associated_control_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id()
    );

END IF;

RETURN QUERY
SELECT *
FROM risksmart.issue i
WHERE i."OrgKey" = risksmart.get_hasura_org_id()
    AND i."Id" = inserted_issue_id
ORDER BY i."ModifiedAtTimestamp" desc
LIMIT 1;

END $BODY$;

CREATE OR REPLACE FUNCTION risksmart.update_issue_assessment(
        parent_issue_id uuid,
        issue_type text,
        severity integer,
        target_close_date timestamp with time zone,
        actual_close_date timestamp with time zone,
        status text,
        owner text,
        certified_individual text,
        regulatory_breach boolean,
        regulations_breached text,
        reportable boolean,
        rationale text,
        issue_caused_by_third_party boolean,
        third_party_responsible text,
        issue_caused_by_system_issue boolean,
        system_responsible text,
        policy_breach boolean,
        policies_breached text,
        policy_owner text,
        policy_owner_commentary text,
        associated_control_id uuid,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.issue_assessment AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

IF owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Owner not found';

END IF;

END IF;

IF policy_owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = policy_owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Policy owner not found';

END IF;

END IF;

IF certified_individual IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = certified_individual
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Certified individual not found';

END IF;

END IF;

return query
UPDATE risksmart.issue_assessment
SET "IssueType" = issue_type,
    "Severity" = severity,
    "TargetCloseDate" = target_close_date,
    "ActualCloseDate" = actual_close_date,
    "Status" = status,
    "Owner" = owner,
    "CertifiedIndividual" = certified_individual,
    "RegulatoryBreach" = regulatory_breach,
    "RegulationsBreached" = regulations_breached,
    "Reportable" = reportable,
    "Rationale" = rationale,
    "IssueCausedByThirdParty" = issue_caused_by_third_party,
    "ThirdPartyResponsible" = third_party_responsible,
    "IssueCausedBySystemIssue" = issue_caused_by_system_issue,
    "SystemResponsible" = system_responsible,
    "PolicyBreach" = policy_breach,
    "PoliciesBreached" = policies_breached,
    "PolicyOwner" = policy_owner,
    "PolicyOwnerCommentary" = policy_owner_commentary,
    "AssociatedControlId" = associated_control_id,
    "ModifiedByUser" = risksmart.get_hasura_user_id(),
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "ModifiedAtTimestamp" = original_timestamp
    AND "ParentIssueId" = parent_issue_id
    AND "OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_issue_assessment(
        parent_issue_id uuid,
        issue_type text,
        severity integer,
        target_close_date timestamp with time zone,
        actual_close_date timestamp with time zone,
        status text,
        owner text,
        certified_individual text,
        regulatory_breach boolean,
        regulations_breached text,
        reportable boolean,
        rationale text,
        issue_caused_by_third_party boolean,
        third_party_responsible text,
        issue_caused_by_system_issue boolean,
        system_responsible text,
        policy_breach boolean,
        policies_breached text,
        policy_owner text,
        policy_owner_commentary text,
        associated_control_id uuid
    ) RETURNS SETOF risksmart.issue_assessment AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

IF owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Owner not found';

END IF;

END IF;

IF policy_owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = policy_owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Policy owner not found';

END IF;

END IF;

IF certified_individual IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = certified_individual
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Certified individual not found';

END IF;

END IF;

return query
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
VALUES (
        parent_issue_id,
        issue_type,
        severity,
        target_close_date,
        actual_close_date,
        status,
        owner,
        certified_individual,
        regulatory_breach,
        regulations_breached,
        reportable,
        rationale,
        issue_caused_by_third_party,
        third_party_responsible,
        issue_caused_by_system_issue,
        system_responsible,
        policy_breach,
        policies_breached,
        policy_owner,
        policy_owner_commentary,
        associated_control_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id()
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_consequence(
        title text,
        description text,
        criticality integer,
        parent_issue_id uuid,
        cost_type text,
        cost_value integer
    ) RETURNS SETOF risksmart.consequence AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

RETURN QUERY
INSERT INTO risksmart.consequence (
        "Title",
        "Description",
        "Criticality",
        "ParentIssueId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "CostType",
        "CostValue"
    )
VALUES (
        title,
        description,
        criticality,
        parent_issue_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id(),
        cost_type,
        cost_value
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.update_consequence(
        id uuid,
        title text,
        description text,
        criticality integer,
        cost_type text,
        cost_value integer,
        parent_issue_id uuid,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.consequence AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

RETURN QUERY
UPDATE risksmart.consequence
SET "Title" = title,
    "Description" = description,
    "Criticality" = criticality,
    "CostType" = cost_type,
    "CostValue" = cost_value,
    "ParentIssueId" = parent_issue_id,
    "ModifiedByUser" = risksmart.get_hasura_user_id(),
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Id" = id
    AND "OrgKey" = risksmart.get_hasura_org_id()
    AND "ModifiedAtTimestamp" = original_timestamp
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

DROP VIEW risksmart.issue_view_active_flat;

DROP VIEW risksmart.issue_view_active;

DROP FUNCTION risksmart.update_issue;

DROP FUNCTION risksmart.delete_issue;

-- remove row status
ALTER TABLE risksmart.issue_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.issue DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.control_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Owner" text NOT NULL,
    "Description" text,
    "Type" text NOT NULL,
    "ParentRiskId" uuid NOT NULL,
    "GroupId" uuid,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.control
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.control
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.control
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.control_audit (
        "Id",
        "Title",
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "GroupId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Owner",
    tt."Description",
    tt."Type",
    tt."ParentRiskId",
    tt."GroupId",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.control tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.control c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.control;

ALTER TABLE risksmart.control DROP CONSTRAINT "Control_pkey";

ALTER TABLE risksmart.control
ADD PRIMARY KEY ("Id");

ALTER TABLE risksmart.control
alter column "Id"
set default gen_random_uuid();

-- Populate table with latest record
INSERT INTO risksmart.control (
        "Id",
        "Title",
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "GroupId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Owner",
    c."Description",
    c."Type",
    c."ParentRiskId",
    c."GroupId",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.control_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.control_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
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
        "Title",
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "GroupId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Owner",
        nr."Description",
        nr."Type",
        nr."ParentRiskId",
        nr."GroupId",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER control_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.control FOR EACH ROW EXECUTE FUNCTION risksmart.control_modified();

DROP FUNCTION risksmart.delete_control;

CREATE OR REPLACE FUNCTION risksmart.update_issue_assessment(
        parent_issue_id uuid,
        issue_type text,
        severity integer,
        target_close_date timestamp with time zone,
        actual_close_date timestamp with time zone,
        status text,
        owner text,
        certified_individual text,
        regulatory_breach boolean,
        regulations_breached text,
        reportable boolean,
        rationale text,
        issue_caused_by_third_party boolean,
        third_party_responsible text,
        issue_caused_by_system_issue boolean,
        system_responsible text,
        policy_breach boolean,
        policies_breached text,
        policy_owner text,
        policy_owner_commentary text,
        associated_control_id uuid,
        original_timestamp timestamp
    ) RETURNS SETOF risksmart.issue_assessment AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

IF owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Owner not found';

END IF;

END IF;

IF policy_owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = policy_owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Policy owner not found';

END IF;

END IF;

IF certified_individual IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = certified_individual
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Certified individual not found';

END IF;

END IF;

return query
UPDATE risksmart.issue_assessment
SET "IssueType" = issue_type,
    "Severity" = severity,
    "TargetCloseDate" = target_close_date,
    "ActualCloseDate" = actual_close_date,
    "Status" = status,
    "Owner" = owner,
    "CertifiedIndividual" = certified_individual,
    "RegulatoryBreach" = regulatory_breach,
    "RegulationsBreached" = regulations_breached,
    "Reportable" = reportable,
    "Rationale" = rationale,
    "IssueCausedByThirdParty" = issue_caused_by_third_party,
    "ThirdPartyResponsible" = third_party_responsible,
    "IssueCausedBySystemIssue" = issue_caused_by_system_issue,
    "SystemResponsible" = system_responsible,
    "PolicyBreach" = policy_breach,
    "PoliciesBreached" = policies_breached,
    "PolicyOwner" = policy_owner,
    "PolicyOwnerCommentary" = policy_owner_commentary,
    "AssociatedControlId" = associated_control_id,
    "ModifiedByUser" = risksmart.get_hasura_user_id(),
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "ModifiedAtTimestamp" = original_timestamp
    AND "ParentIssueId" = parent_issue_id
    AND "OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_issue_assessment(
        parent_issue_id uuid,
        issue_type text,
        severity integer,
        target_close_date timestamp with time zone,
        actual_close_date timestamp with time zone,
        status text,
        owner text,
        certified_individual text,
        regulatory_breach boolean,
        regulations_breached text,
        reportable boolean,
        rationale text,
        issue_caused_by_third_party boolean,
        third_party_responsible text,
        issue_caused_by_system_issue boolean,
        system_responsible text,
        policy_breach boolean,
        policies_breached text,
        policy_owner text,
        policy_owner_commentary text,
        associated_control_id uuid
    ) RETURNS SETOF risksmart.issue_assessment AS $$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.issue i
        WHERE i."OrgKey" = risksmart.get_hasura_org_id()
            AND i."Id" = parent_issue_id
    ) THEN RAISE EXCEPTION USING ERRCODE = '22000',
    MESSAGE = 'Issue not found';

END IF;

IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

IF owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Owner not found';

END IF;

END IF;

IF policy_owner IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = policy_owner
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Policy owner not found';

END IF;

END IF;

IF certified_individual IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.user_view_active c
    WHERE c."OrgKey" = risksmart.get_hasura_org_id()
        AND c."Id" = certified_individual
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Certified individual not found';

END IF;

END IF;

return query
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
VALUES (
        parent_issue_id,
        issue_type,
        severity,
        target_close_date,
        actual_close_date,
        status,
        owner,
        certified_individual,
        regulatory_breach,
        regulations_breached,
        reportable,
        rationale,
        issue_caused_by_third_party,
        third_party_responsible,
        issue_caused_by_system_issue,
        system_responsible,
        policy_breach,
        policies_breached,
        policy_owner,
        policy_owner_commentary,
        associated_control_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id()
    )
RETURNING *;

END $$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION risksmart.insert_issue(
        title text,
        details text,
        impacts_customer boolean,
        is_external_issue boolean,
        date_occurred timestamp with time zone,
        date_identified timestamp with time zone,
        tag_type_ids uuid [],
        department_type_ids uuid [],
        associated_control_id uuid
    ) RETURNS SETOF risksmart.issue LANGUAGE 'plpgsql' COST 100 VOLATILE PARALLEL UNSAFE ROWS 1000 AS $BODY$
DECLARE inserted_issue_id uuid;

BEGIN IF associated_control_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM risksmart.control i
    WHERE i."OrgKey" = risksmart.get_hasura_org_id()
        AND i."Id" = associated_control_id
) THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Control not found';

END IF;

END IF;

INSERT INTO risksmart.issue (
        "Title",
        "Details",
        "ImpactsCustomer",
        "IsExternalIssue",
        "DateOccurred",
        "DateIdentified",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
VALUES (
        title,
        details,
        impacts_customer,
        is_external_issue,
        date_occurred,
        date_identified,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id()
    )
RETURNING "Id" into inserted_issue_id;

PERFORM risksmart.update_tags(
    parent_id => inserted_issue_id,
    tag_type_ids => tag_type_ids
);

PERFORM risksmart.update_departments(
    parent_id => inserted_issue_id,
    department_type_ids => department_type_ids
);

IF associated_control_id IS NOT NULL THEN
INSERT INTO risksmart.issue_assessment (
        "ParentIssueId",
        "AssociatedControlId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
VALUES (
        inserted_issue_id,
        associated_control_id,
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_user_id(),
        risksmart.get_hasura_org_id()
    );

END IF;

RETURN QUERY
SELECT *
FROM risksmart.issue i
WHERE i."OrgKey" = risksmart.get_hasura_org_id()
    AND i."Id" = inserted_issue_id
ORDER BY i."ModifiedAtTimestamp" desc
LIMIT 1;

END $BODY$;

CREATE OR REPLACE VIEW risksmart."risk_view_active_flat" AS WITH rc AS (
        SELECT c."ParentRiskId",
            c."OrgKey",
            count(*) AS "LinkedControlCount"
        FROM risksmart.control c
        GROUP BY c."ParentRiskId",
            c."OrgKey"
    )
SELECT risk."Id",
    risk."Timestamp",
    min."FirstTimestamp" as "CreatedTimestamp",
    risk."User",
    uva_user."UserName",
    risk."Title",
    risk."Owner",
    uva_owner."UserName" as "OwnerName",
    risk."Description",
    risk."Tier",
    risk."ParentRiskId",
    rva."Title" as "ParentTitle",
    risk."OrgKey",
    risk."RowStatus",
    risk."Meta",
    uncon."Impact" as "UncontrolledImpact",
    uncon."Likelihood" as "UncontrolledLikelihood",
    uncon."Rating" as "UncontrolledRating",
    uncon."Description" as "UncontrolledDescription",
    con."Impact" as "ControlledImpact",
    con."Likelihood" as "ControlledLikelihood",
    con."Rating" as "ControlledRating",
    con."Description" as "ControlledDescription",
    COALESCE(rc."LinkedControlCount", 0) as "LinkedControlCount"
FROM risksmart.risk_view_active AS risk
    LEFT OUTER JOIN risksmart.user_view_active uva_user on risk."User" = uva_user."Id"
    AND risk."OrgKey" = uva_user."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active uva_owner on risk."Owner" = uva_owner."Id"
    AND risk."OrgKey" = uva_owner."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active rva on risk."ParentRiskId" = rva."Id"
    AND risk."OrgKey" = rva."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment_view_active uncon on risk."Id" = uncon."ParentId"
    AND uncon."ControlType" = 'Uncontrolled'
    AND risk."OrgKey" = uncon."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment_view_active con on risk."Id" = con."ParentId"
    AND risk."OrgKey" = con."OrgKey"
    AND con."ControlType" = 'Controlled'
    INNER JOIN (
        SELECT fr."Id",
            fr."OrgKey",
            MIN(fr."Timestamp") as "FirstTimestamp"
        FROM risksmart.risk fr
        GROUP BY fr."Id",
            fr."OrgKey"
    ) min ON risk."Id" = min."Id"
    AND risk."OrgKey" = min."OrgKey"
    LEFT JOIN rc ON rc."ParentRiskId" = risk."Id"
    AND rc."OrgKey" = risk."OrgKey";

DROP VIEW risksmart.control_view_active_flat;

DROP VIEW risksmart.control_view_active;

-- remove row status
ALTER TABLE risksmart.control_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.control DROP COLUMN "RowStatus";
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.risk_assessment_audit (
    "ParentId" uuid NOT NULL,
    "ControlType" text NOT NULL,
    "Likelihood" integer,
    "Impact" integer,
    "Rating" integer,
    "Description" text,
    "NextTestDate" timestamp with time zone,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentId", "ControlType", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.risk_assessment
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.risk_assessment
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.risk_assessment
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.risk_assessment_audit (
        "ParentId",
        "ControlType",
        "Likelihood",
        "Impact",
        "Rating",
        "Description",
        "NextTestDate",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."ParentId",
    tt."ControlType",
    tt."Likelihood",
    tt."Impact",
    tt."Rating",
    tt."Description",
    tt."NextTestDate",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.risk_assessment tt
    INNER JOIN (
        SELECT distinct on (c."ParentId", c."ControlType") c."ParentId",
            c."ControlType",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.risk_assessment c
        ORDER BY c."ParentId",
            c."ControlType",
            c."ModifiedAtTimestamp"
    ) As created ON created."ParentId" = tt."ParentId"
    AND created."ControlType" = tt."ControlType";

truncate table risksmart.risk_assessment;

ALTER TABLE risksmart.risk_assessment DROP CONSTRAINT "risk_assessment_pkey";

ALTER TABLE risksmart.risk_assessment
ADD PRIMARY KEY ("ParentId", "ControlType");

-- Populate table with latest record
INSERT INTO risksmart.risk_assessment (
        "ParentId",
        "ControlType",
        "Likelihood",
        "Impact",
        "Rating",
        "Description",
        "NextTestDate",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."ParentId",
    c."ControlType",
    c."Likelihood",
    c."Impact",
    c."Rating",
    c."Description",
    c."NextTestDate",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.risk_assessment_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.risk_assessment_audit cc
                WHERE (
                        cc."ParentId" = c."ParentId"
                        AND cc."ControlType" = c."ControlType"
                    )
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.risk_assessment_modified() RETURNS trigger AS $body$
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

insert into risksmart.risk_assessment_audit(
        "ParentId",
        "ControlType",
        "Likelihood",
        "Impact",
        "Rating",
        "Description",
        "NextTestDate",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentId",
        nr."ControlType",
        nr."Likelihood",
        nr."Impact",
        nr."Rating",
        nr."Description",
        nr."NextTestDate",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER risk_assessment_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.risk_assessment FOR EACH ROW EXECUTE FUNCTION risksmart.risk_assessment_modified();

CREATE OR REPLACE VIEW risksmart."risk_view_active_flat" AS WITH rc AS (
        SELECT c."ParentRiskId",
            c."OrgKey",
            count(*) AS "LinkedControlCount"
        FROM risksmart.control c
        GROUP BY c."ParentRiskId",
            c."OrgKey"
    )
SELECT risk."Id",
    risk."Timestamp",
    min."FirstTimestamp" as "CreatedTimestamp",
    risk."User",
    uva_user."UserName",
    risk."Title",
    risk."Owner",
    uva_owner."UserName" as "OwnerName",
    risk."Description",
    risk."Tier",
    risk."ParentRiskId",
    rva."Title" as "ParentTitle",
    risk."OrgKey",
    risk."RowStatus",
    risk."Meta",
    uncon."Impact" as "UncontrolledImpact",
    uncon."Likelihood" as "UncontrolledLikelihood",
    uncon."Rating" as "UncontrolledRating",
    uncon."Description" as "UncontrolledDescription",
    con."Impact" as "ControlledImpact",
    con."Likelihood" as "ControlledLikelihood",
    con."Rating" as "ControlledRating",
    con."Description" as "ControlledDescription",
    COALESCE(rc."LinkedControlCount", 0) as "LinkedControlCount"
FROM risksmart.risk_view_active AS risk
    LEFT OUTER JOIN risksmart.user_view_active uva_user on risk."User" = uva_user."Id"
    AND risk."OrgKey" = uva_user."OrgKey"
    LEFT OUTER JOIN risksmart.user_view_active uva_owner on risk."Owner" = uva_owner."Id"
    AND risk."OrgKey" = uva_owner."OrgKey"
    LEFT OUTER JOIN risksmart.risk_view_active rva on risk."ParentRiskId" = rva."Id"
    AND risk."OrgKey" = rva."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment uncon on risk."Id" = uncon."ParentId"
    AND uncon."ControlType" = 'Uncontrolled'
    AND risk."OrgKey" = uncon."OrgKey"
    LEFT OUTER JOIN risksmart.risk_assessment con on risk."Id" = con."ParentId"
    AND risk."OrgKey" = con."OrgKey"
    AND con."ControlType" = 'Controlled'
    INNER JOIN (
        SELECT fr."Id",
            fr."OrgKey",
            MIN(fr."Timestamp") as "FirstTimestamp"
        FROM risksmart.risk fr
        GROUP BY fr."Id",
            fr."OrgKey"
    ) min ON risk."Id" = min."Id"
    AND risk."OrgKey" = min."OrgKey"
    LEFT JOIN rc ON rc."ParentRiskId" = risk."Id"
    AND rc."OrgKey" = risk."OrgKey";

DROP VIEW risksmart.risk_assessment_view_active;

DROP VIEW risksmart.file_view_active;

-- remove row status
ALTER TABLE risksmart.risk_assessment_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.risk_assessment DROP COLUMN "RowStatus";
DROP FUNCTION risksmart.delete_control_group;

DROP FUNCTION risksmart.update_control_group;

DROP FUNCTION risksmart.insert_control_group;
-- issues with renaming tables in hasura, so creating from scratch
CREATE TABLE IF NOT EXISTS risksmart.risk_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Owner" text NOT NULL,
    "Tier" integer NOT NULL,
    "ParentRiskId" uuid,
    "Description" text NULL,
    "Meta" json,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    -- dropped later
    "RowStatus" risksmart.row_status NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.risk
    RENAME COLUMN "User" to "ModifiedByUser";

ALTER TABLE risksmart.risk
    RENAME COLUMN "Timestamp" to "ModifiedAtTimestamp";

ALTER TABLE risksmart.risk
ADD COLUMN "CreatedByUser" text,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp();

INSERT INTO risksmart.risk_audit (
        "Id",
        "Title",
        "Owner",
        "Tier",
        "ParentRiskId",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus",
        "Action"
    )
SELECT tt."Id",
    tt."Title",
    tt."Owner",
    tt."Tier",
    tt."ParentRiskId",
    tt."Description",
    tt."Meta",
    tt."OrgKey",
    tt."ModifiedByUser",
    tt."ModifiedAtTimestamp",
    created."CreatedByUser",
    created."CreatedAtTimestamp",
    tt."RowStatus",
    CASE
        WHEN tt."RowStatus" = 'deleted' THEN 'DELETE'
        WHEN tt."ModifiedAtTimestamp" = created."CreatedAtTimestamp" THEN 'INSERT'
        ELSE 'UPDATE'
    END
FROM risksmart.risk tt
    INNER JOIN (
        SELECT distinct on (c."Id") c."Id",
            c."ModifiedAtTimestamp" as "CreatedAtTimestamp",
            c."ModifiedByUser" as "CreatedByUser"
        FROM risksmart.risk c
        ORDER BY c."Id",
            c."ModifiedAtTimestamp"
    ) As created ON created."Id" = tt."Id";

truncate table risksmart.risk;

ALTER TABLE risksmart.risk DROP CONSTRAINT "Risk_pkey";

ALTER TABLE risksmart.risk
ADD PRIMARY KEY ("Id");

ALTER TABLE risksmart.risk
alter column "Id"
set default gen_random_uuid();

-- Populate table with latest record
INSERT INTO risksmart.risk (
        "Id",
        "Title",
        "Owner",
        "Tier",
        "ParentRiskId",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "RowStatus"
    )
SELECT c."Id",
    c."Title",
    c."Owner",
    c."Tier",
    c."ParentRiskId",
    c."Description",
    c."Meta",
    c."OrgKey",
    c."ModifiedByUser",
    c."ModifiedAtTimestamp",
    c."CreatedByUser",
    c."CreatedAtTimestamp",
    c."RowStatus"
FROM risksmart.risk_audit c
WHERE (
        (
            c."ModifiedAtTimestamp" = (
                SELECT max(cc."ModifiedAtTimestamp") AS max
                FROM risksmart.risk_audit cc
                WHERE (cc."Id" = c."Id")
            )
        )
        AND (c."RowStatus" = 'active'::text)
    );

-- Create triggers to populate audit tables
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
        "Title",
        "Owner",
        "Tier",
        "ParentRiskId",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Owner",
        nr."Tier",
        nr."ParentRiskId",
        nr."Description",
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

$body$ LANGUAGE plpgsql;

CREATE TRIGGER risk_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.risk FOR EACH ROW EXECUTE FUNCTION risksmart.risk_modified();

DROP FUNCTION risksmart.delete_risk;

DROP FUNCTION risksmart.update_risk;

CREATE OR REPLACE FUNCTION risksmart.update_risk(
        id uuid,
        title text,
        owner text,
        description text,
        tier integer,
        parent_risk_id uuid,
        original_timestamp timestamp without time zone
    ) RETURNS SETOF risksmart.risk LANGUAGE 'plpgsql' AS $BODY$ BEGIN IF NOT EXISTS (
        SELECT 1
        FROM risksmart.risk a
        WHERE a."ModifiedAtTimestamp" = original_timestamp
            AND a."Id" = id
            AND a."OrgKey" = risksmart.get_hasura_org_id()
            AND a."Tier" = tier
    ) THEN -- Remove parent on child risks if parent has changed
UPDATE risksmart.risk
SET "ParentRiskId" = null,
    "ModifiedByUser" = risksmart.get_hasura_user_id(),
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "ParentRiskId" = id
    AND "Id" <> id
    AND "OrgKey" = risksmart.get_hasura_org_id();

END IF;

return query
UPDATE risksmart.risk
SET "ModifiedByUser" = risksmart.get_hasura_user_id(),
    "ModifiedAtTimestamp" = statement_timestamp(),
    "Title" = title,
    "Owner" = owner,
    "Description" = description,
    "Tier" = tier,
    "ParentRiskId" = parent_risk_id
WHERE "ModifiedAtTimestamp" = original_timestamp
    AND "Id" = id
    AND "OrgKey" = risksmart.get_hasura_org_id()
RETURNING *;

IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = '22000',
MESSAGE = 'Records not updated. Record may have been updated by another user';

END IF;

END $BODY$;

DROP FUNCTION risksmart.insert_risk;

CREATE OR REPLACE VIEW risksmart.department_security_risk AS
SELECT R."Id",
    coalesce(
        d."DepartmentTypeId",
        '00000000-0000-0000-0000-000000000000'
    ) as "DepartmentTypeId"
FROM risksmart.risk AS R
    LEFT OUTER JOIN risksmart.department D on D."ParentId" = R."Id";

DROP VIEW risksmart.risk_view_active_flat;

DROP VIEW risksmart.risk_view_active;

-- remove row status
ALTER TABLE risksmart.risk_audit DROP COLUMN "RowStatus";

ALTER TABLE risksmart.risk DROP COLUMN "RowStatus";
DROP FUNCTION risksmart.update_consequence;

DROP FUNCTION risksmart.insert_consequence;

DROP FUNCTION risksmart.update_issue_assessment;

DROP FUNCTION risksmart.insert_issue_assessment;

DROP FUNCTION risksmart.insert_issue;
CREATE INDEX "idx_risk_parentRiskId" on risksmart.risk using btree ("ParentRiskId");

CREATE INDEX "idx_organisationUser_parentRiskId" on auth.organisationUser using btree ("User_Id", "OrgKey");

CREATE INDEX "idx_control_parentRiskId" on risksmart.control using btree ("ParentRiskId");

CREATE INDEX "idx_issueAssessment_associatedControlId" on risksmart.issue_assessment using btree ("AssociatedControlId");

CREATE INDEX "idx_testResult_parentControlId" on risksmart.test_result using btree ("ParentControlId");

CREATE INDEX "idx_issueAction_actionIdIssueId" on risksmart.issue_action using btree ("ActionId", "IssueId");

CREATE INDEX "idx_controlAction_actionIdControlId" on risksmart.control_action using btree ("ActionId", "ControlId");

CREATE INDEX "idx_riskAction_actionIdRiskId" on risksmart.risk_action using btree ("ActionId", "RiskId");

CREATE INDEX "idx_appetite_parentRiskId" on risksmart.appetite using btree ("ParentRiskId");
DROP FUNCTION risksmart.update_risk;
ALTER TABLE risksmart.file DROP COLUMN "RowStatus";

ALTER TABLE risksmart.file_audit DROP COLUMN "RowStatus";

DROP DOMAIN risksmart.row_status;

ALTER TABLE risksmart.file DROP CONSTRAINT "file_pkey";

ALTER TABLE risksmart.file
ADD PRIMARY KEY ("Id");
CREATE OR REPLACE VIEW risksmart.role_permission AS
select role_name as "Role",
    json_array_elements_text(role_set) as "Permissions"
from json_to_recordset(
        (
            select m.metadata->'inherited_roles'
            from hdb_catalog.hdb_metadata m
        )
    ) as x(role_name text, role_set json);

ALTER TABLE risksmart.control
ADD COLUMN "TestFrequency" text;

CREATE TABLE risksmart.control_test_frequency ("Value" text PRIMARY KEY, "Comment" text);

ALTER TABLE risksmart.control
ADD CONSTRAINT "control_test_frequency_fkey" FOREIGN KEY ("TestFrequency") REFERENCES risksmart.control_test_frequency("Value");

INSERT INTO risksmart.control_test_frequency ("Value", "Comment")
VALUES ('daily', 'Daily'),
  ('weekly', 'Weekly'),
  ('fortnightly', 'Fortnightly'),
  ('fourweekly', 'Four Weekly'),
  ('monthly', 'Monthly'),
  ('quarterly', 'Quarterly'),
  ('annually', 'Annually'),
  ('adhoc', 'Ad Hoc');

ALTER TABLE risksmart.control_audit
ADD COLUMN "TestFrequency" text;

-- Create triggers to populate audit tables
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
    "Title",
    "Owner",
    "Description",
    "Type",
    "ParentRiskId",
    "GroupId",
    "Meta",
    "OrgKey",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "TestFrequency",
    "Action"
  )
values (
    nr."Id",
    nr."Title",
    nr."Owner",
    nr."Description",
    nr."Type",
    nr."ParentRiskId",
    nr."GroupId",
    nr."Meta",
    nr."OrgKey",
    updated_user,
    update_timestamp,
    nr."CreatedByUser",
    nr."CreatedAtTimestamp",
    nr."TestFrequency",
    TG_OP
  );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
DROP VIEW risksmart.role_permission;

CREATE OR REPLACE VIEW risksmart.role_permission AS
select role_name as "Role",
    role_set as "Permissions"
from json_to_recordset(
        (
            select m.metadata->'inherited_roles'
            from hdb_catalog.hdb_metadata m
        )
    ) as x(role_name text, role_set json);
ALTER TABLE risksmart.action
ADD COLUMN "ClosedDate" timestamp with time zone;

ALTER TABLE risksmart.action_audit
ADD COLUMN "ClosedDate" timestamp with time zone;

CREATE OR REPLACE FUNCTION risksmart.action_modified() RETURNS trigger AS $body$
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

insert into risksmart.action_audit(
        "Id",
        "Title",
        "Owner",
        "DateRaised",
        "DateDue",
        "Status",
        "Priority",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ClosedDate",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Owner",
        nr."DateRaised",
        nr."DateDue",
        nr."Status",
        nr."Priority",
        nr."Description",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."ClosedDate",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
CREATE TABLE risksmart.user_group (
    "Id" uuid not null primary key,
    "Name" text not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE risksmart.user_group_audit (
    "Id" uuid not null,
    "Name" text not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.user_group_modified() RETURNS trigger AS $body$
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

insert into risksmart.user_group_audit(
        "Id",
        "Name",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Name",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER user_group_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.user_group FOR EACH ROW EXECUTE FUNCTION risksmart.user_group_modified();
ALTER TABLE risksmart.obligation_assessment
ADD COLUMN "CompletedBy" text NULL;
ALTER TABLE risksmart.acceptance
ADD COLUMN "ApprovedByUser" text;

ALTER TABLE risksmart.acceptance
ADD COLUMN "ApprovedByUserGroup" text;

ALTER TABLE risksmart.acceptance
ADD COLUMN "RequestedByUser" text;

ALTER TABLE risksmart.acceptance
ADD COLUMN "RequestedByUserGroup" text;

ALTER TABLE risksmart.acceptance_audit
ADD COLUMN "ApprovedByUser" text;

ALTER TABLE risksmart.acceptance_audit
ADD COLUMN "ApprovedByUserGroup" text;

ALTER TABLE risksmart.acceptance_audit
ADD COLUMN "RequestedByUser" text;

ALTER TABLE risksmart.acceptance_audit
ADD COLUMN "RequestedByUserGroup" text;

ALTER TABLE risksmart.acceptance
ADD CONSTRAINT chk_acceptance_approver check (
        "ApprovedByUser" is null
        or "ApprovedByUserGroup" is null
    );

ALTER TABLE risksmart.acceptance
ADD CONSTRAINT chk_acceptance_requester check (
        "RequestedByUser" is null
        or "RequestedByUserGroup" is null
    );

CREATE OR REPLACE FUNCTION risksmart.acceptance_modified() RETURNS trigger AS $body$
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

insert into risksmart.acceptance_audit(
        "Id",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "Details",
        "ParentRiskId",
        "Status",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ApprovedByUser",
        "ApprovedByUserGroup",
        "RequestedByUser",
        "RequestedByUserGroup"
    )
values (
        nr."Id",
        nr."Title",
        nr."DateAcceptedFrom",
        nr."DateAcceptedTo",
        nr."Details",
        nr."ParentRiskId",
        nr."Status",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."ApprovedByUser",
        nr."ApprovedByUserGroup",
        nr."RequestedByUser",
        nr."RequestedByUserGroup"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.acceptance DROP CONSTRAINT Status_check;

CREATE TABLE risksmart.acceptance_status("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.acceptance_status ("Value", "Comment")
VALUES ('open', 'open'),
    ('closed', 'closed'),
    ('overdue', 'overdue');

ALTER TABLE risksmart.acceptance
ADD CONSTRAINT "acceptance_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.acceptance_status("Value");
ALTER TABLE risksmart.action
DROP CONSTRAINT Status_check;

ALTER TABLE risksmart.action
ADD CONSTRAINT Status_check CHECK ("Status" IN ('pending', 'open', 'closed'));

ALTER TABLE risksmart.issue_assessment
DROP CONSTRAINT Status_check;

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT Status_check CHECK ("Status" IN ('pending', 'open', 'closed', 'overdue', 'awaiting-closure', '1st-line-approval', 'declined'));

ALTER TABLE risksmart.acceptance
ALTER COLUMN "ApprovedByUserGroup" TYPE uuid USING "ApprovedByUserGroup"::uuid,
    ALTER COLUMN "RequestedByUserGroup" TYPE uuid USING "RequestedByUserGroup"::uuid;

ALTER TABLE risksmart.acceptance_audit
ALTER COLUMN "ApprovedByUserGroup" TYPE uuid USING "ApprovedByUserGroup"::uuid,
    ALTER COLUMN "RequestedByUserGroup" TYPE uuid USING "RequestedByUserGroup"::uuid;
INSERT INTO risksmart.acceptance_status ("Value", "Comment")
VALUES ('pending', 'pending'),
    ('firstlineapproval', '1st line approval'),
    ('awaitingclosure', 'awaiting closure'),
    ('declined', 'declined');

ALTER TABLE risksmart.relation_file
DROP CONSTRAINT ParentType_check,
ADD CONSTRAINT ParentType_check CHECK (
        "ParentType" IN (
            'appetite',
            'action_update',
            'issue',
            'acceptance',
            'action',
            'issue_update',
            'test_result',
            'obligation_assessment'
        )
    );
CREATE TABLE IF NOT EXISTS risksmart.obligation_audit (LIKE risksmart.obligation);

ALTER TABLE risksmart.obligation_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.obligation_audit
ADD COLUMN "Action" risksmart.db_action;

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
        "ParentId",
        "Title",
        "Owner",
        "Description",
        "Interpretation",
        "Adherence",
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
        nr."ParentId",
        nr."Title",
        nr."Owner",
        nr."Description",
        nr."Interpretation",
        nr."Adherence",
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

CREATE TRIGGER obligation_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.obligation FOR EACH ROW EXECUTE FUNCTION risksmart.obligation_modified();

/** obligation_impact **/
CREATE TABLE IF NOT EXISTS risksmart.obligation_impact_audit (LIKE risksmart.obligation_impact);

ALTER TABLE risksmart.obligation_impact_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.obligation_impact_audit
ADD COLUMN "Action" risksmart.db_action;


CREATE OR REPLACE FUNCTION risksmart.obligation_impact_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_impact_audit(
        "Id",
        "ParentObligationId",
        "Description",
        "ImpactRating",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ParentObligationId",
        nr."Description",
        nr."ImpactRating",
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

CREATE TRIGGER obligation_impact_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.obligation_impact FOR EACH ROW EXECUTE FUNCTION risksmart.obligation_impact_modified();


/** obligation assessment **/
CREATE TABLE IF NOT EXISTS risksmart.obligation_assessment_audit (LIKE risksmart.obligation_assessment);

ALTER TABLE risksmart.obligation_assessment_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.obligation_assessment_audit
ADD COLUMN "Action" risksmart.db_action;


CREATE OR REPLACE FUNCTION risksmart.obligation_assessment_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_assessment_audit(
        "Id",
        "ParentObligationId",
        "Title",
        "Summary",
        "TargetCompletionDate",
        "ActualCompletionDate",
        "StartDate",
        "Status",
        "Owner",
        "Result",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ParentObligationId",
        nr."Title",
        nr."Summary",
        nr."TargetCompletionDate",
        nr."ActualCompletionDate",
        nr."StartDate",
        nr."Status",
        nr."Owner",
        nr."Result",
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

CREATE TRIGGER obligation_assessment_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.obligation_assessment FOR EACH ROW EXECUTE FUNCTION risksmart.obligation_assessment_modified();

CREATE TABLE IF NOT EXISTS risksmart.obligation_action (
    "ObligationId" uuid not null,
    "ActionId" uuid not null,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() not null,
    "ModifiedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedByUser" text NOT NULL,
    "OrgKey" text NOT NULL,
    primary key ("ObligationId", "ActionId")
);

CREATE TABLE IF NOT EXISTS risksmart.obligation_action_audit (LIKE risksmart.obligation_action);

ALTER TABLE risksmart.obligation_action_audit
ADD PRIMARY KEY ("ObligationId", "ActionId", "ModifiedAtTimestamp");

ALTER TABLE risksmart.obligation_action_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.obligation_action_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_action_audit(
        "ObligationId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ObligationId",
        nr."ActionId",
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

CREATE TRIGGER obligation_action_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.obligation_action FOR EACH ROW EXECUTE FUNCTION risksmart.obligation_action_modified();

/** obligation issue **/

CREATE TABLE IF NOT EXISTS risksmart.obligation_issue (
    "ObligationId" uuid not null,
    "IssueId" uuid not null,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() not null,
    "ModifiedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedByUser" text NOT NULL,
    "OrgKey" text NOT NULL,
    primary key ("ObligationId", "IssueId")
);

CREATE TABLE IF NOT EXISTS risksmart.obligation_issue_audit (LIKE risksmart.obligation_issue);

ALTER TABLE risksmart.obligation_issue_audit
ADD PRIMARY KEY ("ObligationId", "IssueId", "ModifiedAtTimestamp");

ALTER TABLE risksmart.obligation_issue_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.obligation_issue_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_issue_audit(
        "ObligationId",
        "IssueId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ObligationId",
        nr."IssueId",
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

CREATE TRIGGER obligation_issue_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.obligation_issue FOR EACH ROW EXECUTE FUNCTION risksmart.obligation_issue_modified();
ALTER TABLE risksmart.issue_assessment
DROP CONSTRAINT Status_check;

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT Status_check CHECK ("Status" IN ('pending', 'open', 'closed', 'overdue', 'awaitingclosure', 'firstlineapproval', 'declined'));

ALTER TABLE risksmart.issue_assessment DROP CONSTRAINT Status_check;

-- Dropping overdue, so need to set to open
UPDATE risksmart.issue_assessment
SET "Status" = 'open',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Status" = 'overdue';

-- Update status to support enum compatible values
UPDATE risksmart.issue_assessment
SET "Status" = 'awaitingclosure',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Status" = 'awaiting-closure';

UPDATE risksmart.issue_assessment
SET "Status" = 'firstlineapproval',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Status" = '1st-line-approval';

CREATE TABLE risksmart.issue_assessment_status("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.issue_assessment_status ("Value", "Comment")
VALUES ('pending', 'Pending'),
    ('open', 'Open'),
    ('closed', 'Closed'),
    ('awaitingclosure', 'awaiting closure'),
    ('firstlineapproval', '1st line approval'),
    ('declined', 'Declined');

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT "issue_assessment_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.issue_assessment_status("Value");
UPDATE risksmart.acceptance
SET "Status" = 'open',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Status" = 'overdue';

DELETE FROM risksmart.acceptance_status
WHERE "Value" = 'overdue';
ALTER TABLE risksmart.action DROP CONSTRAINT Status_check;

-- Dropping overdue, so need to set to open
UPDATE risksmart.action
SET "Status" = 'open',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Status" = 'overdue';

CREATE TABLE risksmart.action_status("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.action_status ("Value", "Comment")
VALUES ('pending', 'Pending'),
    ('open', 'Open'),
    ('closed', 'Closed');

ALTER TABLE risksmart.action
ADD CONSTRAINT "action_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.action_status("Value");

ALTER TABLE risksmart."control" ALTER COLUMN "ParentRiskId" DROP NOT NULL;

ALTER TABLE risksmart."control"
ADD COLUMN "ParentObligationId" uuid;

/** check if parent risk or obligation id is set (but not both). **/
ALTER TABLE risksmart."control"
ADD CONSTRAINT parent_id_check CHECK (
  ("ParentRiskId" is not null and "ParentObligationId" is null)
  or 
  ("ParentRiskId" is null and "ParentObligationId" is not null)
);
ALTER TABLE risksmart."control_audit"
ADD COLUMN "ParentObligationId" uuid;

-- Update trigger function
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
        "Title",
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "ParentObligationId",
        "GroupId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Owner",
        nr."Description",
        nr."Type",
        nr."ParentRiskId",
        nr."ParentObligationId",
        nr."GroupId",
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

$body$ LANGUAGE plpgsql;
ALTER TABLE risksmart."control_audit" ALTER COLUMN "ParentRiskId" DROP NOT NULL;
ALTER TABLE auth.user
ALTER COLUMN "CreatedOn"
SET DEFAULT statement_timestamp();
CREATE UNIQUE INDEX ix_department_type_orgkey_title ON risksmart.department_type("OrgKey", "Name");

CREATE UNIQUE INDEX ix_tag_type_orgkey_title ON risksmart.tag_type("OrgKey", "Name");
CREATE TABLE risksmart.cost_type ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.cost_type ("Value", "Comment")
VALUES ('hours', 'Hours'),
    ('pounds', 'Pounds'),
    ('number', 'Number');

ALTER TABLE risksmart.consequence
ADD CONSTRAINT "Consequence_CostType_fkey" FOREIGN KEY ("CostType") REFERENCES risksmart.cost_type("Value");

ALTER TABLE risksmart.consequence DROP CONSTRAINT costtype_check;
ALTER TABLE risksmart.issue
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.issue_audit
ADD COLUMN "SequentialId" integer NULL;

-- Create triggers to populate audit tables
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
        "SequentialId"
    )
values (
        nr."Id",
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
        nr."SequentialId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.getNextCounterValue(orgKey text, tableName text) RETURNS INT LANGUAGE plpgsql AS $$
DECLARE seq_name text;

DECLARE next_val INT;

BEGIN seq_name := 'seq_' || tableName || '_' || orgKey;

-- Check is sequence already exists
IF NOT EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relkind = 'S'
        AND relname = seq_name
) THEN EXECUTE format('CREATE SEQUENCE risksmart."%s"', seq_name);

END IF;

-- Generate next value for group
next_val := nextval(format('risksmart."%s"', seq_name));

RETURN next_val;

END $$;

CREATE TEMP TABLE new_issues ("Id" uuid, "SequentialId" integer);

INSERT INTO new_issues ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'issue') AS "SequentialId"
FROM risksmart.issue
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.issue i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_issues ni
WHERE i."Id" = ni."Id";

DROP TABLE new_issues;

CREATE UNIQUE INDEX idx_issue_orgKey_sequentialid ON risksmart.issue("OrgKey", "SequentialId");

CREATE OR REPLACE FUNCTION risksmart.set_sequential_id() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN IF new."SequentialId" IS NULL THEN new."SequentialId" := risksmart.getNextCounterValue(new."OrgKey", TG_TABLE_NAME);

END IF;

return new;

END;

$$;

CREATE TRIGGER issue_set_sequential_id_trigger BEFORE
INSERT ON risksmart.issue for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();
ALTER TABLE risksmart.issue_assessment DROP CONSTRAINT issue_assessment_pkey;

ALTER TABLE risksmart.issue_assessment
ADD COLUMN "Id" uuid NOT NULL default gen_random_uuid();

ALTER TABLE risksmart.issue_assessment
ADD PRIMARY KEY ("Id");

CREATE UNIQUE INDEX "idx_issueAssessment_parentIssueId" on risksmart.issue_assessment using btree ("ParentIssueId");

ALTER TABLE risksmart.issue_assessment_audit DROP CONSTRAINT issue_assessment_audit_pkey;

ALTER TABLE risksmart.issue_assessment_audit
ADD COLUMN "Id" uuid NULL;

-- Bit unusual to update audit table, but we need a new primary key on it
-- First set using ids frm issue_assessment table
UPDATE risksmart.issue_assessment_audit isa
SET "Id" = ia."Id"
FROM risksmart.issue_assessment ia
WHERE isa."ParentIssueId" = ia."ParentIssueId";

-- update "Id" for issue_assessment records that have been deleted
CREATE TEMP TABLE issue_assessment_ids ("Id" uuid, "ParentIssueId" uuid);

INSERT INTO issue_assessment_ids ("ParentIssueId", "Id")
SELECT x."ParentIssueId",
    gen_random_uuid()
FROM (
        SELECT DISTINCT "ParentIssueId"
        FROM risksmart.issue_assessment_audit
        WHERE "Id" is null
    ) as x;

UPDATE risksmart.issue_assessment_audit iaa
SET "Id" = iai."Id"
FROM issue_assessment_ids iai
WHERE iai."ParentIssueId" = iaa."ParentIssueId";

DROP TABLE issue_assessment_ids;

ALTER TABLE risksmart.issue_assessment_audit
ALTER COLUMN "ParentIssueId"
SET NOT NULL;

ALTER TABLE risksmart.issue_assessment_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

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
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "Owner",
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
        "AssociatedControlId",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ParentIssueId",
        nr."IssueType",
        nr."Severity",
        nr."TargetCloseDate",
        nr."ActualCloseDate",
        nr."Status",
        nr."Owner",
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
        nr."AssociatedControlId",
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

$body$ LANGUAGE plpgsql;
ALTER TABLE risksmart.action_update
ALTER COLUMN "Description"
SET NOT NULL;

ALTER TABLE risksmart.issue_update
ALTER COLUMN "Description"
SET NOT NULL;

ALTER TABLE risksmart.test_result
ALTER COLUMN "Description"
SET NOT NULL;

ALTER TABLE risksmart.test_result
ALTER COLUMN "TestType"
SET NOT NULL;
ALTER TABLE risksmart.obligation
ALTER COLUMN "Description"
SET NOT NULL;

ALTER TABLE risksmart.obligation
ALTER COLUMN "Adherence"
SET NOT NULL;

ALTER TABLE risksmart.control
ALTER COLUMN "Description"
SET NOT NULL;

ALTER TABLE risksmart.risk_assessment
ALTER COLUMN "Description"
SET NOT NULL;
CREATE TABLE IF NOT EXISTS risksmart.indicator (
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "Title" text NOT NULL,
    "Owner" text NOT NULL,
    "Description" text,
    "TestFrequency" text,
    "Type" text NOT NULL,
    "Unit" text,
    "UpperToleranceNum" numeric,
    "LowerToleranceNum" numeric,
    "TargetValueTxt" text,    
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE risksmart.indicator_type (
  "Value" text PRIMARY KEY,
  "Comment" text
);

ALTER TABLE risksmart.indicator ADD CONSTRAINT
  "Indicator_type_fkey" 
  FOREIGN KEY ("Type") REFERENCES risksmart.indicator_type("Value");

INSERT INTO risksmart.indicator_type ("Value", "Comment") VALUES
  ('number', ' Number indicator type'),
  ('text', 'Text indicator type'),
  ('boolean', 'True or false indicator type');

CREATE TABLE risksmart.test_frequency (
  "Value" text PRIMARY KEY,
  "Comment" text
);

ALTER TABLE risksmart.indicator ADD CONSTRAINT
  "Indicator_test_frequency_fkey" 
  FOREIGN KEY ("TestFrequency") REFERENCES risksmart.test_frequency("Value");

INSERT INTO risksmart.test_frequency ("Value", "Comment") VALUES
  ('daily', ' Daily'),
  ('weekly', 'Weekly'),
  ('fortnightly', 'Fortnightly'),
  ('fourweekly', 'Four Weekly'),
  ('monthly', 'Monthly'),
  ('quarterly', 'Quarterly'),
  ('annually', 'Annually'),
  ('adhoc', 'Ad Hoc');


/** indicator results **/

CREATE TABLE IF NOT EXISTS risksmart.indicator_result (
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "IndicatorId" uuid NOT NULL,
    "Description" text,
    "ResultDate" timestamp with time zone NOT NULL,
    "TargetValueTxt" text,
    "TargetValueNum" numeric,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

/** check that one result target value is present but not both **/
ALTER TABLE risksmart.indicator_result ADD CONSTRAINT
  "Indicator_result_target_value" 
CHECK (
  ("TargetValueTxt" is not null and "TargetValueNum" is null)
  or 
  ("TargetValueTxt" is null and "TargetValueNum" is not null)
);

/** indicator parent link tables (risk & control) **/
CREATE TABLE IF NOT EXISTS risksmart.risk_indicator (
    "RiskId" uuid NOT NULL,
    "IndicatorId" uuid default gen_random_uuid() NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    PRIMARY KEY ("RiskId", "IndicatorId")
);

CREATE TABLE IF NOT EXISTS risksmart.control_indicator (
    "ControlId" uuid NOT NULL,
    "IndicatorId" uuid default gen_random_uuid() NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    PRIMARY KEY ("ControlId", "IndicatorId")
);

/** audit tables and triggers **/ 

/** indicator audit tbl **/
CREATE TABLE IF NOT EXISTS risksmart.indicator_audit (LIKE risksmart.indicator);

ALTER TABLE risksmart.indicator_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.indicator_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.indicator_modified() RETURNS trigger AS $body$
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

insert into risksmart.indicator_audit(
        "Id",
        "Title",
        "Owner",
        "Description",
        "Type",
        "TestFrequency",
        "Unit",
        "UpperToleranceNum",
        "LowerToleranceNum",
        "TargetValueTxt",    
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Owner",
        nr."Description",
        nr."Type",
        nr."TestFrequency",
        nr."Unit",
        nr."UpperToleranceNum",
        nr."LowerToleranceNum",
        nr."TargetValueTxt",
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

CREATE TRIGGER indicator_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.indicator FOR EACH ROW EXECUTE FUNCTION risksmart.indicator_modified();

/** indicator result audit **/
CREATE TABLE IF NOT EXISTS risksmart.indicator_result_audit (LIKE risksmart.indicator_result);

ALTER TABLE risksmart.indicator_result_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.indicator_result_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.indicator_result_modified() RETURNS trigger AS $body$
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

insert into risksmart.indicator_result_audit(
        "Id",
        "IndicatorId",
        "Description",
        "ResultDate",
        "TargetValueTxt",
        "TargetValueNum", 
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."IndicatorId",
        nr."Description",
        nr."ResultDate",
        nr."TargetValueTxt",
        nr."TargetValueNum",
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

CREATE TRIGGER indicator_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.indicator_result FOR EACH ROW EXECUTE FUNCTION risksmart.indicator_result_modified();










create table risksmart.document_type ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.document_type ("Value", "Comment")
VALUES ('framework', 'Hours'),
    ('standard', 'Standard'),
    ('policy', 'Policy');

create table risksmart.document (
    "Id" uuid NOT NULL default gen_random_uuid() primary key,
    "Title" text NOT NULL,
    "DocumentType" text NOT NULL,
    "Purpose" text NULL,
    "ParentDocument" uuid NULL,
    "Owner" text NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Meta" json
);

create table risksmart.document_audit (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "DocumentType" text NOT NULL,
    "Purpose" text NULL,
    "ParentDocument" uuid NULL,
    "Owner" text NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Meta" json,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.document
ADD CONSTRAINT "Document_DocumentType_fkey" FOREIGN KEY ("DocumentType") REFERENCES risksmart.document_type("Value");

create table risksmart.document_linked_document (
    "DocumentId" uuid NOT NULL,
    "LinkedDocumentId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Meta" json,
    primary key ("DocumentId", "LinkedDocumentId")
);

create table risksmart.document_linked_document_audit (
    "DocumentId" uuid NOT NULL,
    "LinkedDocumentId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Meta" json,
    "Action" risksmart.db_action,
    primary key (
        "DocumentId",
        "LinkedDocumentId",
        "ModifiedAtTimestamp"
    )
);

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
        "Title",
        "DocumentType",
        "Purpose",
        "ParentDocument",
        "Owner",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."DocumentType",
        nr."Purpose",
        nr."ParentDocument",
        nr."Owner",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER document_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document FOR EACH ROW EXECUTE FUNCTION risksmart.document_modified();

CREATE OR REPLACE FUNCTION risksmart.document_linked_document_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_linked_document_audit(
        "DocumentId",
        "LinkedDocumentId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action"
    )
values (
        nr."DocumentId",
        nr."LinkedDocumentId",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER document_linked_document_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document_linked_document FOR EACH ROW EXECUTE FUNCTION risksmart.document_linked_document_modified();
CREATE TABLE risksmart.document_action (
    "DocumentId" uuid not null,
    "ActionId" uuid not null,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("DocumentId", "ActionId")
);

CREATE TABLE risksmart.document_action_audit (
    "DocumentId" uuid not null,
    "ActionId" uuid not null,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("DocumentId", "ActionId", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.document_action_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_action_audit(
        "DocumentId",
        "ActionId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."DocumentId",
        nr."ActionId",
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

CREATE TRIGGER document_action_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document_action FOR EACH ROW EXECUTE FUNCTION risksmart.document_action_modified();
CREATE TABLE risksmart.document_issue (
    "DocumentId" uuid not null,
    "IssueId" uuid not null,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("DocumentId", "IssueId")
);

CREATE TABLE risksmart.document_issue_audit (
    "DocumentId" uuid not null,
    "IssueId" uuid not null,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("DocumentId", "IssueId", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.document_issue_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_issue_audit(
        "DocumentId",
        "IssueId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."DocumentId",
        nr."IssueId",
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

CREATE TRIGGER document_issue_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document_issue FOR EACH ROW EXECUTE FUNCTION risksmart.document_issue_modified();
CREATE TABLE risksmart.document_assessment(
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "Title" text NOT NULL,
    "Summary" text NOT NULL,
    "TargetCompletionDate" timestamp with time zone NULL,
    "ActualCompletionDate" timestamp with time zone NULL,
    "StartDate" timestamp with time zone NULL,
    "Status" text NOT NULL,
    "Owner" text NOT NULL,
    "Result" smallint NULL,
    "CompletedBy" text NULL,
    "ParentDocumentId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE risksmart.document_assessment_status ("Value" text PRIMARY KEY, "Comment" text);

ALTER TABLE risksmart.document_assessment
ADD CONSTRAINT "Document_assessment_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.document_assessment_status("Value");

INSERT INTO risksmart.document_assessment_status ("Value", "Comment")
VALUES ('complete', 'Complete'),
    ('notstarted', 'Not Started'),
    ('inprogress', 'In Progress');

CREATE TABLE risksmart.document_assessment_audit(
    "Id" uuid default gen_random_uuid() NOT NULL,
    "Title" text NOT NULL,
    "Summary" text NOT NULL,
    "TargetCompletionDate" timestamp with time zone NULL,
    "ActualCompletionDate" timestamp with time zone NULL,
    "StartDate" timestamp with time zone NULL,
    "Status" text NOT NULL,
    "Owner" text NOT NULL,
    "Result" smallint NULL,
    "CompletedBy" text NULL,
    "ParentDocumentId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.document_assessment_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_assessment_audit(
        "Id",
        "Title",
        "Summary",
        "TargetCompletionDate",
        "ActualCompletionDate",
        "StartDate",
        "Status",
        "Owner",
        "Result",
        "CompletedBy",
        "ParentDocumentId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Summary",
        nr."TargetCompletionDate",
        nr."ActualCompletionDate",
        nr."StartDate",
        nr."Status",
        nr."Owner",
        nr."Result",
        nr."CompletedBy",
        nr."ParentDocumentId",
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

CREATE TRIGGER document_assessment_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document_assessment FOR EACH ROW EXECUTE FUNCTION risksmart.document_assessment_modified();

ALTER TABLE risksmart.indicator ALTER COLUMN "TestFrequency" SET NOT NULL;
CREATE TABLE risksmart.document_file(
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "Version" text NOT NULL,
    "FileId" uuid NOT NULL,
    "Summary" text NULL,
    "Status" text NOT NULL,
    "ReasonForReview" text NULL,
    "ReviewedBy" text NULL,
    "ReviewDate" timestamp with time zone NULL,
    "NextReviewDate" timestamp with time zone NULL,
    "ParentDocumentId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Meta" json
);

CREATE INDEX "document_file_parentDocumentId" on risksmart.document_file using btree ("ParentDocumentId");

CREATE UNIQUE INDEX "document_file_fileId" on risksmart.document_file using btree ("FileId");

create table risksmart.document_file_status ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.document_file_status ("Value", "Comment")
VALUES ('archived', 'Archived'),
    ('draft', 'Draft'),
    ('published', 'Published');

ALTER TABLE risksmart.document_file
ADD CONSTRAINT "DocumentFile_Status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.document_file_status("Value");

CREATE TABLE risksmart.document_file_audit(
    "Id" uuid NOT NULL,
    "Version" text NOT NULL,
    "FileId" uuid NOT NULL,
    "Summary" text NULL,
    "Status" text NOT NULL,
    "ReasonForReview" text NULL,
    "ReviewedBy" text NULL,
    "ReviewDate" timestamp with time zone NULL,
    "NextReviewDate" timestamp with time zone NULL,
    "ParentDocumentId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Meta" json,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.document_file_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_file_audit(
        "Id",
        "Version",
        "FileId",
        "Summary",
        "Status",
        "ReasonForReview",
        "ReviewedBy",
        "ReviewDate",
        "NextReviewDate",
        "ParentDocumentId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action"
    )
values (
        nr."Id",
        nr."Version",
        nr."FileId",
        nr."Summary",
        nr."Status",
        nr."ReasonForReview",
        nr."ReviewedBy",
        nr."ReviewDate",
        nr."NextReviewDate",
        nr."ParentDocumentId",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER document_file_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document_file FOR EACH ROW EXECUTE FUNCTION risksmart.document_file_modified();

create table risksmart.parent_type ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('appetite', 'Appetite'),
    ('action_update', 'Action Update'),
    ('action', 'Action'),
    ('issue', 'Issue'),
    ('acceptance', 'Acceptance'),
    ('issue_update', 'Issue Update'),
    ('test_result', 'Test Result'),
    ('obligation_assessment', 'Obligation Assessment'),
    ('document', 'Document'),
    (
        'document_assessment',
        'Document Assessment'
    );

ALTER TABLE risksmart.relation_file
ADD CONSTRAINT "RelationFile_ParentType_fkey" FOREIGN KEY ("ParentType") REFERENCES risksmart.parent_type("Value");

ALTER TABLE risksmart.relation_file DROP CONSTRAINT ParentType_check;
CREATE TABLE IF NOT EXISTS risksmart.custom_attribute_schema (
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "Title" text NOT NULL,
    "Schema" JSONB NOT NULL,
    "UiSchema" JSONB NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE IF NOT EXISTS risksmart.custom_attribute_schema_parent (
    "CustomAttributeSchemaId" uuid NOT NULL,
    "ParentType" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

ALTER TABLE risksmart.custom_attribute_schema_parent
ADD CONSTRAINT "CustomAttributeSchemaParent_ParentType_fkey" FOREIGN KEY ("ParentType") REFERENCES risksmart.parent_type("Value");

/** audit tables and triggers **/
/** custom_attribute_schema_parent audit tbl **/
CREATE TABLE IF NOT EXISTS risksmart.custom_attribute_schema_parent_audit (LIKE risksmart.custom_attribute_schema_parent);

ALTER TABLE risksmart.custom_attribute_schema_parent_audit
ADD PRIMARY KEY ("CustomAttributeSchemaId", "ModifiedAtTimestamp");

ALTER TABLE risksmart.custom_attribute_schema_parent_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.custom_attribute_schema_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.custom_attribute_schema_parent_audit(
        "CustomAttributeSchemaId",
        "ParentType",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."CustomAttributeSchemaId",
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

CREATE TRIGGER custom_attribute_schema_parent_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.custom_attribute_schema_parent FOR EACH ROW EXECUTE FUNCTION risksmart.custom_attribute_schema_parent_modified();

/** custom_attribute_schema audit tbl **/
CREATE TABLE IF NOT EXISTS risksmart.custom_attribute_schema_audit (LIKE risksmart.custom_attribute_schema);

ALTER TABLE risksmart.custom_attribute_schema_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.custom_attribute_schema_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.custom_attribute_schema_modified() RETURNS trigger AS $body$
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

insert into risksmart.custom_attribute_schema_audit(
        "Id",
        "Title",
        "Schema",
        "UiSchema",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Title",
        nr."Schema",
        nr."UiSchema",
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

CREATE TRIGGER custom_attribute_schema_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.custom_attribute_schema FOR EACH ROW EXECUTE FUNCTION risksmart.custom_attribute_schema_modified();
ALTER TABLE risksmart.consequence
ALTER COLUMN "CostValue" type decimal(10, 2);
ALTER TABLE risksmart.consequence_audit
ALTER COLUMN "CostValue" type decimal(10, 2);
ALTER TABLE risksmart.obligation
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.obligation_audit
ADD COLUMN "CustomAttributeData" JSONB;

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
        "Owner",
        "Description",
        "Interpretation",
        "Adherence",
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
        nr."ParentId",
        nr."Title",
        nr."Owner",
        nr."Description",
        nr."Interpretation",
        nr."Adherence",
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

CREATE TABLE auth.user_status ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO auth.user_status ("Value", "Comment")
VALUES ('active', 'Active'),
    ('archived', 'Archived');

ALTER TABLE auth.user
ADD CONSTRAINT "User_status_fkey" FOREIGN KEY ("Status") REFERENCES auth.user_status("Value");

CREATE OR REPLACE VIEW risksmart.user_view_active AS
SELECT "user"."Id",
    "user"."FirstName",
    "user"."LastName",
    "user"."Email",
    "user"."UserName",
    "user"."BusinessUnit_Id",
    "user"."RoleKey",
    o."OrgKey",
    "user"."Status"
FROM auth.user
    JOIN auth.organisationuser o ON "user"."Id" = o."User_Id"
ORDER BY "user"."Email" DESC;

UPDATE auth.user
SET "Status" = 'active';

ALTER TABLE auth.user
ALTER COLUMN "Status"
SET NOT NULL;

ALTER TABLE auth.user
ALTER COLUMN "Status"
SET DEFAULT 'active';
ALTER TABLE risksmart.acceptance
ADD CONSTRAINT "acceptance_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.tag_type
ADD CONSTRAINT "tag_type_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.tag
ADD CONSTRAINT "tag_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.risk_assessment
ADD CONSTRAINT "risk_assessment_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.risk
ADD CONSTRAINT "risk_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.department
ADD CONSTRAINT "department_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.appetite
ADD CONSTRAINT "appetite_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.test_result
ADD CONSTRAINT "test_result_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.issue_action
ADD CONSTRAINT "issue_action_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.action
ADD CONSTRAINT "action_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.control_action
ADD CONSTRAINT "control_action_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.action_update
ADD CONSTRAINT "action_update_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.risk_action
ADD CONSTRAINT "risk_action_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.issue
ADD CONSTRAINT "issue_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.issue_update
ADD CONSTRAINT "issue_update_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.cause
ADD CONSTRAINT "cause_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT "issue_assessment_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.relation_file
ADD CONSTRAINT "relation_file_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.control_group
ADD CONSTRAINT "control_group_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.consequence
ADD CONSTRAINT "consequence_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.obligation
ADD CONSTRAINT "obligation_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.obligation_impact
ADD CONSTRAINT "obligation_impact_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.department_type
ADD CONSTRAINT "department_type_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.obligation_assessment
ADD CONSTRAINT "obligation_assessment_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.file
ADD CONSTRAINT "file_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.user_group
ADD CONSTRAINT "user_group_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.control
ADD CONSTRAINT "control_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.obligation_action
ADD CONSTRAINT "obligation_action_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.obligation_issue
ADD CONSTRAINT "obligation_issue_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.indicator
ADD CONSTRAINT "indicator_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.risk_indicator
ADD CONSTRAINT "risk_indicator_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.control_indicator
ADD CONSTRAINT "control_indicator_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.indicator_result
ADD CONSTRAINT "indicator_result_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.document
ADD CONSTRAINT "document_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.document_linked_document
ADD CONSTRAINT "document_linked_document_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.document_action
ADD CONSTRAINT "document_action_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.document_issue
ADD CONSTRAINT "document_issue_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.document_assessment
ADD CONSTRAINT "document_assessment_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.document_file
ADD CONSTRAINT "document_file_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");
ALTER TABLE risksmart.acceptance
ADD CONSTRAINT "acceptance_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.tag_type
ADD CONSTRAINT "tag_type_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.tag
ADD CONSTRAINT "tag_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.risk_assessment
ADD CONSTRAINT "risk_assessment_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.risk
ADD CONSTRAINT "risk_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.department
ADD CONSTRAINT "department_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.appetite
ADD CONSTRAINT "appetite_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.test_result
ADD CONSTRAINT "test_result_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue_action
ADD CONSTRAINT "issue_action_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.action
ADD CONSTRAINT "action_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.control_action
ADD CONSTRAINT "control_action_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.action_update
ADD CONSTRAINT "action_update_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.risk_action
ADD CONSTRAINT "risk_action_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue
ADD CONSTRAINT "issue_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue_update
ADD CONSTRAINT "issue_update_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.cause
ADD CONSTRAINT "cause_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT "issue_assessment_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.relation_file
ADD CONSTRAINT "relation_file_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.control_group
ADD CONSTRAINT "control_group_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.consequence
ADD CONSTRAINT "consequence_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation
ADD CONSTRAINT "obligation_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_impact
ADD CONSTRAINT "obligation_impact_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.department_type
ADD CONSTRAINT "department_type_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_assessment
ADD CONSTRAINT "obligation_assessment_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.file
ADD CONSTRAINT "file_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.user_group
ADD CONSTRAINT "user_group_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.control
ADD CONSTRAINT "control_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_action
ADD CONSTRAINT "obligation_action_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_issue
ADD CONSTRAINT "obligation_issue_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.indicator
ADD CONSTRAINT "indicator_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.risk_indicator
ADD CONSTRAINT "risk_indicator_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.control_indicator
ADD CONSTRAINT "control_indicator_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.indicator_result
ADD CONSTRAINT "indicator_result_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document
ADD CONSTRAINT "document_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_linked_document
ADD CONSTRAINT "document_linked_document_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_action
ADD CONSTRAINT "document_action_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_issue
ADD CONSTRAINT "document_issue_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_assessment
ADD CONSTRAINT "document_assessment_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_file
ADD CONSTRAINT "document_file_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");
ALTER TABLE risksmart.acceptance
ADD CONSTRAINT "acceptance_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.tag_type
ADD CONSTRAINT "tag_type_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.tag
ADD CONSTRAINT "tag_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.risk_assessment
ADD CONSTRAINT "risk_assessment_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.risk
ADD CONSTRAINT "risk_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.department
ADD CONSTRAINT "department_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.appetite
ADD CONSTRAINT "appetite_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.test_result
ADD CONSTRAINT "test_result_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue_action
ADD CONSTRAINT "issue_action_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.action
ADD CONSTRAINT "action_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.control_action
ADD CONSTRAINT "control_action_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.action_update
ADD CONSTRAINT "action_update_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.risk_action
ADD CONSTRAINT "risk_action_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue
ADD CONSTRAINT "issue_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue_update
ADD CONSTRAINT "issue_update_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.cause
ADD CONSTRAINT "cause_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT "issue_assessment_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.relation_file
ADD CONSTRAINT "relation_file_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.control_group
ADD CONSTRAINT "control_group_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.consequence
ADD CONSTRAINT "consequence_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation
ADD CONSTRAINT "obligation_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_impact
ADD CONSTRAINT "obligation_impact_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.department_type
ADD CONSTRAINT "department_type_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_assessment
ADD CONSTRAINT "obligation_assessment_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.file
ADD CONSTRAINT "file_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.user_group
ADD CONSTRAINT "user_group_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.control
ADD CONSTRAINT "control_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_action
ADD CONSTRAINT "obligation_action_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_issue
ADD CONSTRAINT "obligation_issue_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.indicator
ADD CONSTRAINT "indicator_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.risk_indicator
ADD CONSTRAINT "risk_indicator_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.control_indicator
ADD CONSTRAINT "control_indicator_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.indicator_result
ADD CONSTRAINT "indicator_result_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document
ADD CONSTRAINT "document_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_linked_document
ADD CONSTRAINT "document_linked_document_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_action
ADD CONSTRAINT "document_action_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_issue
ADD CONSTRAINT "document_issue_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_assessment
ADD CONSTRAINT "document_assessment_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_file
ADD CONSTRAINT "document_file_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");
ALTER TABLE risksmart.acceptance
ADD CONSTRAINT "acceptance_ApprovedByUser_fkey" FOREIGN KEY ("ApprovedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.acceptance
ADD CONSTRAINT "acceptance_RequestedByUser_fkey" FOREIGN KEY ("RequestedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.action
ADD CONSTRAINT "action_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.control
ADD CONSTRAINT "control_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document
ADD CONSTRAINT "document_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_assessment
ADD CONSTRAINT "document_assessment_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_assessment
ADD CONSTRAINT "document_assessment_CompletedBy_fkey" FOREIGN KEY ("CompletedBy") REFERENCES auth.user("Id");

ALTER TABLE risksmart.document_file
ADD CONSTRAINT "document_file_ReviewedBy_fkey" FOREIGN KEY ("ReviewedBy") REFERENCES auth.user("Id");

ALTER TABLE risksmart.indicator
ADD CONSTRAINT "indicator_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT "issue_assessment_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT "issue_assessment_PolicyOwner_fkey" FOREIGN KEY ("PolicyOwner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT "issue_assessment_CertifiedIndividual_fkey" FOREIGN KEY ("CertifiedIndividual") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation
ADD CONSTRAINT "obligation_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_assessment
ADD CONSTRAINT "obligation_assessment_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.obligation_assessment
ADD CONSTRAINT "obligation_assessment_CompletedBy_fkey" FOREIGN KEY ("CompletedBy") REFERENCES auth.user("Id");

ALTER TABLE risksmart.risk
ADD CONSTRAINT "risk_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES auth.user("Id");

ALTER TABLE risksmart.test_result
ADD CONSTRAINT "test_result_Submitter_fkey" FOREIGN KEY ("Submitter") REFERENCES auth.user("Id");
-- Helper function to count how many records are referencing a primary key (fks required)
CREATE OR REPLACE FUNCTION risksmart.count_references(
        master regclass,
        pkey_value text,
        OUT "table" regclass,
        OUT count integer,
        OUT fk text
    ) RETURNS SETOF record LANGUAGE 'plpgsql' VOLATILE AS $BODY$
declare x record;

-- constraint info for each table in question that references master
sql text;

-- temporary buffer
begin for x in
select conrelid,
    attname
from pg_constraint
    join pg_attribute on conrelid = attrelid
    and attnum = conkey [1]
where contype = 'f'
    and confrelid = master
    and confkey =(
        -- here we assume that FK references master's PK
        select conkey
        from pg_constraint
        where conrelid = master
            and contype = 'p'
    ) loop "table" = x.conrelid;

"fk" = x.attname;

sql = format(
    'select count(*) from only %s where %I=$1',
    "table",
    x.attname
);

execute sql into "count" using pkey_value;

return next;

end loop;

end $BODY$;
CREATE TABLE risksmart.counter(
    "OrgKey" text NOT NULL,
    "Name" text NOT NULL,
    "LastValue" integer NOT NULL,
    primary key ("OrgKey", "Name")
);

ALTER TABLE risksmart.counter
ADD CONSTRAINT "Counter_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

CREATE OR REPLACE FUNCTION risksmart.getNextCounterValue(orgKey text, tableName text) RETURNS INT LANGUAGE plpgsql AS $$
DECLARE next_val INT;

BEGIN
INSERT INTO risksmart.counter("OrgKey", "Name", "LastValue")
VALUES (orgKey, tableName, 1) ON CONFLICT ("OrgKey", "Name") DO
UPDATE
SET "LastValue" = risksmart.counter."LastValue" + 1
RETURNING "LastValue" INTO next_val;

RETURN next_val;

END $$;

INSERT INTO risksmart.counter("OrgKey", "Name", "LastValue")
SELECT replace(s.sequencename, 'seq_issue_', ''),
    'issue',
    s.last_value
FROM pg_sequences s
WHERE s.schemaname = 'risksmart'
    AND s.sequencename like 'seq_issue_%';
insert into risksmart."parent_type" ("Value", "Comment") values 
  ('risk', 'Risk'),
  ('obligation', 'Obligation'),
  ('control', 'Control'),
  ('indicator', 'Indicator'),
  ('obligation_impact', 'Obligation Impact');
CREATE TABLE risksmart.document_file_type ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.document_file_type ("Value", "Comment")
VALUES ('link', 'Link'),
    ('file', 'File'),
    ('html', 'Html');

ALTER TABLE risksmart.document_file
ADD COLUMN "Content" text null;

ALTER TABLE risksmart.document_file
ADD COLUMN "Type" text not null default 'file';

ALTER TABLE risksmart.document_file
ADD COLUMN "Link" text null;

ALTER TABLE risksmart.document_file_audit
ADD COLUMN "Content" text null;

ALTER TABLE risksmart.document_file_audit
ADD COLUMN "Type" text not null default 'file';

ALTER TABLE risksmart.document_file_audit
ADD COLUMN "Link" text null;

ALTER TABLE risksmart.document_file
ALTER COLUMN "FileId" DROP NOT NULL;

ALTER TABLE risksmart.document_file_audit
ALTER COLUMN "FileId" DROP NOT NULL;

ALTER TABLE risksmart.document_file
ADD CONSTRAINT "DocumentFile_type_fkey" FOREIGN KEY ("Type") REFERENCES risksmart.document_file_type("Value");

CREATE OR REPLACE FUNCTION risksmart.document_file_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_file_audit(
        "Id",
        "Version",
        "FileId",
        "Summary",
        "Status",
        "ReasonForReview",
        "ReviewedBy",
        "ReviewDate",
        "NextReviewDate",
        "ParentDocumentId",
        "Content",
        "Type",
        "Link",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action"
    )
values (
        nr."Id",
        nr."Version",
        nr."FileId",
        nr."Summary",
        nr."Status",
        nr."ReasonForReview",
        nr."ReviewedBy",
        nr."ReviewDate",
        nr."NextReviewDate",
        nr."ParentDocumentId",
        nr."Content",
        nr."Type",
        nr."Link",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
-- Should we add a resolved flag or status?
CREATE TABLE risksmart.conversation(
    "Id" uuid not null primary key default gen_random_uuid(),
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp()
);

ALTER TABLE risksmart.conversation
ADD CONSTRAINT "conversation_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.conversation
ADD CONSTRAINT "conversation_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.conversation
ADD CONSTRAINT "conversation_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

CREATE TABLE risksmart.conversation_audit(
    "Id" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.conversation_modified() RETURNS trigger AS $body$
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

insert into risksmart.conversation_audit(
        "Id",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
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

CREATE TRIGGER conversation_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.conversation FOR EACH ROW EXECUTE FUNCTION risksmart.conversation_modified();

CREATE TABLE risksmart.comment (
    "Id" uuid not null primary key default gen_random_uuid(),
    "ConversationId" uuid not null,
    "Content" text not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp()
);

ALTER TABLE risksmart.comment
ADD CONSTRAINT "comment_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.comment
ADD CONSTRAINT "comment_ConversationId_fkey" FOREIGN KEY ("ConversationId") REFERENCES risksmart.conversation("Id");

ALTER TABLE risksmart.comment
ADD CONSTRAINT "comment_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.comment
ADD CONSTRAINT "comment_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

CREATE TABLE risksmart.comment_audit (
    "Id" uuid not null,
    "ConversationId" uuid not null,
    "Content" text not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.comment_modified() RETURNS trigger AS $body$
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

insert into risksmart.comment_audit(
        "Id",
        "ConversationId",
        "Content",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ConversationId",
        nr."Content",
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

CREATE TRIGGER comment_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.comment FOR EACH ROW EXECUTE FUNCTION risksmart.comment_modified();
ALTER TABLE risksmart.conversation
ADD COLUMN "IsResolved" boolean default false;

ALTER TABLE risksmart.conversation_audit
ADD COLUMN "IsResolved" boolean default false;

CREATE OR REPLACE FUNCTION risksmart.conversation_modified() RETURNS trigger AS $body$
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

insert into risksmart.conversation_audit(
        "Id",
        "IsResolved",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."IsResolved",
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

/** obligation assessment **/
ALTER TABLE risksmart.obligation_assessment
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.obligation_assessment_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.obligation_assessment_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_assessment_audit(
        "Id",
        "CustomAttributeData",
        "ParentObligationId",
        "Title",
        "Summary",
        "TargetCompletionDate",
        "ActualCompletionDate",
        "StartDate",
        "Status",
        "Owner",
        "Result",
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
        nr."ParentObligationId",
        nr."Title",
        nr."Summary",
        nr."TargetCompletionDate",
        nr."ActualCompletionDate",
        nr."StartDate",
        nr."Status",
        nr."Owner",
        nr."Result",
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

/** obligation impact **/
ALTER TABLE risksmart.obligation_impact
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.obligation_impact_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.obligation_impact_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_impact_audit(
        "Id",
        "CustomAttributeData",
        "ParentObligationId",
        "Description",
        "ImpactRating",
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
        nr."ParentObligationId",
        nr."Description",
        nr."ImpactRating",
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
insert into risksmart."parent_type" ("Value", "Comment") values 
  ('risk_controlled_assessment', 'Risk Controlled Assessment'),
  ('risk_uncontrolled_assessment', 'Risk Uncontrolled Assessment');

ALTER TABLE risksmart.risk
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.risk_audit
ADD COLUMN "CustomAttributeData" JSONB;


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
        "Owner",
        "Tier",
        "ParentRiskId",
        "Description",
        "Meta",
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
        nr."Title",
        nr."Owner",
        nr."Tier",
        nr."ParentRiskId",
        nr."Description",
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

$body$ LANGUAGE plpgsql;

/** risk assessment **/

ALTER TABLE risksmart.risk_assessment
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.risk_assessment_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.risk_assessment_modified() RETURNS trigger AS $body$
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

insert into risksmart.risk_assessment_audit(
        "ParentId",
        "CustomAttributeData",
        "ControlType",
        "Likelihood",
        "Impact",
        "Rating",
        "Description",
        "NextTestDate",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentId",
        nr."CustomAttributeData",
        nr."ControlType",
        nr."Likelihood",
        nr."Impact",
        nr."Rating",
        nr."Description",
        nr."NextTestDate",
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

$body$ LANGUAGE plpgsql;

/** acceptance **/

ALTER TABLE risksmart.acceptance
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.acceptance_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.acceptance_modified() RETURNS trigger AS $body$
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

insert into risksmart.acceptance_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "Details",
        "ParentRiskId",
        "Status",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ApprovedByUser",
        "ApprovedByUserGroup",
        "RequestedByUser",
        "RequestedByUserGroup"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."DateAcceptedFrom",
        nr."DateAcceptedTo",
        nr."Details",
        nr."ParentRiskId",
        nr."Status",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."ApprovedByUser",
        nr."ApprovedByUserGroup",
        nr."RequestedByUser",
        nr."RequestedByUserGroup"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

/** appetite **/

ALTER TABLE risksmart.appetite
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.appetite_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.appetite_modified() RETURNS trigger AS $body$
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

insert into risksmart.appetite_audit(
        "Id",
        "CustomAttributeData",
        "LowerAppetite",
        "UpperAppetite",
        "Statement",
        "ParentRiskId",
        "Meta",
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
        nr."LowerAppetite",
        nr."UpperAppetite",
        nr."Statement",
        nr."ParentRiskId",
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

$body$ LANGUAGE plpgsql;




ALTER TABLE risksmart.action
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.action_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.action_modified() RETURNS trigger AS $body$
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

insert into risksmart.action_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Owner",
        "DateRaised",
        "DateDue",
        "Status",
        "Priority",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ClosedDate",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Owner",
        nr."DateRaised",
        nr."DateDue",
        nr."Status",
        nr."Priority",
        nr."Description",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."ClosedDate",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

/** action update **/
ALTER TABLE risksmart.action_update
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.action_update_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.action_update_modified() RETURNS trigger AS $body$
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

insert into risksmart.action_update_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "ParentActionId",
        "Meta",
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
        nr."Title",
        nr."Description",
        nr."ParentActionId",
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

$body$ LANGUAGE plpgsql;

insert into risksmart."parent_type" ("Value", "Comment") values 
  ('control_group', 'Control Group');

ALTER TABLE risksmart.control
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.control_audit
ADD COLUMN "CustomAttributeData" JSONB;

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
        "Owner",
        "Description",
        "Type",
        "ParentRiskId",
        "ParentObligationId",
        "GroupId",
        "Meta",
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
        nr."Title",
        nr."Owner",
        nr."Description",
        nr."Type",
        nr."ParentRiskId",
        nr."ParentObligationId",
        nr."GroupId",
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

$body$ LANGUAGE plpgsql;

/** control group **/

ALTER TABLE risksmart.control_group
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.control_group_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.control_group_modified() RETURNS trigger AS $body$
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

insert into risksmart.control_group_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Owner",
        "Meta",
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
        nr."Title",
        nr."Description",
        nr."Owner",
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

$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.test_result
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.test_result_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.test_result_modified() RETURNS trigger AS $body$
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

insert into risksmart.test_result_audit(
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
        "Meta",
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

$body$ LANGUAGE plpgsql;
insert into risksmart."parent_type" ("Value", "Comment") values 
  ('indicator_result', 'Indicator Result');

  ALTER TABLE risksmart.indicator
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.indicator_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.indicator_modified() RETURNS trigger AS $body$
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

insert into risksmart.indicator_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Owner",
        "Description",
        "Type",
        "TestFrequency",
        "Unit",
        "UpperToleranceNum",
        "LowerToleranceNum",
        "TargetValueTxt",    
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
        nr."Title",
        nr."Owner",
        nr."Description",
        nr."Type",
        nr."TestFrequency",
        nr."Unit",
        nr."UpperToleranceNum",
        nr."LowerToleranceNum",
        nr."TargetValueTxt",
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

/** indicator result **/

ALTER TABLE risksmart.indicator_result
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.indicator_result_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.indicator_result_modified() RETURNS trigger AS $body$
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

insert into risksmart.indicator_result_audit(
        "Id",
        "CustomAttributeData",
        "IndicatorId",
        "Description",
        "ResultDate",
        "TargetValueTxt",
        "TargetValueNum", 
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
        nr."IndicatorId",
        nr."Description",
        nr."ResultDate",
        nr."TargetValueTxt",
        nr."TargetValueNum",
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
/*** fixes incorrect function update **/
CREATE OR REPLACE FUNCTION risksmart.indicator_result_modified() RETURNS trigger AS $body$
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

insert into risksmart.indicator_result_audit(
        "Id",
        "CustomAttributeData",
        "IndicatorId",
        "Description",
        "ResultDate",
        "TargetValueTxt",
        "TargetValueNum", 
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
        nr."IndicatorId",
        nr."Description",
        nr."ResultDate",
        nr."TargetValueTxt",
        nr."TargetValueNum",
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



/** fixes rick audit func **/
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
        "Owner",
        "Tier",
        "ParentRiskId",
        "Description",
        "Meta",
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
        nr."Title",
        nr."Owner",
        nr."Tier",
        nr."ParentRiskId",
        nr."Description",
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

$body$ LANGUAGE plpgsql;
insert into risksmart."parent_type" ("Value", "Comment") values 
  ('issue_assessment', 'Issue Assessment'),
  ('cause', 'Cause'),
  ('consequence', 'Consequence');

ALTER TABLE risksmart.issue
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.issue_audit
ADD COLUMN "CustomAttributeData" JSONB;

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
        "SequentialId"
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
        nr."SequentialId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

/** issue update **/

ALTER TABLE risksmart.issue_update
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.issue_update_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.issue_update_modified() RETURNS trigger AS $body$
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

insert into risksmart.issue_update_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "ParentIssueId",
        "Meta",
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
        nr."Title",
        nr."Description",
        nr."ParentIssueId",
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

$body$ LANGUAGE plpgsql;

/** issue assessment **/

ALTER TABLE risksmart.issue_assessment
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.issue_assessment_audit
ADD COLUMN "CustomAttributeData" JSONB;

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
        "Owner",
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
        "AssociatedControlId",
        "Meta",
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
        nr."Owner",
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
        nr."AssociatedControlId",
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

$body$ LANGUAGE plpgsql;

/** cause **/

ALTER TABLE risksmart.cause
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.cause_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.cause_modified() RETURNS trigger AS $body$
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

insert into risksmart.cause_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Significance",
        "ParentIssueId",
        "Meta",
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
        nr."Title",
        nr."Description",
        nr."Significance",
        nr."ParentIssueId",
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

$body$ LANGUAGE plpgsql;

/** consequence **/

ALTER TABLE risksmart.consequence
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.consequence_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.consequence_modified() RETURNS trigger AS $body$
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

insert into risksmart.consequence_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Criticality",
        "CostType",
        "CostValue",
        "ParentIssueId",
        "Meta",
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
        nr."Title",
        nr."Description",
        nr."Criticality",
        nr."CostType",
        nr."CostValue",
        nr."ParentIssueId",
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

$body$ LANGUAGE plpgsql;


ALTER TABLE risksmart.document
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.document_audit
ADD COLUMN "CustomAttributeData" JSONB;

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
        "Owner",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."DocumentType",
        nr."Purpose",
        nr."ParentDocument",
        nr."Owner",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

/** document assessment **/

ALTER TABLE risksmart.document_assessment
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.document_assessment_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.document_assessment_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_assessment_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Summary",
        "TargetCompletionDate",
        "ActualCompletionDate",
        "StartDate",
        "Status",
        "Owner",
        "Result",
        "CompletedBy",
        "ParentDocumentId",
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
        nr."Title",
        nr."Summary",
        nr."TargetCompletionDate",
        nr."ActualCompletionDate",
        nr."StartDate",
        nr."Status",
        nr."Owner",
        nr."Result",
        nr."CompletedBy",
        nr."ParentDocumentId",
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


CREATE TABLE IF NOT EXISTS risksmart.taxonomy (
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "Description" text NOT NULL,
    "Common" JSONB NOT NULL,
    "Library" JSONB NOT NULL,
    "Rating" JSONB NOT NULL,
    "Taxonomy" JSONB NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE IF NOT EXISTS risksmart.taxonomy_org (
  "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
  "TaxonomyId" uuid NOT NULL,
  "Locale" text NOT NULL,
  "OrgName" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE UNIQUE INDEX "idx_taxonomy_org" on risksmart.taxonomy_org using btree ("OrgName", "Locale");

/** taxonomy audit **/

CREATE TABLE IF NOT EXISTS risksmart.taxonomy_audit (LIKE risksmart.taxonomy);

ALTER TABLE risksmart.taxonomy_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.taxonomy_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.taxonomy_modified() RETURNS trigger AS $body$
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

insert into risksmart.taxonomy_audit(
        "Id",
        "Description",
        "Common",
        "Library",
        "Rating",
        "Taxonomy",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Description",
        nr."Common",
        nr."Library",
        nr."Rating",
        nr."Taxonomy",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER taxonomy_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.taxonomy FOR EACH ROW EXECUTE FUNCTION risksmart.taxonomy_modified();


/** taxonomy org audit **/

CREATE TABLE IF NOT EXISTS risksmart.taxonomy_org_audit (LIKE risksmart.taxonomy_org);

ALTER TABLE risksmart.taxonomy_org_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.taxonomy_org_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.taxonomy_org_modified() RETURNS trigger AS $body$
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

insert into risksmart.taxonomy_org_audit(
        "Id",
        "TaxonomyId",
        "OrgName",
        "Locale",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."TaxonomyId",
        nr."OrgName",
        nr."Locale",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER taxonomy_org_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.taxonomy_org FOR EACH ROW EXECUTE FUNCTION risksmart.taxonomy_org_modified();

CREATE TABLE risksmart.contributor (
    "ParentId" uuid NOT NULL,
    "UserId" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    primary key ("ParentId", "UserId")
);

CREATE TABLE risksmart.contributor_audit (
    "ParentId" uuid NOT NULL,
    "UserId" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentId", "UserId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.contributor
ADD CONSTRAINT "contributor_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.contributor
ADD CONSTRAINT "contributor_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.contributor
ADD CONSTRAINT "contributor_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.contributor
ADD CONSTRAINT "contributor_userId_fkey" FOREIGN KEY ("UserId") REFERENCES auth.user("Id");

CREATE OR REPLACE FUNCTION risksmart.contributor_modified() RETURNS trigger AS $body$
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

insert into risksmart.contributor_audit(
        "ParentId",
        "UserId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentId",
        nr."UserId",
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

CREATE TRIGGER contributor_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.contributor FOR EACH ROW EXECUTE FUNCTION risksmart.contributor_modified();
CREATE TABLE risksmart.owner (
    "ParentId" uuid NOT NULL,
    "UserId" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    primary key ("ParentId", "UserId")
);

CREATE TABLE risksmart.owner_audit (
    "ParentId" uuid NOT NULL,
    "UserId" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentId", "UserId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.owner
ADD CONSTRAINT "owner_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.owner
ADD CONSTRAINT "owner_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.owner
ADD CONSTRAINT "owner_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.owner
ADD CONSTRAINT "owner_userId_fkey" FOREIGN KEY ("UserId") REFERENCES auth.user("Id");

CREATE OR REPLACE FUNCTION risksmart.owner_modified() RETURNS trigger AS $body$
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

insert into risksmart.owner_audit(
        "ParentId",
        "UserId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentId",
        nr."UserId",
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

CREATE TRIGGER owner_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.owner FOR EACH ROW EXECUTE FUNCTION risksmart.owner_modified();
INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."Id",
    o."Owner",
    o."OrgKey",
    o."CreatedByUser",
    o."ModifiedByUser",
    o."ModifiedAtTimestamp",
    o."CreatedAtTimestamp"
FROM risksmart.action o
WHERE o."Owner" IS NOT NULL;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."Owner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.action_audit o
        )
    ) a
where coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
    AND a."Owner" IS NOT NULL ON CONFLICT DO NOTHING;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."PreviousOwner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.action_audit o
        )
    ) a
where (
        coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousOwner" IS NOT NULL ON CONFLICT DO NOTHING;

ALTER TABLE risksmart.action DROP COLUMN "Owner";

ALTER TABLE risksmart.action_audit DROP COLUMN "Owner";

CREATE OR REPLACE FUNCTION risksmart.action_modified() RETURNS trigger AS $body$
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

insert into risksmart.action_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "DateRaised",
        "DateDue",
        "Status",
        "Priority",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ClosedDate",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."DateRaised",
        nr."DateDue",
        nr."Status",
        nr."Priority",
        nr."Description",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."ClosedDate",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."Id",
    o."Owner",
    o."OrgKey",
    o."CreatedByUser",
    o."ModifiedByUser",
    o."ModifiedAtTimestamp",
    o."CreatedAtTimestamp"
FROM risksmart.obligation o
WHERE o."Owner" IS NOT NULL;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."Owner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.obligation_audit o
        )
    ) a
where coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
    AND a."Owner" IS NOT NULL ON CONFLICT DO NOTHING;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."PreviousOwner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.obligation_audit o
        )
    ) a
where (
        coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousOwner" IS NOT NULL ON CONFLICT DO NOTHING;

ALTER TABLE risksmart.obligation DROP COLUMN "Owner";

ALTER TABLE risksmart.obligation_audit DROP COLUMN "Owner";

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
        "Action"
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
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."Id",
    o."Owner",
    o."OrgKey",
    o."CreatedByUser",
    o."ModifiedByUser",
    o."ModifiedAtTimestamp",
    o."CreatedAtTimestamp"
FROM risksmart.risk o
WHERE o."Owner" IS NOT NULL;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."Owner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.risk_audit o
        )
    ) a
where coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
    AND a."Owner" IS NOT NULL ON CONFLICT DO NOTHING;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."PreviousOwner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.risk_audit o
        )
    ) a
where (
        coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousOwner" IS NOT NULL ON CONFLICT DO NOTHING;

ALTER TABLE risksmart.risk DROP COLUMN "Owner";

ALTER TABLE risksmart.risk_audit DROP COLUMN "Owner";

/** fixes rick audit func **/
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
        "Action"
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
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."Id",
    o."Owner",
    o."OrgKey",
    o."CreatedByUser",
    o."ModifiedByUser",
    o."ModifiedAtTimestamp",
    o."CreatedAtTimestamp"
FROM risksmart.control o
WHERE o."Owner" IS NOT NULL;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."Owner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.control_audit o
        )
    ) a
where coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
    AND a."Owner" IS NOT NULL ON CONFLICT DO NOTHING;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."PreviousOwner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.control_audit o
        )
    ) a
where (
        coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousOwner" IS NOT NULL ON CONFLICT DO NOTHING;

ALTER TABLE risksmart.control DROP COLUMN "Owner";

ALTER TABLE risksmart.control_audit DROP COLUMN "Owner";

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
        "ParentRiskId",
        "ParentObligationId",
        "GroupId",
        "Meta",
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
        nr."Title",
        nr."Description",
        nr."Type",
        nr."ParentRiskId",
        nr."ParentObligationId",
        nr."GroupId",
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

$body$ LANGUAGE plpgsql;
CREATE TABLE
    "risksmart"."risk_treatment_type" (
        "Value" text NOT NULL,
        "Comment" text NOT NULL,
        PRIMARY KEY ("Value"),
        UNIQUE ("Value")
    );

INSERT INTO
    "risksmart"."risk_treatment_type" ("Value", "Comment")
VALUES
    ('treat', 'Treat'),
    ('tolerate', 'Tolerate'),
    ('transfer', 'Transfer'),
    ('terminate', 'Terminate');

alter table "risksmart"."risk"
add column "Treatment" text null;

ALTER TABLE "risksmart"."risk" ADD CONSTRAINT "Risk_Treatment_fkey" FOREIGN KEY ("Treatment") REFERENCES "risksmart"."risk_treatment_type" ("Value");
INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."Id",
    o."Owner",
    o."OrgKey",
    o."CreatedByUser",
    o."ModifiedByUser",
    o."ModifiedAtTimestamp",
    o."CreatedAtTimestamp"
FROM risksmart.document o
WHERE o."Owner" IS NOT NULL;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."Owner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.document_audit o
        )
    ) a
where coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
    AND a."Owner" IS NOT NULL ON CONFLICT DO NOTHING;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."PreviousOwner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.document_audit o
        )
    ) a
where (
        coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousOwner" IS NOT NULL ON CONFLICT DO NOTHING;

ALTER TABLE risksmart.document DROP COLUMN "Owner";

ALTER TABLE risksmart.document_audit DROP COLUMN "Owner";

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
        "Action"
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
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."Id",
    o."Owner",
    o."OrgKey",
    o."CreatedByUser",
    o."ModifiedByUser",
    o."ModifiedAtTimestamp",
    o."CreatedAtTimestamp"
FROM risksmart.indicator o
WHERE o."Owner" IS NOT NULL;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."Owner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.indicator_audit o
        )
    ) a
where coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
    AND a."Owner" IS NOT NULL ON CONFLICT DO NOTHING;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."PreviousOwner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."Id",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.indicator_audit o
        )
    ) a
where (
        coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousOwner" IS NOT NULL ON CONFLICT DO NOTHING;

ALTER TABLE risksmart.indicator DROP COLUMN "Owner";

ALTER TABLE risksmart.indicator_audit DROP COLUMN "Owner";

CREATE OR REPLACE FUNCTION risksmart.indicator_modified() RETURNS trigger AS $body$
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

insert into risksmart.indicator_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Type",
        "TestFrequency",
        "Unit",
        "UpperToleranceNum",
        "LowerToleranceNum",
        "TargetValueTxt",
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
        nr."Title",
        nr."Description",
        nr."Type",
        nr."TestFrequency",
        nr."Unit",
        nr."UpperToleranceNum",
        nr."LowerToleranceNum",
        nr."TargetValueTxt",
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
CREATE OR REPLACE VIEW risksmart.permission_view AS --  Contributor permissions
SELECT c."ParentId" as "Id",
    c."OrgKey",
    c."UserId"
FROM risksmart.contributor c
UNION
-- Owner permissions
SELECT o."ParentId",
    o."OrgKey",
    o."UserId"
FROM risksmart.owner o;
CREATE TABLE IF NOT EXISTS risksmart.approval_level (
  "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
  "Description" text NOT NULL,
  "SequenceOrder" INT NOT NULL,
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE IF NOT EXISTS risksmart.approval_rule_type (
  "Value" text NOT NULL PRIMARY KEY,
  "Comment" text NOT NULL
);

CREATE TABLE IF NOT EXISTS risksmart.approval_status (
  "Value" text NOT NULL PRIMARY KEY,
  "Comment" text NOT NULL
);

CREATE TABLE IF NOT EXISTS risksmart.approval_rule (
  "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
  "ApprovalLevelId" uuid NOT NULL,
  "ApprovalRuleType" text NOT NULL,
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE IF NOT EXISTS risksmart.document_file_approval (
  "Id" uuid default gen_random_uuid() NOT NULL,
  "DocumentFileId" uuid NOT NULL,
  "Approver" uuid NOT NULL,
  "ApprovalLevelId" uuid NOT NULL,
  "ApprovalStatus" text default 'pending',
  "Comments" text NULL, 
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  PRIMARY KEY ("DocumentFileId", "Approver", "ApprovalLevelId")
);

/** enum table data **/

insert into risksmart."approval_rule_type" ("Value", "Comment") values 
  ('all_approve', 'All approve'),
  ('any_one_approve', 'Any one approval'),
  ('majority_approve', 'Majority approves');


insert into risksmart."approval_status" ("Value", "Comment") values 
  ('approved', 'Approved'),
  ('rejected', 'Rejected'),
  ('pending', 'Pending');

/** indexes **/

CREATE UNIQUE INDEX "idx_approval_rule_level_rule_type" 
on risksmart.approval_rule using btree ("ApprovalLevelId", "ApprovalRuleType");

/** constraints **/

ALTER TABLE risksmart.approval_rule
ADD CONSTRAINT "ApprovalRule_ApprovalRuleType_fkey"
FOREIGN KEY ("ApprovalRuleType") 
REFERENCES risksmart.approval_rule_type("Value");

ALTER TABLE risksmart.document_file_approval
ADD CONSTRAINT "DocumentFileApproval_ApprovalStatus_fkey"
FOREIGN KEY ("ApprovalStatus") 
REFERENCES risksmart.approval_status("Value");


/** approval level audit tbl **/

CREATE TABLE IF NOT EXISTS risksmart.approval_level_audit (LIKE risksmart.approval_level);

ALTER TABLE risksmart.approval_level_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_level_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.approval_level_modified() RETURNS trigger AS $body$
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



insert into risksmart.approval_level_audit(
        "Id",
        "Description",
        "SequenceOrder",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Description",
        nr."SequenceOrder",
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

CREATE TRIGGER approval_level_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval_level FOR EACH ROW EXECUTE FUNCTION risksmart.approval_level_modified();


/** approval rule audit tbl **/

CREATE TABLE IF NOT EXISTS risksmart.approval_rule_audit (LIKE risksmart.approval_rule);

ALTER TABLE risksmart.approval_rule_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_rule_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.approval_rule_modified() RETURNS trigger AS $body$
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



insert into risksmart.approval_rule_audit(
        "Id",
        "ApprovalLevelId",
        "ApprovalRuleType",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ApprovalLevelId",
        nr."ApprovalRuleType",
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

CREATE TRIGGER approval_rule_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval_rule FOR EACH ROW EXECUTE FUNCTION risksmart.approval_rule_modified();

/** document file approval audit tbl **/

CREATE TABLE IF NOT EXISTS risksmart.document_file_approval_audit (LIKE risksmart.document_file_approval);

ALTER TABLE risksmart.document_file_approval_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.document_file_approval_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.document_file_approval_modified() RETURNS trigger AS $body$
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



insert into risksmart.document_file_approval_audit(
        "Id",
        "DocumentFileId",
        "Approver",
        "ApprovalLevelId",
        "ApprovalStatus",
        "Comments",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."DocumentFileId",
        nr."Approver",
        nr."ApprovalLevelId",
        nr."ApprovalStatus",
        mr."Comments",
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

CREATE TRIGGER document_file_approval_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document_file_approval FOR EACH ROW EXECUTE FUNCTION risksmart.document_file_approval_modified();
ALTER TABLE "risksmart"."risk_audit"
ADD COLUMN "Treatment" TEXT;

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
        "Treatment"
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
        nr."Treatment"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION risksmart.get_audit_tables_json() RETURNS TABLE(json_data JSON, object_type TEXT) AS $$
DECLARE table_record RECORD;

query TEXT;

modified_table_name TEXT;

BEGIN FOR table_record IN
SELECT table_schema,
  table_name
FROM information_schema.tables
WHERE table_schema = 'risksmart'
  AND table_name LIKE '%_audit'
  AND table_name not in ('') -- exclude any tables here that you don't want to be shown in the central audit log 
  LOOP modified_table_name := left(
    table_record.table_name,
    length(table_record.table_name) - 6
  );

query := format(
  'SELECT row_to_json(t) AS json_data, %L AS object_type FROM (SELECT * FROM %I.%I) t',
  modified_table_name,
  table_record.table_schema,
  table_record.table_name
);

RETURN QUERY EXECUTE query;

END LOOP;

END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW risksmart.audit_log AS
SELECT json_data->>'Action' AS "Action",
  (json_data->>'ModifiedByUser') AS "ModifiedByUser",
  (json_data->>'ModifiedAtTimestamp')::TIMESTAMPTZ AS "ModifiedAtTimestamp",
  (json_data->>'OrgKey') As "OrgKey",
  json_data AS "ObjectData",
  object_type AS "ObjectType"
FROM risksmart.get_audit_tables_json()
ORDER BY "ModifiedAtTimestamp" DESC;
CREATE TABLE "risksmart"."risk_status_type" (
    "Value" text NOT NULL,
    "Comment" text NOT NULL,
    PRIMARY KEY ("Value"),
    UNIQUE ("Value")
);

INSERT INTO "risksmart"."risk_status_type" ("Value", "Comment")
VALUES ('active', 'Active'),
    ('emerging', 'Emerging'),
    ('retired', 'Retired'),
    ('monitored', 'Monitored');

-- Add status column to risk table
alter table "risksmart"."risk"
add column "Status" text null;

ALTER TABLE "risksmart"."risk"
ADD CONSTRAINT "Risk_Status_fkey" FOREIGN KEY ("Status") REFERENCES "risksmart"."risk_status_type" ("Value");

-- Add status to audit table
ALTER TABLE "risksmart"."risk_audit"
ADD COLUMN "Status" TEXT;

-- Update trigger function with status column
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
        "Status"
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
        nr."Status"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
/** remove document_file_approval tbl **/
DROP TRIGGER IF EXISTS document_file_approval_audit_trigger ON risksmart."document_file_approval";

DROP FUNCTION IF EXISTS risksmart.document_file_approval_modified();

DROP TABLE IF EXISTS risksmart."document_file_approval_audit";

DROP TABLE IF EXISTS risksmart."document_file_approval";

CREATE TABLE IF NOT EXISTS risksmart.approval (
  "Id" uuid default gen_random_uuid() NOT NULL,
  "ParentId" uuid NOT NULL,
  "ParentType" text NOT NULL,
  "Approver" uuid NOT NULL,
  "ApprovalLevelId" uuid NOT NULL,
  "ApprovalStatus" text default 'pending',
  "Comments" text NULL, 
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  PRIMARY KEY ("ParentId", "ParentType", "Approver", "ApprovalLevelId")
);

ALTER TABLE risksmart.approval
ADD CONSTRAINT "Approval_ApprovalStatus_fkey"
FOREIGN KEY ("ApprovalStatus") 
REFERENCES risksmart.approval_status("Value");

ALTER TABLE risksmart.approval
ADD CONSTRAINT "Approval_ParentType_fkey"
FOREIGN KEY ("ParentType") 
REFERENCES risksmart.parent_type("Value");

/** approval audit **/

CREATE TABLE IF NOT EXISTS risksmart.approval_audit (LIKE risksmart.approval);

ALTER TABLE risksmart.approval_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_audit
ADD COLUMN "Action" risksmart.db_action;

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
        "Approver",
        "ApprovalLevelId",
        "ApprovalStatus",
        "Comments",
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
        nr."Approver",
        nr."ApprovalLevelId",
        nr."ApprovalStatus",
        mr."Comments",
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

CREATE TRIGGER approval_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval FOR EACH ROW EXECUTE FUNCTION risksmart.approval_modified();

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" AS "ParentId",
    au."OrgKey"
FROM risksmart.action_update au;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id"
FROM risksmart.action_update au
UNION
SELECT a."Id"
FROM risksmart.action a
UNION
SELECT o."Id"
FROM risksmart.obligation o
UNION
SELECT r."Id"
FROM risksmart.risk r
UNION
SELECT c."Id"
FROM risksmart.control c
UNION
SELECT i."Id"
FROM risksmart.indicator i
UNION
SELECT d."Id"
FROM risksmart.document d;

CREATE OR REPLACE VIEW risksmart.node_ancestor_view AS WITH RECURSIVE flattened_nodes(
        "Id",
        "AncestorId",
        "Depth"
    ) AS (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0
        FROM risksmart.node_view n
        UNION ALL
        SELECT ff."Id",
            f."ParentId" AS "AncestorId",
            (ff."Depth" + 1)
        FROM flattened_nodes ff
            INNER JOIN risksmart.node_parent_view f ON ff."AncestorId" = f."Id"
        WHERE f."ParentId" IS NOT NULL
    )
SELECT fpo."Id",
    fpo."AncestorId",
    fpo."Depth"
FROM flattened_nodes fpo;

CREATE OR REPLACE VIEW risksmart.contributor_view AS --  Contributor permissions
SELECT c."ParentId" as "Id",
    c."OrgKey",
    c."UserId"
FROM risksmart.contributor c
UNION
-- Owner permissions
SELECT o."ParentId",
    o."OrgKey",
    o."UserId"
FROM risksmart.owner o;

CREATE OR REPLACE VIEW risksmart.permission_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId"
FROM risksmart.contributor_view c
    INNER JOIN risksmart.node_ancestor_view na ON na."AncestorId" = c."Id";
/** remove cols from approvals  tbl **/

ALTER TABLE risksmart.approval
DROP COLUMN IF EXISTS "Comments",
DROP COLUMN IF EXISTS "ApprovalStatus";

ALTER TABLE risksmart.approval_audit
DROP COLUMN IF EXISTS "Comments",
DROP COLUMN IF EXISTS "ApprovalStatus";

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
        "Approver",
        "ApprovalLevelId",
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
        nr."Approver",
        nr."ApprovalLevelId",
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

/** add new approval results tbl **/

CREATE TABLE IF NOT EXISTS risksmart.approval_result (
  "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
  "ApprovalId" uuid NOT NULL,
  "ParentId" uuid NOT NULL,
  "ParentType" text NOT NULL,
  "Approver" uuid NOT NULL,
  "ApprovalStatus" text default 'pending',
  "Comments" text NULL, 
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE UNIQUE INDEX "idx_approval_result_parent_approval_approver" 
on risksmart.approval_result using btree ("ParentId", "ApprovalId", "Approver");

ALTER TABLE risksmart.approval_result
ADD CONSTRAINT "ApprovalResult_ApprovalStatus_fkey"
FOREIGN KEY ("ApprovalStatus") 
REFERENCES risksmart.approval_status("Value");

ALTER TABLE risksmart.approval_result
ADD CONSTRAINT "ApprovalResult_ParentType_fkey"
FOREIGN KEY ("ParentType") 
REFERENCES risksmart.parent_type("Value");

/** approval audit **/

CREATE TABLE IF NOT EXISTS risksmart.approval_result_audit (LIKE risksmart.approval_result);

ALTER TABLE risksmart.approval_result_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_result_audit
ADD COLUMN "Action" risksmart.db_action;

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
        "Approver",
        "ApprovalStatus",
        "Comments", 
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
        nr."Approver",
        nr."ApprovalStatus",
        nr."Comments", 
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

CREATE TRIGGER approval_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval_result FOR EACH ROW EXECUTE FUNCTION risksmart.approval_result_modified();

/** updates modified function with correct insert target tbl **/
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
        "Approver",
        "ApprovalStatus",
        "Comments", 
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
        nr."Approver",
        nr."ApprovalStatus",
        nr."Comments", 
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
/** remove approval_rule tbl **/
DROP TRIGGER IF EXISTS approval_rule_audit_trigger ON risksmart."approval_rule";

DROP FUNCTION IF EXISTS risksmart.approval_rule_modified();

DROP TABLE IF EXISTS risksmart."approval_rule_audit";

DROP TABLE IF EXISTS risksmart."approval_rule";

/** add rule type column to approval level **/

ALTER TABLE risksmart."approval_level"
ADD COLUMN "ApprovalRuleType" text NOT NULL;

ALTER TABLE risksmart."approval_level"
ADD CONSTRAINT "ApprovalLevel_ApprovalRuleType_fkey"
FOREIGN KEY ("ApprovalRuleType") 
REFERENCES risksmart.approval_rule_type("Value");


CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia;
CREATE TABLE IF NOT EXISTS auth.user_activity_audit (
  "Action" TEXT NOT NULL,
  "OrgKey" TEXT NOT NULL,
  "ModifiedByUser" TEXT NOT NULL,
  "ModifiedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (
    "ModifiedAtTimestamp",
    "OrgKey",
    "ModifiedByUser"
  )
);

CREATE OR REPLACE FUNCTION risksmart.get_audit_tables_json() RETURNS TABLE(json_data JSON, object_type TEXT) AS $$
DECLARE table_record RECORD;

query TEXT;

modified_table_name TEXT;

BEGIN FOR table_record IN
SELECT table_schema,
  table_name
FROM information_schema.tables
WHERE (
    table_schema = 'risksmart'
    OR table_schema = 'auth'
  )
  AND table_name LIKE '%_audit'
  AND table_name not in ('') -- exclude any tables here that you don't want to be shown in the central audit log 
  LOOP modified_table_name := left(
    table_record.table_name,
    length(table_record.table_name) - 6
  );

query := format(
  'SELECT row_to_json(t) AS json_data, %L AS object_type FROM (SELECT * FROM %I.%I) t',
  modified_table_name,
  table_record.table_schema,
  table_record.table_name
);

RETURN QUERY EXECUTE query;

END LOOP;

END;

$$ LANGUAGE plpgsql;
/** approval tbl changes **/
DROP TRIGGER IF EXISTS approval_audit_trigger ON risksmart."approval";

DROP FUNCTION IF EXISTS risksmart.approval_modified();

DROP TABLE IF EXISTS risksmart."approval_audit";
DROP TABLE IF EXISTS risksmart."approval";

CREATE TABLE IF NOT EXISTS risksmart.approval (
  "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
  "ParentId" uuid NOT NULL,
  "ParentType" text NOT NULL,
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE UNIQUE INDEX "idx_approval_parent_parent_type" 
on risksmart.approval using btree ("ParentId", "ParentType");

ALTER TABLE risksmart.approval
ADD CONSTRAINT "Approval_ParentType_fkey"
FOREIGN KEY ("ParentType") 
REFERENCES risksmart.parent_type("Value");

CREATE TABLE IF NOT EXISTS risksmart.approval_audit (LIKE risksmart.approval);

ALTER TABLE risksmart.approval_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_audit
ADD COLUMN "Action" risksmart.db_action;

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

CREATE TRIGGER approval_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval FOR EACH ROW EXECUTE FUNCTION risksmart.approval_modified();

/** rebuild approval level tbl **/

DROP TRIGGER IF EXISTS approval_level_audit_trigger ON risksmart."approval_level";

DROP FUNCTION IF EXISTS risksmart.approval_level_modified();

DROP TABLE IF EXISTS risksmart."approval_level_audit";
DROP TABLE IF EXISTS risksmart."approval_level";

CREATE TABLE IF NOT EXISTS risksmart.approval_level (
  "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
  "Description" text NOT NULL,
  "SequenceOrder" INT NOT NULL,
  "ApprovalId" uuid NOT NULL,
  "ApprovalRuleType" text NOT NULL,
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE UNIQUE INDEX "idx_approval_level_seq_approval_id" 
on risksmart.approval_level using btree ("ApprovalId", "SequenceOrder");

ALTER TABLE risksmart.approval_level
ADD CONSTRAINT "ApprovalLevel_ApprovalRuleType_fkey"
FOREIGN KEY ("ApprovalRuleType") 
REFERENCES risksmart.approval_rule_type("Value");

CREATE TABLE IF NOT EXISTS risksmart.approval_level_audit (LIKE risksmart.approval_level);

ALTER TABLE risksmart.approval_level_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_level_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.approval_level_modified() RETURNS trigger AS $body$
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



insert into risksmart.approval_level_audit(
        "Id",
        "Description",
        "SequenceOrder",
        "ApprovalId",
        "ApprovalRuleType",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Description",
        nr."SequenceOrder",
        nr."ApprovalId",
        nr."ApprovalRuleType",
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

CREATE TRIGGER approval_level_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval_level FOR EACH ROW EXECUTE FUNCTION risksmart.approval_level_modified();

/** approvers tbl **/

CREATE TABLE IF NOT EXISTS risksmart.approver (
  "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
  "UserId" text NOT NULL,
  "LevelId" uuid NOT NULL, 
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE UNIQUE INDEX "idx_approver_user_level" 
on risksmart.approver using btree ("UserId", "LevelId");

CREATE TABLE IF NOT EXISTS risksmart.approver_audit (LIKE risksmart.approver);

ALTER TABLE risksmart.approver_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approver_audit
ADD COLUMN "Action" risksmart.db_action;

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

CREATE TRIGGER approver_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approver FOR EACH ROW EXECUTE FUNCTION risksmart.approver_modified();



/** recreate approval result **/

DROP TRIGGER IF EXISTS approval_result_audit_trigger ON risksmart."approval_result";

DROP FUNCTION IF EXISTS risksmart.approval_result_modified();

DROP TABLE IF EXISTS risksmart."approval_result_audit";

DROP TABLE IF EXISTS risksmart."approval_result";

CREATE TABLE IF NOT EXISTS risksmart.approval_result (
  "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
  "ApprovalId" uuid NOT NULL,
  "ParentId" uuid NOT NULL,
  "UserId" text NOT NULL,
  "ParentType" text NOT NULL,
  "ApprovalStatus" text default 'pending',
  "Comments" text NULL,
  "SequenceOrder" INT NOT NULL, 
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE UNIQUE INDEX "idx_approval_result_parent_approval_user_sequence" 
on risksmart.approval_result using btree ("ParentId", "ApprovalId", "UserId", "SequenceOrder");

ALTER TABLE risksmart.approval_result
ADD CONSTRAINT "ApprovalResult_ApprovalStatus_fkey"
FOREIGN KEY ("ApprovalStatus") 
REFERENCES risksmart.approval_status("Value");


CREATE TABLE IF NOT EXISTS risksmart.approval_result_audit (LIKE risksmart.approval_result);

ALTER TABLE risksmart.approval_result_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_result_audit
ADD COLUMN "Action" risksmart.db_action;

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
        "UserId",
        "ApprovalStatus",
        "Comments",
        "SequenceOrder", 
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
        nr."UserId",
        nr."ApprovalStatus",
        nr."Comments",
        nr."SequenceOrder",
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

CREATE TRIGGER approval_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval_result FOR EACH ROW EXECUTE FUNCTION risksmart.approval_result_modified();


CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia;

CREATE TABLE risksmart.access_type ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.access_type ("Value", "Comment")
VALUES ('create', 'Create'),
    ('read', 'Read'),
    ('update', 'Update'),
    ('delete', 'Delete');

CREATE TABLE risksmart.contributor_type ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.contributor_type ("Value", "Comment")
VALUES ('owner', 'Owner'),
    ('contributor', 'Contributor'),
    ('any', 'Any');

CREATE TABLE risksmart.role_access (
    "RoleKey" text NOT NULL,
    "ObjectType" text NOT NULL,
    "ContributorType" text NOT NULL,
    "AccessType" text NOT NULL,
    primary key (
        "ObjectType",
        "RoleKey",
        "ContributorType",
        "AccessType"
    )
);

ALTER TABLE risksmart.role_access
ADD CONSTRAINT "role_access_ObjectType_fkey" FOREIGN KEY ("ObjectType") REFERENCES risksmart.parent_type ("Value");

ALTER TABLE risksmart.role_access
ADD CONSTRAINT "role_access_AccessType_fkey" FOREIGN KEY ("AccessType") REFERENCES risksmart.access_type ("Value");

ALTER TABLE risksmart.role_access
ADD CONSTRAINT "role_access_ContributorType_fkey" FOREIGN KEY ("ContributorType") REFERENCES risksmart.contributor_type ("Value");

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('ReadOnly', 'obligation', 'any', 'read'),
    ('RiskManager', 'obligation', 'any', 'read'),
    ('RiskManager', 'obligation', 'any', 'delete'),
    ('RiskManager', 'obligation', 'any', 'update'),
    ('RiskManager', 'obligation', 'any', 'create'),
    ('Standard', 'obligation', 'owner', 'delete'),
    ('Standard', 'obligation', 'owner', 'read'),
    ('Standard', 'obligation', 'owner', 'update'),
    ('Standard', 'obligation', 'contributor', 'read'),
    ('ReadOnly', 'document', 'any', 'read'),
    ('RiskManager', 'document', 'any', 'read'),
    ('RiskManager', 'document', 'any', 'delete'),
    ('RiskManager', 'document', 'any', 'update'),
    ('RiskManager', 'document', 'any', 'create'),
    ('Standard', 'document', 'owner', 'delete'),
    ('Standard', 'document', 'owner', 'read'),
    ('Standard', 'document', 'owner', 'update'),
    ('Standard', 'document', 'contributor', 'read'),
    ('ReadOnly', 'indicator', 'any', 'read'),
    ('RiskManager', 'indicator', 'any', 'read'),
    ('RiskManager', 'indicator', 'any', 'delete'),
    ('RiskManager', 'indicator', 'any', 'update'),
    ('RiskManager', 'indicator', 'any', 'create'),
    ('Standard', 'indicator', 'owner', 'delete'),
    ('Standard', 'indicator', 'owner', 'read'),
    ('Standard', 'indicator', 'owner', 'update'),
    ('Standard', 'indicator', 'contributor', 'read'),
    ('ReadOnly', 'risk', 'any', 'read'),
    ('RiskManager', 'risk', 'any', 'read'),
    ('RiskManager', 'risk', 'any', 'delete'),
    ('RiskManager', 'risk', 'any', 'update'),
    ('RiskManager', 'risk', 'any', 'create'),
    ('Standard', 'risk', 'owner', 'delete'),
    ('Standard', 'risk', 'owner', 'read'),
    ('Standard', 'risk', 'owner', 'update'),
    ('Standard', 'risk', 'contributor', 'read'),
    ('ReadOnly', 'control', 'any', 'read'),
    ('RiskManager', 'control', 'any', 'read'),
    ('RiskManager', 'control', 'any', 'delete'),
    ('RiskManager', 'control', 'any', 'update'),
    ('RiskManager', 'control', 'any', 'create'),
    ('Standard', 'control', 'owner', 'delete'),
    ('Standard', 'control', 'owner', 'read'),
    ('Standard', 'control', 'owner', 'update'),
    ('Standard', 'control', 'contributor', 'delete'),
    ('Standard', 'control', 'contributor', 'read'),
    ('Standard', 'control', 'contributor', 'update'),
    ('ReadOnly', 'action', 'any', 'read'),
    ('RiskManager', 'action', 'any', 'read'),
    ('RiskManager', 'action', 'any', 'delete'),
    ('RiskManager', 'action', 'any', 'update'),
    ('RiskManager', 'action', 'any', 'create'),
    ('Standard', 'action', 'owner', 'delete'),
    ('Standard', 'action', 'owner', 'read'),
    ('Standard', 'action', 'owner', 'update'),
    ('Standard', 'action', 'contributor', 'delete'),
    ('Standard', 'action', 'contributor', 'read'),
    ('Standard', 'action', 'contributor', 'update'),
    ('ReadOnly', 'action_update', 'any', 'read'),
    ('RiskManager', 'action_update', 'any', 'read'),
    ('RiskManager', 'action_update', 'any', 'delete'),
    ('RiskManager', 'action_update', 'any', 'update'),
    ('RiskManager', 'action_update', 'any', 'create'),
    ('Standard', 'action_update', 'owner', 'delete'),
    ('Standard', 'action_update', 'owner', 'create'),
    ('Standard', 'action_update', 'owner', 'update'),
    ('Standard', 'action_update', 'owner', 'read'),
    (
        'Standard',
        'action_update',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'action_update',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'action_update',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'action_update',
        'contributor',
        'create'
    ),
    ('RiskManager', 'issue', 'any', 'read'),
    ('RiskManager', 'issue', 'any', 'delete'),
    ('RiskManager', 'issue', 'any', 'update'),
    ('RiskManager', 'issue', 'any', 'create'),
    (
        'RiskManager',
        'obligation_impact',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'obligation_impact',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'obligation_impact',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'obligation_impact',
        'any',
        'create'
    ),
    ('ReadOnly', 'obligation_impact', 'any', 'read'),
    (
        'Standard',
        'obligation_impact',
        'owner',
        'delete'
    ),
    ('Standard', 'obligation_impact', 'owner', 'read'),
    (
        'Standard',
        'obligation_impact',
        'owner',
        'update'
    ),
    (
        'Standard',
        'obligation_impact',
        'owner',
        'create'
    ),
    (
        'Standard',
        'obligation_impact',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'obligation_impact',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'obligation_impact',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'obligation_impact',
        'contributor',
        'create'
    ),
    ('RiskManager', 'issue_assessment', 'any', 'read'),
    (
        'RiskManager',
        'issue_assessment',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'issue_assessment',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'issue_assessment',
        'any',
        'create'
    ),
    ('ReadOnly', 'issue_assessment', 'any', 'read'),
    (
        'Standard',
        'issue_assessment',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'issue_assessment',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'issue_assessment',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'issue_assessment',
        'contributor',
        'create'
    ),
    ('Standard', 'issue_assessment', 'owner', 'read'),
    (
        'Standard',
        'issue_assessment',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'issue_assessment',
        'owner',
        'update'
    ),
    (
        'Standard',
        'issue_assessment',
        'owner',
        'create'
    ),
    ('ReadOnly', 'issue', 'any', 'read'),
    (
        'Standard',
        'issue',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'issue',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'issue',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'issue',
        'contributor',
        'create'
    ),
    ('Standard', 'issue', 'owner', 'read'),
    (
        'Standard',
        'issue',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'issue',
        'owner',
        'update'
    ),
    (
        'Standard',
        'issue',
        'owner',
        'create'
    );

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action' as "ObjectType"
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation' as "ObjectType"
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk' as "ObjectType"
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control' as "ObjectType"
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator' as "ObjectType"
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document' as "ObjectType"
FROM risksmart.document d;

CREATE OR REPLACE VIEW risksmart.node_ancestor_view AS WITH RECURSIVE flattened_nodes(
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType"
    ) AS (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0,
            n."ObjectType"
        FROM risksmart.node_view n
        UNION ALL
        SELECT ff."Id",
            f."ParentId" AS "AncestorId",
            (ff."Depth" + 1),
            ff."ObjectType"
        FROM flattened_nodes ff
            INNER JOIN risksmart.node_parent_view f ON ff."AncestorId" = f."Id"
        WHERE f."ParentId" IS NOT NULL
    )
SELECT fpo."Id",
    fpo."AncestorId",
    fpo."Depth",
    fpo."ObjectType"
FROM flattened_nodes fpo;

CREATE OR REPLACE VIEW risksmart.contributor_view AS --  Contributor permissions
SELECT c."ParentId" as "Id",
    c."OrgKey",
    c."UserId",
    'contributor' as "ContributorType"
FROM risksmart.contributor c
UNION ALL
-- Owner permissions
SELECT o."ParentId",
    o."OrgKey",
    o."UserId",
    'owner' as "ContributorType"
FROM risksmart.owner o;

CREATE OR REPLACE VIEW risksmart.ancestor_contributor_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    na."ObjectType",
    c."ContributorType",
    na."AncestorId"
FROM risksmart.contributor_view c
    INNER JOIN risksmart.node_ancestor_view na ON na."AncestorId" = c."Id";

CREATE OR REPLACE VIEW risksmart.permission_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    ra."AccessType",
    na."ObjectType"
FROM risksmart.contributor_view c
    INNER JOIN auth.user u ON c."UserId" = u."Id"
    INNER JOIN risksmart.node_ancestor_view na ON na."AncestorId" = c."Id"
    INNER JOIN risksmart.role_access ra ON na."ObjectType" = ra."ObjectType"
    AND u."RoleKey" = ra."RoleKey"
    AND c."ContributorType" = ra."ContributorType";
insert into risksmart.access_type ("Value", "Comment")
values ('insert', 'Insert');

-- switching name of access type to reduce impact of change on front end;
update risksmart.role_access
set "AccessType" = 'insert'
where "AccessType" = 'create';

delete from risksmart.access_type
where "Value" = 'create';

insert into risksmart.parent_type ("Value", "Comment")
values ('document_file', 'Document version'),
    ('risk_assessment', 'Risk assessment'),
    -- strictly speaking these aren't parent_types, but temporarily adding them until we have another abstraction for permissions
    ('public_issue_form', 'Public issue form'),
    ('settings', 'Settings'),
    ('report', 'Reports'),
    ('my_items', 'My items'),
    ('dashboard', 'Dashboard');

drop VIEW risksmart.role_permission;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('RiskManager', 'dashboard', 'any', 'read'),
    ('RiskManager', 'settings', 'any', 'read'),
    ('ReadOnly', 'dashboard', 'any', 'read'),
    ('RiskManager', 'report', 'any', 'read'),
    ('Standard', 'my_items', 'any', 'read'),
    ('Standard', 'public_issue_form', 'any', 'read'),
    ('Public', 'public_issue_form', 'any', 'read'),
    ('RiskManager', 'indicator_result', 'any', 'read'),
    (
        'RiskManager',
        'indicator_result',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'indicator_result',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'indicator_result',
        'any',
        'update'
    ),
    ('ReadOnly', 'indicator_result', 'any', 'read'),
    ('RiskManager', 'issue_update', 'any', 'read'),
    ('RiskManager', 'issue_update', 'any', 'insert'),
    ('RiskManager', 'issue_update', 'any', 'delete'),
    ('RiskManager', 'issue_update', 'any', 'update'),
    ('ReadOnly', 'issue_update', 'any', 'read'),
    ('RiskManager', 'risk_assessment', 'any', 'read'),
    (
        'RiskManager',
        'risk_assessment',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'risk_assessment',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'risk_assessment',
        'any',
        'update'
    ),
    ('ReadOnly', 'risk_assessment', 'any', 'read'),
    ('RiskManager', 'control_group', 'any', 'read'),
    ('RiskManager', 'control_group', 'any', 'insert'),
    ('RiskManager', 'control_group', 'any', 'delete'),
    ('RiskManager', 'control_group', 'any', 'update'),
    ('ReadOnly', 'control_group', 'any', 'read'),
    ('RiskManager', 'appetite', 'any', 'read'),
    ('RiskManager', 'appetite', 'any', 'insert'),
    ('RiskManager', 'appetite', 'any', 'delete'),
    ('RiskManager', 'appetite', 'any', 'update'),
    ('ReadOnly', 'appetite', 'any', 'read'),
    (
        'RiskManager',
        'document_assessment',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'document_assessment',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'document_assessment',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'document_assessment',
        'any',
        'update'
    ),
    ('ReadOnly', 'document_assessment', 'any', 'read'),
    ('RiskManager', 'document_file', 'any', 'read'),
    ('RiskManager', 'document_file', 'any', 'insert'),
    ('RiskManager', 'document_file', 'any', 'delete'),
    ('RiskManager', 'document_file', 'any', 'update'),
    ('ReadOnly', 'document_file', 'any', 'read'),
    ('RiskManager', 'consequence', 'any', 'read'),
    ('RiskManager', 'consequence', 'any', 'insert'),
    ('RiskManager', 'consequence', 'any', 'delete'),
    ('RiskManager', 'consequence', 'any', 'update'),
    ('ReadOnly', 'consequence', 'any', 'read'),
    ('RiskManager', 'acceptance', 'any', 'read'),
    ('RiskManager', 'acceptance', 'any', 'insert'),
    ('RiskManager', 'acceptance', 'any', 'delete'),
    ('RiskManager', 'acceptance', 'any', 'update'),
    ('ReadOnly', 'acceptance', 'any', 'read'),
    ('RiskManager', 'test_result', 'any', 'read'),
    ('RiskManager', 'test_result', 'any', 'insert'),
    ('RiskManager', 'test_result', 'any', 'delete'),
    ('RiskManager', 'test_result', 'any', 'update'),
    ('ReadOnly', 'test_result', 'any', 'read'),
    ('RiskManager', 'cause', 'any', 'read'),
    ('RiskManager', 'cause', 'any', 'insert'),
    ('RiskManager', 'cause', 'any', 'delete'),
    ('RiskManager', 'cause', 'any', 'update'),
    ('ReadOnly', 'cause', 'any', 'read');
CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action'
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation'
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk'
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control'
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator'
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document'
FROM risksmart.document d
UNION ALL
SELECT oa."Id",
    'obligation_assessment'
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    'obligation_impact'
FROM risksmart.obligation_impact oi;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'RiskManager',
        'obligation_assessment',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'obligation_assessment',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'obligation_assessment',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'obligation_assessment',
        'any',
        'delete'
    ),
    (
        'ReadOnly',
        'obligation_assessment',
        'any',
        'read'
    ),
    (
        'Standard',
        'obligation_assessment',
        'contributor',
        'insert'
    ),
    (
        'Standard',
        'obligation_assessment',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'obligation_assessment',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'obligation_assessment',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'obligation_assessment',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'obligation_assessment',
        'owner',
        'read'
    ),
    (
        'Standard',
        'obligation_assessment',
        'owner',
        'update'
    ),
    (
        'Standard',
        'obligation_assessment',
        'owner',
        'delete'
    );
drop view risksmart.department_security_risk;
INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."ParentIssueId",
    o."Owner",
    o."OrgKey",
    o."CreatedByUser",
    o."ModifiedByUser",
    o."ModifiedAtTimestamp",
    o."CreatedAtTimestamp"
FROM risksmart.issue_assessment o
WHERE o."Owner" IS NOT NULL;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."ParentIssueId",
    a."Owner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."ParentIssueId",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."ParentIssueId"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.issue_assessment_audit o
        )
    ) a
where coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
    AND a."Owner" IS NOT NULL ON CONFLICT DO NOTHING;

INSERT INTO risksmart.owner_audit (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."ParentIssueId",
    a."PreviousOwner",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of owner, not action
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."ParentIssueId",
                o."Owner",
                LAG(o."Owner") OVER (
                    PARTITION BY o."ParentIssueId"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousOwner",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.issue_assessment_audit o
        )
    ) a
where (
        coalesce(a."Owner", '') != coalesce(a."PreviousOwner", '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousOwner" IS NOT NULL ON CONFLICT DO NOTHING;

ALTER TABLE risksmart.issue_assessment DROP COLUMN "Owner";

ALTER TABLE risksmart.issue_assessment_audit DROP COLUMN "Owner";

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
        "AssociatedControlId",
        "Meta",
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
        nr."AssociatedControlId",
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

$body$ LANGUAGE plpgsql;
CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action'
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation'
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk'
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control'
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator'
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document'
FROM risksmart.document d
UNION ALL
SELECT oa."Id",
    'obligation_assessment'
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    'obligation_impact'
FROM risksmart.obligation_impact oi
UNION ALL
SELECT i."Id",
    'issue'
FROM risksmart.issue i
UNION ALL
SELECT ia."Id",
    'issue_assessment'
FROM risksmart.issue_assessment ia;
CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT tr."Id",
    tr."ParentRiskId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentRiskId" IS NOT NULL
UNION ALL
SELECT tr."Id",
    tr."ParentObligationId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentObligationId" IS NOT NULL;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action'
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation'
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk'
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control'
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator'
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document'
FROM risksmart.document d
UNION ALL
SELECT oa."Id",
    'obligation_assessment'
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    'obligation_impact'
FROM risksmart.obligation_impact oi
UNION ALL
SELECT i."Id",
    'issue'
FROM risksmart.issue i
UNION ALL
SELECT ia."Id",
    'issue_assessment'
FROM risksmart.issue_assessment ia
UNION ALL
SELECT tr."Id",
    'test_result'
FROM risksmart.test_result tr;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Standard', 'test_result', 'owner', 'read'),
    (
        'Standard',
        'test_result',
        'owner',
        'update'
    ),
    (
        'Standard',
        'test_result',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'test_result',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'test_result',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'test_result',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'test_result',
        'contributor',
        'insert'
    );
ALTER TABLE risksmart.risk_assessment DROP CONSTRAINT risk_assessment_pkey;

ALTER TABLE risksmart.risk_assessment
ADD COLUMN "Id" uuid NOT NULL default gen_random_uuid();

ALTER TABLE risksmart.risk_assessment
ADD PRIMARY KEY ("Id");

CREATE UNIQUE INDEX "idx_riskAssessment_parentId" on risksmart.risk_assessment using btree ("ParentId", "ControlType");

ALTER TABLE risksmart.risk_assessment_audit DROP CONSTRAINT risk_assessment_audit_pkey;

ALTER TABLE risksmart.risk_assessment_audit
ADD COLUMN "Id" uuid NULL;

-- Bit unusual to update audit table, but we need a new primary key on it
-- First set using ids frm risk_assessment table
UPDATE risksmart.risk_assessment_audit isa
SET "Id" = ia."Id"
FROM risksmart.risk_assessment ia
WHERE isa."ParentId" = ia."ParentId"
    AND isa."ControlType" = ia."ControlType";

-- update "Id" for risk_assessment records that have been deleted
CREATE TEMP TABLE risk_assessment_ids ("Id" uuid, "ParentId" uuid, "ControlType" text);

INSERT INTO risk_assessment_ids ("ParentId", "Id", "ControlType")
SELECT x."ParentId",
    gen_random_uuid(),
    x."ControlType"
FROM (
        SELECT DISTINCT "ParentId",
            "ControlType"
        FROM risksmart.risk_assessment_audit
        WHERE "Id" is null
    ) as x;

UPDATE risksmart.risk_assessment_audit iaa
SET "Id" = iai."Id"
FROM risk_assessment_ids iai
WHERE iai."ParentId" = iaa."ParentId"
    AND iai."ControlType" = iaa."ControlType";

DROP TABLE risk_assessment_ids;

ALTER TABLE risksmart.risk_assessment_audit
ALTER COLUMN "ParentId"
SET NOT NULL;

ALTER TABLE risksmart.risk_assessment_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

CREATE OR REPLACE FUNCTION risksmart.risk_assessment_modified() RETURNS trigger AS $body$
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

insert into risksmart.risk_assessment_audit(
        "Id",
        "ParentId",
        "CustomAttributeData",
        "ControlType",
        "Likelihood",
        "Impact",
        "Rating",
        "Description",
        "NextTestDate",
        "Meta",
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
        nr."CustomAttributeData",
        nr."ControlType",
        nr."Likelihood",
        nr."Impact",
        nr."Rating",
        nr."Description",
        nr."NextTestDate",
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

$body$ LANGUAGE plpgsql;
CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT tr."Id",
    tr."ParentRiskId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentRiskId" IS NOT NULL
UNION ALL
SELECT tr."Id",
    tr."ParentObligationId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentObligationId" IS NOT NULL
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action'
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation'
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk'
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control'
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator'
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document'
FROM risksmart.document d
UNION ALL
SELECT oa."Id",
    'obligation_assessment'
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    'obligation_impact'
FROM risksmart.obligation_impact oi
UNION ALL
SELECT i."Id",
    'issue'
FROM risksmart.issue i
UNION ALL
SELECT ia."Id",
    'issue_assessment'
FROM risksmart.issue_assessment ia
UNION ALL
SELECT tr."Id",
    'test_result'
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    'risk_assessment'
FROM risksmart.risk_assessment ra;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'risk_assessment',
        'owner',
        'read'
    ),
    (
        'Standard',
        'risk_assessment',
        'owner',
        'update'
    ),
    (
        'Standard',
        'risk_assessment',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'risk_assessment',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'risk_assessment',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'risk_assessment',
        'contributor',
        'insert'
    );
CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT tr."Id",
    tr."ParentRiskId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentRiskId" IS NOT NULL
UNION ALL
SELECT tr."Id",
    tr."ParentObligationId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentObligationId" IS NOT NULL
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action'
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation'
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk'
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control'
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator'
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document'
FROM risksmart.document d
UNION ALL
SELECT oa."Id",
    'obligation_assessment'
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    'obligation_impact'
FROM risksmart.obligation_impact oi
UNION ALL
SELECT i."Id",
    'issue'
FROM risksmart.issue i
UNION ALL
SELECT ia."Id",
    'issue_assessment'
FROM risksmart.issue_assessment ia
UNION ALL
SELECT ra."Id",
    'risk_assessment'
FROM risksmart.risk_assessment ra
UNION ALL
SELECT tr."Id",
    'test_result'
FROM risksmart.test_result tr
UNION ALL
SELECT ir."Id",
    'indicator_result'
FROM risksmart.indicator_result ir;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Standard', 'indicator_result', 'owner', 'read'),
    (
        'Standard',
        'indicator_result',
        'owner',
        'update'
    ),
    (
        'Standard',
        'indicator_result',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'indicator_result',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'indicator_result',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'indicator_result',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'indicator_result',
        'contributor',
        'insert'
    );
CREATE OR REPLACE FUNCTION risksmart.get_audit_log_description(jsonData JSON, objectType TEXT) RETURNS TEXT AS $$ BEGIN --
  IF objectType = 'user_activity' THEN RETURN 'Authentication';
  ELSE RETURN COALESCE(
    jsonData->>'Name',
    jsonData->>'Title',
    jsonData->>'Version',
    jsonData->>'FileName'
  );

END IF;

END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.get_audit_log_id_field(jsonData JSON, objectType TEXT) RETURNS TEXT AS $$
DECLARE idField TEXT;

BEGIN -- Mapping for idField
IF objectType = 'tag_type' THEN idField := jsonData->>'TagTypeId';

ELSIF objectType = 'department_type' THEN idField := jsonData->>'DepartmentTypeId';

ELSIF objectType = 'user_activity' THEN idField := jsonData->>'ModifiedByUser';

-- Mapping for parentId
ELSIF objectType IN ('control_action', 'control_indicator') THEN idField := jsonData->>'ControlId';

ELSIF objectType IN (
  'document_action',
  'document_linked_document',
  'document_issue'
) THEN idField := jsonData->>'DocumentId';

ELSIF objectType = 'issue_action' THEN idField := jsonData->>'IssueId';

ELSIF objectType = 'issue_assessment' THEN idField := jsonData->>'ParentIssueId';

ELSIF objectType IN ('obligation_action', 'obligation_issue') THEN idField := jsonData->>'ObligationId';

ELSIF objectType = 'obligation_assessment' THEN idField := jsonData->>'ParentObligationId';

ELSIF objectType IN ('risk_action', 'risk_indicator') THEN idField := jsonData->>'RiskId';

ELSE idField := COALESCE(jsonData->>'Id', jsonData->>'ParentId');

END IF;

-- Return the result
RETURN idField;

END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW risksmart.audit_log AS
SELECT json_data->>'Action' AS "Action",
  (json_data->>'ModifiedByUser') AS "ModifiedByUser",
  (json_data->>'ModifiedAtTimestamp')::TIMESTAMPTZ AS "ModifiedAtTimestamp",
  (json_data->>'OrgKey') As "OrgKey",
  json_data AS "ObjectData",
  object_type AS "ObjectType",
  risksmart.get_audit_log_description(json_data, object_type) AS "Item",
  risksmart.get_audit_log_id_field(json_data, object_type) AS "Id"
FROM risksmart.get_audit_tables_json()
ORDER BY "ModifiedAtTimestamp" DESC;
CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT tr."Id",
    tr."ParentRiskId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentRiskId" IS NOT NULL
UNION ALL
SELECT tr."Id",
    tr."ParentObligationId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentObligationId" IS NOT NULL
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT ci."IndicatorId",
    ci."ControlId",
    ci."OrgKey"
FROM risksmart.control_indicator ci
UNION ALL
SELECT ci."IndicatorId",
    ci."RiskId",
    ci."OrgKey"
FROM risksmart.risk_indicator ci;
CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT tr."Id",
    tr."ParentRiskId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentRiskId" IS NOT NULL
UNION ALL
SELECT tr."Id",
    tr."ParentObligationId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentObligationId" IS NOT NULL
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ci."IndicatorId",
    ci."ControlId",
    ci."OrgKey"
FROM risksmart.control_indicator ci
UNION ALL
SELECT ri."IndicatorId",
    ri."RiskId",
    ri."OrgKey"
FROM risksmart.risk_indicator ri;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action'
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation'
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk'
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control'
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator'
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document'
FROM risksmart.document d
UNION ALL
SELECT oa."Id",
    'obligation_assessment'
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    'obligation_impact'
FROM risksmart.obligation_impact oi
UNION ALL
SELECT i."Id",
    'issue'
FROM risksmart.issue i
UNION ALL
SELECT ia."Id",
    'issue_assessment'
FROM risksmart.issue_assessment ia
UNION ALL
SELECT ra."Id",
    'risk_assessment'
FROM risksmart.risk_assessment ra
UNION ALL
SELECT tr."Id",
    'test_result'
FROM risksmart.test_result tr
UNION ALL
SELECT ir."Id",
    'indicator_result'
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    'acceptance'
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    'appetite'
FROM risksmart.appetite a;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Standard', 'appetite', 'owner', 'read'),
    (
        'Standard',
        'appetite',
        'owner',
        'update'
    ),
    (
        'Standard',
        'appetite',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'appetite',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'appetite',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'appetite',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'appetite',
        'contributor',
        'insert'
    ),
    ('Standard', 'acceptance', 'owner', 'read'),
    (
        'Standard',
        'acceptance',
        'owner',
        'update'
    ),
    (
        'Standard',
        'acceptance',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'acceptance',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'acceptance',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'acceptance',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'acceptance',
        'contributor',
        'insert'
    );
CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT tr."Id",
    tr."ParentRiskId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentRiskId" IS NOT NULL
UNION ALL
SELECT tr."Id",
    tr."ParentObligationId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentObligationId" IS NOT NULL
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ci."IndicatorId",
    ci."ControlId",
    ci."OrgKey"
FROM risksmart.control_indicator ci
UNION ALL
SELECT ri."IndicatorId",
    ri."RiskId",
    ri."OrgKey"
FROM risksmart.risk_indicator ri
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action'
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation'
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk'
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control'
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator'
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document'
FROM risksmart.document d
UNION ALL
SELECT oa."Id",
    'obligation_assessment'
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    'obligation_impact'
FROM risksmart.obligation_impact oi
UNION ALL
SELECT i."Id",
    'issue'
FROM risksmart.issue i
UNION ALL
SELECT ia."Id",
    'issue_assessment'
FROM risksmart.issue_assessment ia
UNION ALL
SELECT ra."Id",
    'risk_assessment'
FROM risksmart.risk_assessment ra
UNION ALL
SELECT tr."Id",
    'test_result'
FROM risksmart.test_result tr
UNION ALL
SELECT ir."Id",
    'indicator_result'
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    'acceptance'
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    'appetite'
FROM risksmart.appetite a
UNION ALL
SELECT iu."Id",
    'issue_update'
FROM risksmart.issue_update iu;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Standard', 'issue_update', 'owner', 'read'),
    ('Standard', 'issue_update', 'owner', 'delete'),
    (
        'Standard',
        'issue_update',
        'owner',
        'update'
    ),
    (
        'Standard',
        'issue_update',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'issue_update',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'issue_update',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'issue_update',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'issue_update',
        'contributor',
        'insert'
    ),
    (
        'Standard',
        'action',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'action',
        'contributor',
        'insert'
    );
CREATE TABLE "risksmart"."dashboard" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "Name" text NOT NULL,
    "Description" text,
    "Sharing" text,
    "Content" text,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamptz NOT NULL DEFAULT statement_timestamp(),
    "ModifiedByUser" text,
    "ModifiedAtTimestamp" timestamptz,
    "OrgKey" text NOT NULL,
    PRIMARY KEY ("Id"),
    FOREIGN KEY ("OrgKey") REFERENCES "auth"."organisation"("OrgKey") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("CreatedByUser") REFERENCES "auth"."user"("Id") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("ModifiedByUser") REFERENCES "auth"."user"("Id") ON UPDATE restrict ON DELETE restrict,
    UNIQUE ("Id")
);

COMMENT ON TABLE "risksmart"."dashboard" IS E'Saved dashboards';
CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT tr."Id",
    tr."ParentRiskId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentRiskId" IS NOT NULL
UNION ALL
SELECT tr."Id",
    tr."ParentObligationId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentObligationId" IS NOT NULL
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ci."IndicatorId",
    ci."ControlId",
    ci."OrgKey"
FROM risksmart.control_indicator ci
UNION ALL
SELECT ri."IndicatorId",
    ri."RiskId",
    ri."OrgKey"
FROM risksmart.risk_indicator ri
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action'
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation'
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk'
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control'
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator'
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document'
FROM risksmart.document d
UNION ALL
SELECT oa."Id",
    'obligation_assessment'
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    'obligation_impact'
FROM risksmart.obligation_impact oi
UNION ALL
SELECT i."Id",
    'issue'
FROM risksmart.issue i
UNION ALL
SELECT ia."Id",
    'issue_assessment'
FROM risksmart.issue_assessment ia
UNION ALL
SELECT ra."Id",
    'risk_assessment'
FROM risksmart.risk_assessment ra
UNION ALL
SELECT tr."Id",
    'test_result'
FROM risksmart.test_result tr
UNION ALL
SELECT ir."Id",
    'indicator_result'
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    'acceptance'
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    'appetite'
FROM risksmart.appetite a
UNION ALL
SELECT iu."Id",
    'issue_update'
FROM risksmart.issue_update iu
UNION ALL
SELECT c."Id",
    'consequence'
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    'cause'
FROM risksmart.cause c;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Standard', 'consequence', 'owner', 'read'),
    ('Standard', 'consequence', 'owner', 'delete'),
    (
        'Standard',
        'consequence',
        'owner',
        'update'
    ),
    (
        'Standard',
        'consequence',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'consequence',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'consequence',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'consequence',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'consequence',
        'contributor',
        'insert'
    ),
    ('Standard', 'cause', 'owner', 'read'),
    ('Standard', 'cause', 'owner', 'delete'),
    (
        'Standard',
        'cause',
        'owner',
        'update'
    ),
    (
        'Standard',
        'cause',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'cause',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'cause',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'cause',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'cause',
        'contributor',
        'insert'
    );
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'document_assessment',
        'owner',
        'read'
    ),
    (
        'Standard',
        'document_assessment',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'document_assessment',
        'owner',
        'update'
    ),
    (
        'Standard',
        'document_assessment',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'document_assessment',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'document_assessment',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'document_assessment',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'document_assessment',
        'contributor',
        'insert'
    ),
    (
        'Standard',
        'document_file',
        'owner',
        'read'
    ),
    (
        'Standard',
        'document_file',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'document_file',
        'owner',
        'update'
    ),
    (
        'Standard',
        'document_file',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'document_file',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'document_file',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'document_file',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'document_file',
        'contributor',
        'insert'
    );

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT oa."ActionId",
    oa."ObligationId",
    oa."OrgKey"
FROM risksmart.obligation_action oa
UNION ALL
SELECT ca."ActionId",
    ca."ControlId",
    ca."OrgKey"
FROM risksmart.control_action ca
UNION ALL
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey"
FROM risksmart.risk_action ra
UNION ALL
SELECT da."ActionId",
    da."DocumentId",
    da."OrgKey"
FROM risksmart.document_action da
UNION ALL
SELECT ia."ActionId",
    ia."IssueId",
    ia."OrgKey"
FROM risksmart.issue_action ia
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT tr."Id",
    tr."ParentRiskId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentRiskId" IS NOT NULL
UNION ALL
SELECT tr."Id",
    tr."ParentObligationId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentObligationId" IS NOT NULL
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ci."IndicatorId",
    ci."ControlId",
    ci."OrgKey"
FROM risksmart.control_indicator ci
UNION ALL
SELECT ri."IndicatorId",
    ri."RiskId",
    ri."OrgKey"
FROM risksmart.risk_indicator ri
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId",
    df."OrgKey"
FROM risksmart.document_file df;

CREATE OR REPLACE VIEW risksmart.node_view as
SELECT au."Id",
    'action_update' as "ObjectType"
FROM risksmart.action_update au
UNION ALL
SELECT a."Id",
    'action'
FROM risksmart.action a
UNION ALL
SELECT o."Id",
    'obligation'
FROM risksmart.obligation o
UNION ALL
SELECT r."Id",
    'risk'
FROM risksmart.risk r
UNION ALL
SELECT c."Id",
    'control'
FROM risksmart.control c
UNION ALL
SELECT i."Id",
    'indicator'
FROM risksmart.indicator i
UNION ALL
SELECT d."Id",
    'document'
FROM risksmart.document d
UNION ALL
SELECT oa."Id",
    'obligation_assessment'
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    'obligation_impact'
FROM risksmart.obligation_impact oi
UNION ALL
SELECT i."Id",
    'issue'
FROM risksmart.issue i
UNION ALL
SELECT ia."Id",
    'issue_assessment'
FROM risksmart.issue_assessment ia
UNION ALL
SELECT ra."Id",
    'risk_assessment'
FROM risksmart.risk_assessment ra
UNION ALL
SELECT tr."Id",
    'test_result'
FROM risksmart.test_result tr
UNION ALL
SELECT ir."Id",
    'indicator_result'
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    'acceptance'
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    'appetite'
FROM risksmart.appetite a
UNION ALL
SELECT iu."Id",
    'issue_update'
FROM risksmart.issue_update iu
UNION ALL
SELECT c."Id",
    'consequence'
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    'cause'
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    'document_assessment'
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    'document_file'
FROM risksmart.document_file df;

CREATE TABLE IF NOT EXISTS risksmart.version_status ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.version_status ("Value", "Comment")
VALUES
  ('archived', 'Archived'),
  ('draft', 'Draft'),
  ('published', 'Published'),
  ('pending_approval', 'Pending Approval');

ALTER TABLE risksmart.document_file
  DROP CONSTRAINT "DocumentFile_Status_fkey",
  ADD CONSTRAINT "DocumentFile_Status_fkey" 
    FOREIGN KEY ("Status") REFERENCES risksmart.version_status("Value");

DROP TABLE IF EXISTS risksmart.document_file_status;

CREATE TABLE risksmart.node (
    "Id" uuid NOT NULL default gen_random_uuid(),
    "ObjectType" text NOT NULL,
    "OrgKey" text NOT NULL,
    primary key ("Id")
);

ALTER TABLE risksmart.node
ADD CONSTRAINT "node_OrgKey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey");

ALTER TABLE risksmart.node
ADD CONSTRAINT "node_Type_fkey" FOREIGN KEY ("ObjectType") REFERENCES risksmart.parent_type ("Value");

CREATE OR REPLACE FUNCTION risksmart.node_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node ("Id", "ObjectType", "OrgKey")
VALUES(NEW."Id", TG_TABLE_NAME, NEW."OrgKey")
RETURNING "Id" INTO NEW."Id";

RETURN NEW;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node
WHERE "Id" = OLD."Id"
    AND "OrgKey" = OLD."OrgKey";

RETURN NULL;

END;

$$;
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT au."Id",
    'action_update',
    au."OrgKey"
FROM risksmart.action_update au;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.action_update FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.action_update FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.action_update
ADD CONSTRAINT "action_update_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT a."Id",
    'action',
    a."OrgKey"
FROM risksmart.action a;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.action FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.action FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.action
ADD CONSTRAINT "action_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT c."Id",
    'control',
    c."OrgKey"
FROM risksmart.control c;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.control FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.control FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.control
ADD CONSTRAINT "control_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT o."Id",
    'obligation',
    o."OrgKey"
FROM risksmart.obligation o;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.obligation FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.obligation FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.obligation
ADD CONSTRAINT "obligation_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT i."Id",
    'indicator',
    i."OrgKey"
FROM risksmart.indicator i;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.indicator FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.indicator FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.indicator
ADD CONSTRAINT "indicator_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT r."Id",
    'risk',
    r."OrgKey"
FROM risksmart.risk r;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.risk FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.risk FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.risk
ADD CONSTRAINT "risk_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT d."Id",
    'document',
    d."OrgKey"
FROM risksmart.document d;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.document FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.document FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.document
ADD CONSTRAINT "document_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT oa."Id",
    'obligation_assessment',
    oa."OrgKey"
FROM risksmart.obligation_assessment oa;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.obligation_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.obligation_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.obligation_assessment
ADD CONSTRAINT "obligation_assessment_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT oi."Id",
    'obligation_impact',
    oi."OrgKey"
FROM risksmart.obligation_impact oi;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.obligation_impact FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.obligation_impact FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.obligation_impact
ADD CONSTRAINT "obligation_impact_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT i."Id",
    'issue',
    i."OrgKey"
FROM risksmart.issue i;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.issue FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.issue FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.issue
ADD CONSTRAINT "issue_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT ia."Id",
    'issue_assessment',
    ia."OrgKey"
FROM risksmart.issue_assessment ia;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.issue_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.issue_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.issue_assessment
ADD CONSTRAINT "issue_assessment_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT ra."Id",
    'risk_assessment',
    ra."OrgKey"
FROM risksmart.risk_assessment ra;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.risk_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.risk_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.risk_assessment
ADD CONSTRAINT "risk_assessment_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT ir."Id",
    'indicator_result',
    ir."OrgKey"
FROM risksmart.indicator_result ir;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.indicator_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.indicator_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.indicator_result
ADD CONSTRAINT "indicator_result_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT tr."Id",
    'test_result',
    tr."OrgKey"
FROM risksmart.test_result tr;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.test_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.test_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.test_result
ADD CONSTRAINT "test_result_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT a."Id",
    'acceptance',
    a."OrgKey"
FROM risksmart.acceptance a;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.acceptance FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.acceptance FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.acceptance
ADD CONSTRAINT "acceptance_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT a."Id",
    'appetite',
    a."OrgKey"
FROM risksmart.appetite a;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.appetite FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.appetite FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.appetite
ADD CONSTRAINT "appetite_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT iu."Id",
    'issue_update',
    iu."OrgKey"
FROM risksmart.issue_update iu;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.issue_update FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.issue_update FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.issue_update
ADD CONSTRAINT "issue_update_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT c."Id",
    'cause',
    c."OrgKey"
FROM risksmart.cause c;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.cause FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.cause FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.cause
ADD CONSTRAINT "cause_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT c."Id",
    'consequence',
    c."OrgKey"
FROM risksmart.consequence c;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.consequence FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.consequence FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.consequence
ADD CONSTRAINT "consequence_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT c."Id",
    'document_assessment',
    c."OrgKey"
FROM risksmart.document_assessment c;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.document_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.document_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.document_assessment
ADD CONSTRAINT "document_assessment_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT df."Id",
    'document_file',
    df."OrgKey"
FROM risksmart.document_file df;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.document_file FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.document_file FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.document_file
ADD CONSTRAINT "document_file_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
CREATE OR REPLACE VIEW risksmart.node_ancestor_view AS WITH RECURSIVE flattened_nodes(
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType"
    ) AS (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0,
            n."ObjectType"
        FROM risksmart.node n
        UNION ALL
        SELECT ff."Id",
            f."ParentId" AS "AncestorId",
            (ff."Depth" + 1),
            ff."ObjectType"
        FROM flattened_nodes ff
            INNER JOIN risksmart.node_parent_view f ON ff."AncestorId" = f."Id"
    )
SELECT fpo."Id",
    fpo."AncestorId",
    fpo."Depth",
    fpo."ObjectType"
FROM flattened_nodes fpo;

DROP VIEW risksmart.node_view;
CREATE OR REPLACE FUNCTION risksmart.get_ancestors(id uuid) RETURNS TABLE (
        "Id" uuid,
        "AncestorId" uuid,
        "Depth" integer,
        "ObjectType" text
    ) AS $$ WITH RECURSIVE flattened_nodes(
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType"
    ) AS (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0,
            n."ObjectType"
        FROM risksmart.node n
        WHERE n."Id" = id
        UNION ALL
        SELECT ff."Id",
            f."ParentId" AS "AncestorId",
            (ff."Depth" + 1),
            ff."ObjectType"
        FROM flattened_nodes ff
            INNER JOIN risksmart.node_parent_view f ON ff."AncestorId" = f."Id"
    )
SELECT fpo."Id",
    fpo."AncestorId",
    fpo."Depth",
    fpo."ObjectType"
FROM flattened_nodes fpo;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_ancestor_contributors(id uuid) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    na."ObjectType",
    c."ContributorType",
    na."AncestorId"
FROM risksmart.get_ancestors(id) na
    INNER JOIN risksmart.contributor_view c ON na."AncestorId" = c."Id";

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_risk_ancestor_contributors(record risksmart.risk) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_action_ancestor_contributors(record risksmart.action) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_document_ancestor_contributors(record risksmart.document) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_indicator_ancestor_contributors(record risksmart.indicator) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_issue_ancestor_contributors(record risksmart.issue) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_control_ancestor_contributors(record risksmart.control) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_obligation_ancestor_contributors(record risksmart.obligation) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

/** recreate approval result **/

DROP TRIGGER IF EXISTS approval_result_audit_trigger ON risksmart."approval_result";

DROP FUNCTION IF EXISTS risksmart.approval_result_modified();

DROP TABLE IF EXISTS risksmart."approval_result_audit";

DROP TABLE IF EXISTS risksmart."approval_result";

CREATE TABLE IF NOT EXISTS risksmart.approval_result (
  "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
  "ApprovalId" uuid NOT NULL,
  "ParentId" uuid NOT NULL,
  "ParentType" text NOT NULL,
  "ApproverData" JSONB NOT NULL, 
  "ApproverDataHistory" JSONB default '[]' NOT NULL,
  "ApprovalStatus" text NOT NULL, 
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

ALTER TABLE risksmart.approval_result
ADD CONSTRAINT "ApprovalResult_ApprovalStatus_fkey"
FOREIGN KEY ("ApprovalStatus") 
REFERENCES risksmart.approval_status("Value");

ALTER TABLE risksmart.approval_result
ADD CONSTRAINT "ApprovalResult_ParentType_fkey"
FOREIGN KEY ("ParentType") 
REFERENCES risksmart.parent_type("Value");

/** partial unique index to make sure there is only 1 inflight approval result per parent **/
CREATE UNIQUE INDEX "idx_approval_result_pending_per_parent" 
ON risksmart.approval_result ("ParentId", "ParentType")
WHERE ("ApprovalStatus" = 'pending');

CREATE TABLE IF NOT EXISTS risksmart.approval_result_audit (LIKE risksmart.approval_result);

ALTER TABLE risksmart.approval_result_audit
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE risksmart.approval_result_audit
ADD COLUMN "Action" risksmart.db_action;

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
        "ApproverData", 
        "ApproverDataHistory",
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
        nr."ApproverData", 
        nr."ApproverDataHistory",
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

CREATE TRIGGER approval_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.approval_result FOR EACH ROW EXECUTE FUNCTION risksmart.approval_result_modified();

delete from risksmart.contributor t
where t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.risk r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.obligation r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.action r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.control r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.indicator r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.issue r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.issue_assessment r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.document r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.indicator r
    );
delete from risksmart.owner t
where t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.risk r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.obligation r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.action r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.control r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.indicator r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.issue r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.issue_assessment r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.document r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.indicator r
    );
delete from risksmart.department t
where t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.risk r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.obligation r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.action r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.control r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.indicator r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.issue r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.issue_assessment r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.document r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.indicator r
    );
delete from risksmart.tag t
where t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.risk r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.obligation r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.action r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.control r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.indicator r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.issue r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.issue_assessment r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.document r
    )
    and t."ParentId" not in (
        SELECT r."Id"
        FROM risksmart.indicator r
    );
ALTER TABLE risksmart.owner
ADD CONSTRAINT "owner_ParentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.contributor
ADD CONSTRAINT "contributor_ParentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.tag
ADD CONSTRAINT "tag_ParentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.department
ADD CONSTRAINT "department_ParentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;
CREATE OR REPLACE FUNCTION risksmart.get_node_ancestor_contributors(record risksmart.node) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;
delete from risksmart.risk_action ra
where ra."RiskId" not in (
        select r."Id"
        from risksmart.risk r
    );

delete from risksmart.risk_action ra
where ra."ActionId" not in (
        select a."Id"
        from risksmart.action a
    );

delete from risksmart.control_action ca
where ca."ControlId" not in (
        select c."Id"
        from risksmart.control c
    );

delete from risksmart.control_action ca
where ca."ActionId" not in (
        select a."Id"
        from risksmart.action a
    );

delete from risksmart.issue_action ia
where ia."IssueId" not in (
        select i."Id"
        from risksmart.issue i
    );

delete from risksmart.issue_action ia
where ia."ActionId" not in (
        select a."Id"
        from risksmart.action a
    );

delete from risksmart.obligation_action oa
where oa."ObligationId" not in (
        select o."Id"
        from risksmart.obligation o
    );

delete from risksmart.obligation_action oa
where oa."ActionId" not in (
        select a."Id"
        from risksmart.action a
    );

delete from risksmart.document_action da
where da."DocumentId" not in (
        select d."Id"
        from risksmart.document d
    );

delete from risksmart.document_action da
where da."ActionId" not in (
        select a."Id"
        from risksmart.action a
    );

CREATE TABLE IF NOT EXISTS risksmart.action_parent (
    "ActionId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("ParentId", "ActionId")
);

ALTER TABLE risksmart.action_parent
ADD CONSTRAINT "action_parent_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.action_parent
ADD CONSTRAINT "action_parent_actionId_fkey" FOREIGN KEY ("ActionId") REFERENCES risksmart.action("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.action_parent
ADD CONSTRAINT "action_parent_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.action_parent
ADD CONSTRAINT "action_parent_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.action_parent
ADD CONSTRAINT "action_parent_organisationKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

CREATE INDEX "idx_action_parent_actionId_parentId" on risksmart.action_parent using btree ("ActionId", "ParentId");

CREATE TABLE IF NOT EXISTS risksmart.action_parent_audit (
    "ActionId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentId", "ActionId", "ModifiedAtTimestamp")
);

INSERT INTO risksmart.action_parent (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp"
FROM risksmart.risk_action ra;

INSERT INTO risksmart.action_parent (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT ra."ActionId",
    ra."ControlId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp"
FROM risksmart.control_action ra;

INSERT INTO risksmart.action_parent (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT ra."ActionId",
    ra."IssueId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp"
FROM risksmart.issue_action ra;

INSERT INTO risksmart.action_parent (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT ra."ActionId",
    ra."ObligationId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp"
FROM risksmart.obligation_action ra;

INSERT INTO risksmart.action_parent (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT ra."ActionId",
    ra."DocumentId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp"
FROM risksmart.document_action ra;

INSERT INTO risksmart.action_parent_audit (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
SELECT ra."ActionId",
    ra."RiskId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp",
    ra."Action"
FROM risksmart.risk_action_audit ra;

INSERT INTO risksmart.action_parent_audit (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
SELECT ra."ActionId",
    ra."ControlId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp",
    ra."Action"
FROM risksmart.control_action_audit ra;

INSERT INTO risksmart.action_parent_audit (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
SELECT ra."ActionId",
    ra."IssueId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp",
    ra."Action"
FROM risksmart.issue_action_audit ra;

INSERT INTO risksmart.action_parent_audit (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
SELECT ra."ActionId",
    ra."ObligationId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp",
    ra."Action"
FROM risksmart.obligation_action_audit ra;

INSERT INTO risksmart.action_parent_audit (
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
SELECT ra."ActionId",
    ra."DocumentId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp",
    ra."Action"
FROM risksmart.document_action_audit ra;

CREATE OR REPLACE FUNCTION risksmart.action_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.action_parent_audit(
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ActionId",
        nr."ParentId",
        nr."OrgKey",
        nr."CreatedByUser",
        updated_user,
        update_timestamp,
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER action_parent_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.action_parent FOR EACH ROW EXECUTE FUNCTION risksmart.action_parent_modified();

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT tr."Id",
    tr."ParentRiskId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentRiskId" IS NOT NULL
UNION ALL
SELECT tr."Id",
    tr."ParentObligationId",
    tr."OrgKey"
FROM risksmart.control tr
WHERE tr."ParentObligationId" IS NOT NULL
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ci."IndicatorId",
    ci."ControlId",
    ci."OrgKey"
FROM risksmart.control_indicator ci
UNION ALL
SELECT ri."IndicatorId",
    ri."RiskId",
    ri."OrgKey"
FROM risksmart.risk_indicator ri
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId",
    df."OrgKey"
FROM risksmart.document_file df;

DROP TABLE risksmart.risk_action;

DROP TABLE risksmart.document_action;

DROP TABLE risksmart.issue_action;

DROP TABLE risksmart.control_action;

DROP TABLE risksmart.obligation_action;
drop function risksmart.update_departments;

drop function risksmart.update_tags;
DO $$
DECLARE environment TEXT;

BEGIN
SELECT "ValueString" INTO environment
FROM config.env
WHERE "Name" = 'stage';

IF environment = 'dev'
OR environment = 'dev-cloud' THEN --

-- Change table to form_configuration to better reflect what it represents and manages.
ALTER TABLE risksmart.custom_attribute_schema_parent
  RENAME TO form_configuration;

ALTER TABLE risksmart.form_configuration
ADD PRIMARY KEY ("ParentType");

CREATE TABLE IF NOT EXISTS risksmart.form_field_configuration (
  "FormConfigurationParentType" text NOT NULL,
  "FieldId" text NOT NULL,
  "Hidden" boolean NOT NULL,
  "ReadOnly" boolean NOT NULL,
  "Position" integer NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  PRIMARY KEY ("FormConfigurationParentType", "FieldId"),
  FOREIGN KEY ("FormConfigurationParentType") REFERENCES risksmart.form_configuration("ParentType") ON DELETE CASCADE
);

DROP TRIGGER custom_attribute_schema_parent_audit_trigger ON risksmart.form_configuration;

DROP FUNCTION risksmart.custom_attribute_schema_parent_modified();

/** audit tables and triggers **/
/** form_configuration audit tbl **/
ALTER TABLE risksmart.custom_attribute_schema_parent_audit
  RENAME TO form_configuration_audit;

ALTER TABLE risksmart.form_configuration_audit DROP CONSTRAINT "custom_attribute_schema_parent_audit_pkey";

ALTER TABLE risksmart.form_configuration_audit
ADD PRIMARY KEY ("ParentType", "ModifiedAtTimestamp");

CREATE OR REPLACE FUNCTION risksmart.form_configuration_modified() RETURNS trigger AS $body$
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

insert into risksmart.form_configuration_audit(
    "CustomAttributeSchemaId",
    "ParentType",
    "OrgKey",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."CustomAttributeSchemaId",
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

CREATE TRIGGER form_configuration_audit_trigger
AFTER
INSERT
  OR DELETE
  OR
UPDATE ON risksmart.form_configuration FOR EACH ROW EXECUTE FUNCTION risksmart.form_configuration_modified();

/** form_field_configuration audit tbl **/
CREATE TABLE IF NOT EXISTS risksmart.form_field_configuration_audit (LIKE risksmart.form_field_configuration);

ALTER TABLE risksmart.form_field_configuration_audit
ADD PRIMARY KEY (
    "FormConfigurationParentType",
    "FieldId",
    "ModifiedAtTimestamp"
  );

ALTER TABLE risksmart.form_field_configuration_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.form_field_configuration_modified() RETURNS trigger AS $body$
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

insert into risksmart.form_field_configuration_audit(
    "FormConfigurationParentType",
    "FieldId",
    "Hidden",
    "ReadOnly",
    "Position",
    "CreatedByUser",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."FormConfigurationParentType",
    nr."FieldId",
    nr."Hidden",
    nr."ReadOnly",
    nr."Position",
    nr."CreatedByUser",
    updated_user,
    update_timestamp,
    nr."CreatedAtTimestamp",
    TG_OP
  );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER form_field_configuration_audit_trigger
AFTER
INSERT
  OR DELETE
  OR
UPDATE ON risksmart.form_field_configuration FOR EACH ROW EXECUTE FUNCTION risksmart.form_field_configuration_modified();

END IF;

END $$;
INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT cg."Id",
    'control_group',
    cg."OrgKey"
FROM risksmart.control_group cg;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.control_group FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.control_group FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.control_group
ADD CONSTRAINT "control_group_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
ALTER TABLE risksmart."control" DROP CONSTRAINT parent_id_check;

/* Clean up bad data */
update risksmart.control c
set "ParentRiskId" = null,
    "ModifiedAtTimestamp" = statement_timestamp()
where "ParentRiskId" IS NOT NULL
    AND "ParentRiskId" not in (
        select r."Id"
        from risksmart.risk r
    );

update risksmart.control c
set "ParentObligationId" = null,
    "ModifiedAtTimestamp" = statement_timestamp()
where "ParentObligationId" IS NOT NULL
    AND "ParentObligationId" not in (
        select r."Id"
        from risksmart.obligation r
    );

update risksmart.control c
set "GroupId" = null,
    "ModifiedAtTimestamp" = statement_timestamp()
where "GroupId" IS NOT NULL
    AND "GroupId" not in (
        select r."Id"
        from risksmart.control_group r
    );

CREATE TABLE IF NOT EXISTS risksmart.control_parent (
    "ControlId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("ParentId", "ControlId")
);

ALTER TABLE risksmart.control_parent
ADD CONSTRAINT "control_parent_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.control_parent
ADD CONSTRAINT "control_parent_controlId_fkey" FOREIGN KEY ("ControlId") REFERENCES risksmart.control("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.control_parent
ADD CONSTRAINT "control_parent_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.control_parent
ADD CONSTRAINT "control_parent_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.control_parent
ADD CONSTRAINT "control_parent_organisationKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

CREATE INDEX "idx_control_parent_controlId_parentId" on risksmart.control_parent using btree ("ControlId", "ParentId");

CREATE TABLE IF NOT EXISTS risksmart.control_parent_audit (
    "ControlId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentId", "ControlId", "ModifiedAtTimestamp")
);

-- audit history of ParentRiskId changes
-- inserts
INSERT INTO risksmart.control_parent_audit (
        "ControlId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."ParentRiskId",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of change, not initial record insert
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."Id",
                o."ParentRiskId",
                LAG(o."ParentRiskId") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousParentRiskId",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.control_audit o
        )
    ) a
where coalesce(a."ParentRiskId"::text, '') != coalesce(a."PreviousParentRiskId"::text, '')
    AND a."ParentRiskId" IS NOT NULL ON CONFLICT DO NOTHING;

-- audit history of ParentRiskId changes
-- deletes
INSERT INTO risksmart.control_parent_audit (
        "ControlId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."PreviousParentRiskId",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of change, not initial record insert
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."Id",
                o."ParentRiskId",
                LAG(o."ParentRiskId") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousParentRiskId",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.control_audit o
        )
    ) a
where (
        coalesce(a."ParentRiskId"::text, '') != coalesce(a."PreviousParentRiskId"::text, '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousParentRiskId" IS NOT NULL ON CONFLICT DO NOTHING;

-- audit history of ParentObligationId changes
-- inserts
INSERT INTO risksmart.control_parent_audit (
        "ControlId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."ParentObligationId",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of change, not initial record insert
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."Id",
                o."ParentObligationId",
                LAG(o."ParentObligationId") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousParentObligationId",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.control_audit o
        )
    ) a
where coalesce(a."ParentObligationId"::text, '') != coalesce(a."PreviousParentObligationId"::text, '')
    AND a."ParentObligationId" IS NOT NULL ON CONFLICT DO NOTHING;

-- audit history of ParentObligationId changes
-- deletes
INSERT INTO risksmart.control_parent_audit (
        "ControlId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."PreviousParentObligationId",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of change, not initial record insert
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."Id",
                o."ParentObligationId",
                LAG(o."ParentObligationId") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousParentObligationId",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.control_audit o
        )
    ) a
where (
        coalesce(a."ParentObligationId"::text, '') != coalesce(a."PreviousParentObligationId"::text, '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousParentObligationId" IS NOT NULL ON CONFLICT DO NOTHING;

-- audit history of GroupId changes
-- inserts
INSERT INTO risksmart.control_parent_audit (
        "ControlId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."GroupId",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of change, not initial record insert
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."Id",
                o."GroupId",
                LAG(o."GroupId") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousGroupId",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.control_audit o
        )
    ) a
where coalesce(a."GroupId"::text, '') != coalesce(a."PreviousGroupId"::text, '')
    AND a."GroupId" IS NOT NULL ON CONFLICT DO NOTHING;

-- audit history of GroupId changes
-- deletes
INSERT INTO risksmart.control_parent_audit (
        "ControlId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."Id",
    a."PreviousGroupId",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of change, not initial record insert
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."Id",
                o."GroupId",
                LAG(o."GroupId") OVER (
                    PARTITION BY o."Id"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousGroupId",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.control_audit o
        )
    ) a
where (
        coalesce(a."GroupId"::text, '') != coalesce(a."PreviousGroupId"::text, '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousGroupId" IS NOT NULL ON CONFLICT DO NOTHING;

/*
 Create parent records from audit so that we get the correct  
 CreatedByUser",
 "ModifiedByUser",
 "ModifiedAtTimestamp",
 "CreatedAtTimestamp"
 details, rather then relying on the latest details
 */
INSERT INTO risksmart.control_parent (
        "ControlId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT l."ControlId",
    l."ParentId",
    l."OrgKey",
    l."CreatedByUser",
    l."ModifiedByUser",
    l."ModifiedAtTimestamp",
    l."CreatedAtTimestamp"
FROM (
        SELECT DISTINCT ON (c."ParentId", c."ControlId") c."ParentId",
            c."ControlId",
            c."OrgKey",
            c."CreatedByUser",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp",
            c."CreatedAtTimestamp",
            c."Action"
        FROM risksmart.control_parent_audit c
        ORDER BY c."ParentId",
            c."ControlId",
            "ModifiedAtTimestamp" DESC
    ) l
WHERE l."Action" = 'INSERT';

CREATE OR REPLACE FUNCTION risksmart.control_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.control_parent_audit(
        "ControlId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ControlId",
        nr."ParentId",
        nr."OrgKey",
        nr."CreatedByUser",
        updated_user,
        update_timestamp,
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER control_parent_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.control_parent FOR EACH ROW EXECUTE FUNCTION risksmart.control_parent_modified();

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT ap."ControlId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.control_parent ap
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ci."IndicatorId",
    ci."ControlId",
    ci."OrgKey"
FROM risksmart.control_indicator ci
UNION ALL
SELECT ri."IndicatorId",
    ri."RiskId",
    ri."OrgKey"
FROM risksmart.risk_indicator ri
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId",
    df."OrgKey"
FROM risksmart.document_file df;

ALTER TABLE risksmart.control DROP COLUMN "ParentRiskId";

ALTER TABLE risksmart.control DROP COLUMN "ParentObligationId";

ALTER TABLE risksmart.control DROP COLUMN "GroupId";

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
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Description",
        nr."Type",
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

$body$ LANGUAGE plpgsql;
DO $$
DECLARE environment TEXT;

BEGIN
SELECT "ValueString" INTO environment
FROM config.env
WHERE "Name" = 'stage';

IF environment = 'dev'
OR environment = 'dev-cloud' THEN --

ALTER TABLE risksmart.form_field_configuration
ADD COLUMN "OrgKey" text NOT NULL;

CREATE OR REPLACE FUNCTION risksmart.form_field_configuration_modified() RETURNS trigger AS $body$
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

insert into risksmart.form_field_configuration_audit(
    "FormConfigurationParentType",
    "FieldId",
    "Hidden",
    "ReadOnly",
    "Position",
    "CreatedByUser",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedAtTimestamp",
    "OrgKey",
    "Action"
  )
values (
    nr."FormConfigurationParentType",
    nr."FieldId",
    nr."Hidden",
    nr."ReadOnly",
    nr."Position",
    nr."CreatedByUser",
    updated_user,
    update_timestamp,
    nr."CreatedAtTimestamp",
    nr."OrgKey",
    TG_OP
  );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

END IF;

END $$;
insert into risksmart.parent_type ("Value", "Comment")
values ('public_policies', 'Public policies');

insert into risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
values ('Public', 'public_policies', 'any', 'read');
CREATE OR REPLACE FUNCTION risksmart.get_control_group_ancestor_contributors(record risksmart.control_group) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;
DO $$
DECLARE environment TEXT;

BEGIN
SELECT "ValueString" INTO environment
FROM config.env
WHERE "Name" = 'stage';

IF environment = 'dev' THEN --

-- Drop the newly created table form_field_configuration if it exists.
DROP TABLE IF EXISTS risksmart.form_field_configuration;

-- Revert the table name change from form_configuration back to custom_attribute_schema_parent.
ALTER TABLE risksmart.form_configuration
  RENAME TO custom_attribute_schema_parent;

ALTER TABLE risksmart.custom_attribute_schema_parent DROP CONSTRAINT IF EXISTS "form_configuration_pkey";

DROP TRIGGER IF EXISTS form_configuration_audit_trigger ON risksmart.custom_attribute_schema_parent;

DROP FUNCTION IF EXISTS risksmart.form_configuration_modified();

-- Recreate the dropped trigger and function for custom_attribute_schema_parent audit.
CREATE OR REPLACE FUNCTION risksmart.custom_attribute_schema_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.custom_attribute_schema_parent_audit(
    "CustomAttributeSchemaId",
    "ParentType",
    "OrgKey",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."CustomAttributeSchemaId",
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

CREATE TRIGGER custom_attribute_schema_parent_audit_trigger
AFTER
INSERT
  OR DELETE
  OR
UPDATE ON risksmart.custom_attribute_schema_parent FOR EACH ROW EXECUTE FUNCTION risksmart.custom_attribute_schema_parent_modified();

-- Revert the renaming of the audit table for custom_attribute_schema_parent.
ALTER TABLE risksmart.form_configuration_audit
  RENAME TO custom_attribute_schema_parent_audit;

ALTER TABLE risksmart.custom_attribute_schema_parent_audit DROP CONSTRAINT "form_configuration_audit_pkey";

ALTER TABLE risksmart.custom_attribute_schema_parent_audit
ADD CONSTRAINT "custom_attribute_schema_parent_audit_pkey" PRIMARY KEY ("CustomAttributeSchemaId", "ModifiedAtTimestamp");

-- Drop the audit table and triggers for form_field_configuration, if they exist.
DROP TABLE IF EXISTS risksmart.form_field_configuration_audit;

DROP FUNCTION IF EXISTS risksmart.form_field_configuration_modified();

DROP TRIGGER IF EXISTS form_field_configuration_audit_trigger ON risksmart.form_field_configuration;

END IF;

END $$;
DO $$
DECLARE environment TEXT;

BEGIN
SELECT "ValueString" INTO environment
FROM config.env
WHERE "Name" = 'stage';

IF environment = 'dev-cloud' THEN -- 
-- Drop the newly created table form_field_configuration if it exists.
DROP TABLE IF EXISTS risksmart.form_field_configuration;

-- Revert the table name change from form_configuration back to custom_attribute_schema_parent.
ALTER TABLE risksmart.form_configuration
  RENAME TO custom_attribute_schema_parent;

ALTER TABLE risksmart.custom_attribute_schema_parent DROP CONSTRAINT IF EXISTS "form_configuration_pkey";

DROP TRIGGER IF EXISTS form_configuration_audit_trigger ON risksmart.custom_attribute_schema_parent;

DROP FUNCTION IF EXISTS risksmart.form_configuration_modified();

-- Recreate the dropped trigger and function for custom_attribute_schema_parent audit.
CREATE OR REPLACE FUNCTION risksmart.custom_attribute_schema_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.custom_attribute_schema_parent_audit(
    "CustomAttributeSchemaId",
    "ParentType",
    "OrgKey",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."CustomAttributeSchemaId",
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

CREATE TRIGGER custom_attribute_schema_parent_audit_trigger
AFTER
INSERT
  OR DELETE
  OR
UPDATE ON risksmart.custom_attribute_schema_parent FOR EACH ROW EXECUTE FUNCTION risksmart.custom_attribute_schema_parent_modified();

-- Revert the renaming of the audit table for custom_attribute_schema_parent.
ALTER TABLE risksmart.form_configuration_audit
  RENAME TO custom_attribute_schema_parent_audit;

ALTER TABLE risksmart.custom_attribute_schema_parent_audit DROP CONSTRAINT "form_configuration_audit_pkey";

ALTER TABLE risksmart.custom_attribute_schema_parent_audit
ADD CONSTRAINT "custom_attribute_schema_parent_audit_pkey" PRIMARY KEY ("CustomAttributeSchemaId", "ModifiedAtTimestamp");

-- Drop the audit table and triggers for form_field_configuration, if they exist.
DROP TABLE IF EXISTS risksmart.form_field_configuration_audit;

DROP FUNCTION IF EXISTS risksmart.form_field_configuration_modified();

DROP TRIGGER IF EXISTS form_field_configuration_audit_trigger ON risksmart.form_field_configuration;

END IF;

END $$;
-- Change table to form_configuration to better reflect what it represents and manages.
ALTER TABLE risksmart.custom_attribute_schema_parent
  RENAME TO form_configuration;

ALTER TABLE risksmart.form_configuration
ADD PRIMARY KEY ("ParentType", "OrgKey");

CREATE TABLE IF NOT EXISTS risksmart.form_field_configuration (
  "FormConfigurationParentType" text NOT NULL,
  "FieldId" text NOT NULL,
  "Hidden" boolean NOT NULL,
  "OrgKey" text NOT NULL,
  "ReadOnly" boolean NOT NULL,
  "Position" integer NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  PRIMARY KEY (
    "FormConfigurationParentType",
    "FieldId",
    "OrgKey"
  ),
  FOREIGN KEY ("FormConfigurationParentType", "OrgKey") REFERENCES risksmart.form_configuration("ParentType", "OrgKey") ON DELETE CASCADE
);

DROP TRIGGER custom_attribute_schema_parent_audit_trigger ON risksmart.form_configuration;

DROP FUNCTION risksmart.custom_attribute_schema_parent_modified();

/** audit tables and triggers **/
/** form_configuration audit tbl **/
ALTER TABLE risksmart.custom_attribute_schema_parent_audit
  RENAME TO form_configuration_audit;

ALTER TABLE risksmart.form_configuration_audit DROP CONSTRAINT "custom_attribute_schema_parent_audit_pkey";

ALTER TABLE risksmart.form_configuration_audit
ADD PRIMARY KEY ("ParentType", "ModifiedAtTimestamp");

CREATE OR REPLACE FUNCTION risksmart.form_configuration_modified() RETURNS trigger AS $body$
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

insert into risksmart.form_configuration_audit(
    "CustomAttributeSchemaId",
    "ParentType",
    "OrgKey",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."CustomAttributeSchemaId",
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

CREATE TRIGGER form_configuration_audit_trigger
AFTER
INSERT
  OR DELETE
  OR
UPDATE ON risksmart.form_configuration FOR EACH ROW EXECUTE FUNCTION risksmart.form_configuration_modified();

/** form_field_configuration audit tbl **/
CREATE TABLE IF NOT EXISTS risksmart.form_field_configuration_audit (LIKE risksmart.form_field_configuration);

ALTER TABLE risksmart.form_field_configuration_audit
ADD PRIMARY KEY (
    "FormConfigurationParentType",
    "FieldId",
    "ModifiedAtTimestamp"
  );

ALTER TABLE risksmart.form_field_configuration_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.form_field_configuration_modified() RETURNS trigger AS $body$
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

insert into risksmart.form_field_configuration_audit(
    "FormConfigurationParentType",
    "FieldId",
    "Hidden",
    "ReadOnly",
    "Position",
    "CreatedByUser",
    "OrgKey",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."FormConfigurationParentType",
    nr."FieldId",
    nr."Hidden",
    nr."ReadOnly",
    nr."Position",
    nr."CreatedByUser",
    nr."OrgKey",
    updated_user,
    update_timestamp,
    nr."CreatedAtTimestamp",
    TG_OP
  );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER form_field_configuration_audit_trigger
AFTER
INSERT
  OR DELETE
  OR
UPDATE ON risksmart.form_field_configuration FOR EACH ROW EXECUTE FUNCTION risksmart.form_field_configuration_modified();
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'control',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'control',
        'contributor',
        'insert'
    );
/* Temporary solution to improve permissions performance whilst schema is being simplified */
CREATE TABLE IF NOT EXISTS risksmart.node_ancestor(
    "Id" uuid,
    "AncestorId" uuid,
    "Depth" integer,
    "ObjectType" text NOT NULL,
    primary key ("Id", "AncestorId")
);

CREATE OR REPLACE FUNCTION risksmart.node_ancestor_refresh() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_ancestor na
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor_view npv
        WHERE npv."Id" = na."Id"
            AND npv."AncestorId" = na."AncestorId"
    );

INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."Depth",
    nav."ObjectType"
FROM risksmart.node_ancestor_view nav ON CONFLICT DO NOTHING;

return null;

END;

$$;

CREATE OR REPLACE VIEW risksmart.ancestor_contributor_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    na."ObjectType",
    c."ContributorType",
    na."AncestorId"
FROM risksmart.contributor_view c
    INNER JOIN risksmart.node_ancestor na ON na."AncestorId" = c."Id";

CREATE OR REPLACE VIEW risksmart.permission_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    ra."AccessType",
    na."ObjectType"
FROM risksmart.contributor_view c
    INNER JOIN auth.user u ON c."UserId" = u."Id"
    INNER JOIN risksmart.node_ancestor na ON na."AncestorId" = c."Id"
    INNER JOIN risksmart.role_access ra ON na."ObjectType" = ra."ObjectType"
    AND u."RoleKey" = ra."RoleKey"
    AND c."ContributorType" = ra."ContributorType";

CREATE OR REPLACE FUNCTION risksmart.get_ancestors(id uuid) RETURNS TABLE (
        "Id" uuid,
        "AncestorId" uuid,
        "Depth" integer,
        "ObjectType" text
    ) AS $$
select na."Id",
    na."AncestorId",
    na."Depth",
    na."ObjectType"
from risksmart.node_ancestor na
where na."Id" = id;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.action_update FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.action_parent FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.control_parent FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.document_file FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.document_assessment FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.cause FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.consequence FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.issue_update FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk_indicator FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.control_indicator FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.appetite FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.acceptance FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.indicator_result FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk_assessment FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.test_result FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.obligation_issue FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.issue_assessment FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.obligation_impact FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.obligation_assessment FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.node FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_refresh();
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'test_result',
        'owner',
        'delete'
    );
CREATE OR REPLACE VIEW risksmart.node_ancestor_view AS WITH RECURSIVE flattened_nodes(
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    ) AS (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
        UNION ALL
        SELECT ff."Id",
            f."ParentId" AS "AncestorId",
            (ff."Depth" + 1),
            ff."ObjectType",
            ff."OrgKey"
        FROM flattened_nodes ff
            INNER JOIN risksmart.node_parent_view f ON ff."AncestorId" = f."Id"
    )
SELECT fpo."Id",
    fpo."AncestorId",
    fpo."Depth",
    fpo."ObjectType",
    fpo."OrgKey"
FROM flattened_nodes fpo;

ALTER TABLE risksmart.node_ancestor
ADD COLUMN "OrgKey" text;

CREATE OR REPLACE FUNCTION risksmart.get_org_node_ancestor_view(orgKey text) RETURNS SETOF risksmart.node_ancestor AS $$ WITH RECURSIVE flattened_nodes (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    ) AS (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT ff."Id",
            f."ParentId" AS "AncestorId",
            (ff."Depth" + 1),
            ff."ObjectType",
            ff."OrgKey"
        FROM flattened_nodes ff
            INNER JOIN risksmart.node_parent_view f ON ff."AncestorId" = f."Id"
    )
SELECT fpo."Id",
    fpo."AncestorId",
    fpo."Depth",
    fpo."ObjectType",
    fpo."OrgKey"
FROM flattened_nodes fpo;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.node_ancestor_refresh() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE org_id TEXT;

BEGIN
SELECT coalesce(NEW."OrgKey", OLD."OrgKey") into org_id;

DELETE FROM risksmart.node_ancestor na
WHERE na."OrgKey" = org_id
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.get_org_node_ancestor_view(org_id) nav
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."Depth",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart.get_org_node_ancestor_view(org_id) nav
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."OrgKey" = org_id
            AND nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

return null;

END;

$$;

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.action_update FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.action_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.control_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.document_file FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.document_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.cause FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.consequence FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.issue_update FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk_indicator FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.control_indicator FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.appetite FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.acceptance FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.indicator_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.test_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.obligation_issue FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.issue_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.obligation_impact FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.obligation_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.node FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();
delete from risksmart.risk_indicator ra
where ra."RiskId" not in (
        select r."Id"
        from risksmart.risk r
    );

delete from risksmart.risk_indicator ra
where ra."IndicatorId" not in (
        select a."Id"
        from risksmart.indicator a
    );

delete from risksmart.control_indicator ca
where ca."ControlId" not in (
        select c."Id"
        from risksmart.control c
    );

delete from risksmart.control_indicator ca
where ca."IndicatorId" not in (
        select a."Id"
        from risksmart.indicator a
    );

CREATE TABLE IF NOT EXISTS risksmart.indicator_parent (
    "IndicatorId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("ParentId", "IndicatorId")
);

ALTER TABLE risksmart.indicator_parent
ADD CONSTRAINT "indicator_parent_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.indicator_parent
ADD CONSTRAINT "indicator_parent_indicatorId_fkey" FOREIGN KEY ("IndicatorId") REFERENCES risksmart.indicator("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.indicator_parent
ADD CONSTRAINT "indicator_parent_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.indicator_parent
ADD CONSTRAINT "indicator_parent_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.indicator_parent
ADD CONSTRAINT "indicator_parent_organisationKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

CREATE INDEX "idx_indicator_parent_actionId_parentId" on risksmart.indicator_parent using btree ("IndicatorId", "ParentId");

CREATE TABLE IF NOT EXISTS risksmart.indicator_parent_audit (
    "IndicatorId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentId", "IndicatorId", "ModifiedAtTimestamp")
);

INSERT INTO risksmart.indicator_parent (
        "IndicatorId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT ra."IndicatorId",
    ra."RiskId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp"
FROM risksmart.risk_indicator ra;

INSERT INTO risksmart.indicator_parent (
        "IndicatorId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT ra."IndicatorId",
    ra."ControlId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp"
FROM risksmart.control_indicator ra;

/* No audit tables for control_indicator or risk_indicator so cannot populate */
CREATE OR REPLACE FUNCTION risksmart.indicator_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.indicator_parent_audit(
        "IndicatorId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."IndicatorId",
        nr."ParentId",
        nr."OrgKey",
        nr."CreatedByUser",
        updated_user,
        update_timestamp,
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER indicator_parent_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.indicator_parent FOR EACH ROW EXECUTE FUNCTION risksmart.indicator_parent_modified();

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT ap."ControlId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.control_parent ap
UNION ALL
SELECT ip."IndicatorId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.indicator_parent ip
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT oi."IssueId",
    oi."ObligationId",
    oi."OrgKey"
FROM risksmart.obligation_issue oi
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId",
    df."OrgKey"
FROM risksmart.document_file df;

DROP TABLE risksmart.risk_indicator;

DROP TABLE risksmart.control_indicator;

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.indicator_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'indicator_result',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'indicator',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'indicator',
        'contributor',
        'insert'
    );
-- add a fk constraint
ALTER TABLE risksmart.form_field_configuration
ADD CONSTRAINT "form_field_parent_type_fk" FOREIGN KEY ("FormConfigurationParentType") REFERENCES risksmart.parent_type("Value") ON DELETE CASCADE;
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'indicator',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'indicator',
        'contributor',
        'update'
    );
-- make a column nullable
ALTER TABLE risksmart.form_configuration
ALTER COLUMN "CustomAttributeSchemaId" DROP NOT NULL;
-- make a column nullable
ALTER TABLE risksmart.form_configuration_audit
ALTER COLUMN "CustomAttributeSchemaId" DROP NOT NULL;
ALTER TABLE risksmart.counter
ADD CONSTRAINT "Counter_Name_fkey" FOREIGN KEY ("Name") REFERENCES risksmart.parent_type("Value");

ALTER TABLE risksmart.control
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.control_audit
ADD COLUMN "SequentialId" integer NULL;

-- Create triggers to populate audit tables
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
        "Action"
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
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER set_sequential_id_trigger BEFORE
INSERT ON risksmart.control for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'control') AS "SequentialId"
FROM risksmart.control
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.control i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_control_orgKey_sequentialid ON risksmart.control("OrgKey", "SequentialId");
ALTER TABLE risksmart.risk
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.risk_audit
ADD COLUMN "SequentialId" integer NULL;

-- Create triggers to populate audit tables
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
        "SequentialId"
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
        nr."SequentialId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER set_sequential_id_trigger BEFORE
INSERT ON risksmart.risk for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'risk') AS "SequentialId"
FROM risksmart.risk
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.risk i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_risk_orgKey_sequentialid ON risksmart.risk("OrgKey", "SequentialId");
ALTER TABLE risksmart.action
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.action_audit
ADD COLUMN "SequentialId" integer NULL;

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.action_modified() RETURNS trigger AS $body$
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

insert into risksmart.action_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "DateRaised",
        "DateDue",
        "Status",
        "Priority",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ClosedDate",
        "SequentialId",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."DateRaised",
        nr."DateDue",
        nr."Status",
        nr."Priority",
        nr."Description",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."ClosedDate",
        nr."SequentialId",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER set_sequential_id_trigger BEFORE
INSERT ON risksmart.action for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'action') AS "SequentialId"
FROM risksmart.action
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.action i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_action_orgKey_sequentialid ON risksmart.action("OrgKey", "SequentialId");
ALTER TABLE risksmart.indicator
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.indicator_audit
ADD COLUMN "SequentialId" integer NULL;

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.indicator_modified() RETURNS trigger AS $body$
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

insert into risksmart.indicator_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Type",
        "TestFrequency",
        "Unit",
        "UpperToleranceNum",
        "LowerToleranceNum",
        "TargetValueTxt",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "SequentialId",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Description",
        nr."Type",
        nr."TestFrequency",
        nr."Unit",
        nr."UpperToleranceNum",
        nr."LowerToleranceNum",
        nr."TargetValueTxt",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."SequentialId",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER set_sequential_id_trigger BEFORE
INSERT ON risksmart.indicator for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'indicator') AS "SequentialId"
FROM risksmart.indicator
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.indicator i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_indicator_orgKey_sequentialid ON risksmart.indicator("OrgKey", "SequentialId");
ALTER TABLE risksmart.form_field_configuration
  RENAME TO form_field_ordering;

ALTER TABLE risksmart.form_field_configuration_audit
  RENAME TO form_field_ordering_audit;

ALTER TABLE risksmart.form_field_ordering DROP COLUMN "Hidden";

ALTER TABLE risksmart.form_field_ordering DROP COLUMN "ReadOnly";

DROP TRIGGER form_field_configuration_audit_trigger ON risksmart.form_field_ordering;

CREATE OR REPLACE FUNCTION risksmart.form_field_ordering_modified() RETURNS trigger AS $body$
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

insert into risksmart.form_field_ordering_audit(
    "FormConfigurationParentType",
    "FieldId",
    "Position",
    "CreatedByUser",
    "OrgKey",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."FormConfigurationParentType",
    nr."FieldId",
    nr."Position",
    nr."CreatedByUser",
    nr."OrgKey",
    updated_user,
    update_timestamp,
    nr."CreatedAtTimestamp",
    TG_OP
  );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER form_field_ordering_audit_trigger
AFTER
INSERT
  OR DELETE
  OR
UPDATE ON risksmart.form_field_ordering FOR EACH ROW EXECUTE FUNCTION risksmart.form_field_ordering_modified();
ALTER TABLE risksmart.form_field_ordering_audit DROP COLUMN "Hidden";

ALTER TABLE risksmart.form_field_ordering_audit DROP COLUMN "ReadOnly";
CREATE TABLE IF NOT EXISTS risksmart.form_field_configuration (
  "FormConfigurationParentType" text NOT NULL,
  "FieldId" text NOT NULL,
  "Hidden" boolean NOT NULL,
  "Required" boolean NOT NULL,
  "ReadOnly" boolean NOT NULL,
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  PRIMARY KEY (
    "FormConfigurationParentType",
    "FieldId",
    "OrgKey"
  ),
  FOREIGN KEY ("FormConfigurationParentType", "OrgKey") REFERENCES risksmart.form_configuration("ParentType", "OrgKey") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS risksmart.form_field_configuration_audit (LIKE risksmart.form_field_configuration);

ALTER TABLE risksmart.form_field_configuration_audit
ADD PRIMARY KEY (
    "FormConfigurationParentType",
    "FieldId",
    "ModifiedAtTimestamp"
  );

ALTER TABLE risksmart.form_field_configuration_audit
ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.form_field_configuration_modified() RETURNS trigger AS $body$
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

insert into risksmart.form_field_configuration_audit(
    "FormConfigurationParentType",
    "FieldId",
    "Hidden",
    "ReadOnly",
    "Position",
    "CreatedByUser",
    "OrgKey",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."FormConfigurationParentType",
    nr."FieldId",
    nr."Hidden",
    nr."ReadOnly",
    nr."Position",
    nr."CreatedByUser",
    nr."OrgKey",
    updated_user,
    update_timestamp,
    nr."CreatedAtTimestamp",
    TG_OP
  );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER form_field_configuration_audit_trigger
AFTER
INSERT
  OR DELETE
  OR
UPDATE ON risksmart.form_field_configuration FOR EACH ROW EXECUTE FUNCTION risksmart.form_field_configuration_modified();
/* Issue parent */
CREATE TABLE IF NOT EXISTS risksmart.issue_parent (
    "IssueId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("ParentId", "IssueId")
);

ALTER TABLE risksmart.issue_parent
ADD CONSTRAINT "issue_parent_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.issue_parent
ADD CONSTRAINT "issue_parent_IssueId_fkey" FOREIGN KEY ("IssueId") REFERENCES risksmart.issue("Id") ON DELETE CASCADE;

/* Will reintroduce in a future release */
/*
 ALTER TABLE risksmart.issue_parent
 ADD CONSTRAINT "issue_parent_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");
 
 ALTER TABLE risksmart.issue_parent
 ADD CONSTRAINT "issue_parent_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");
 
 */
ALTER TABLE risksmart.issue_parent
ADD CONSTRAINT "issue_parent_organisationKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

CREATE INDEX "idx_issue_parent_controlId_parentId" on risksmart.issue_parent using btree ("IssueId", "ParentId");

CREATE TABLE IF NOT EXISTS risksmart.issue_parent_audit (
    "IssueId" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentId", "IssueId", "ModifiedAtTimestamp")
);

/* Associated control inserts */
INSERT INTO risksmart.issue_parent_audit (
        "IssueId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."ParentIssueId",
    a."AssociatedControlId",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of change, not initial record insert
    a."ModifiedAtTimestamp",
    'INSERT'
from (
        (
            SELECT o."ParentIssueId",
                o."AssociatedControlId",
                LAG(o."AssociatedControlId") OVER (
                    PARTITION BY o."ParentIssueId"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousAssociatedControlId",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp"
            FROM risksmart.issue_assessment_audit o
        )
    ) a
where coalesce(a."AssociatedControlId"::text, '') != coalesce(a."PreviousAssociatedControlId"::text, '')
    AND a."AssociatedControlId" IS NOT NULL ON CONFLICT DO NOTHING;

/* Associated control deletes */
INSERT INTO risksmart.issue_parent_audit (
        "IssueId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
select a."ParentIssueId",
    a."PreviousAssociatedControlId",
    a."OrgKey",
    a."CreatedByUser",
    a."ModifiedByUser",
    a."ModifiedAtTimestamp",
    -- set created time as modified time as interested in insert time of change, not initial record insert
    a."ModifiedAtTimestamp",
    'DELETE'
from (
        (
            SELECT o."ParentIssueId",
                o."AssociatedControlId",
                LAG(o."AssociatedControlId") OVER (
                    PARTITION BY o."ParentIssueId"
                    ORDER BY o."ModifiedAtTimestamp"
                ) AS "PreviousAssociatedControlId",
                o."OrgKey",
                o."CreatedByUser",
                o."ModifiedByUser",
                o."ModifiedAtTimestamp",
                o."CreatedAtTimestamp",
                o."Action"
            FROM risksmart.issue_assessment_audit o
        )
    ) a
where (
        coalesce(a."AssociatedControlId"::text, '') != coalesce(a."PreviousAssociatedControlId"::text, '')
        OR a."Action" = 'DELETE'
    )
    AND a."PreviousAssociatedControlId" IS NOT NULL ON CONFLICT DO NOTHING;

/* Obligation issue */
INSERT INTO risksmart.issue_parent_audit (
        "IssueId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
SELECT ra."IssueId",
    ra."ObligationId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp",
    ra."Action"
FROM risksmart.obligation_issue_audit ra;

/* Document issue */
INSERT INTO risksmart.issue_parent_audit (
        "IssueId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
SELECT ra."IssueId",
    ra."DocumentId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."ModifiedByUser",
    ra."ModifiedAtTimestamp",
    ra."CreatedAtTimestamp",
    ra."Action"
FROM risksmart.document_issue_audit ra;

/*
 Create parent records from audit so that we get the correct  
 CreatedByUser",
 "ModifiedByUser",
 "ModifiedAtTimestamp",
 "CreatedAtTimestamp"
 details, rather then relying on the latest details
 */
INSERT INTO risksmart.issue_parent (
        "IssueId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT l."IssueId",
    l."ParentId",
    l."OrgKey",
    l."CreatedByUser",
    l."ModifiedByUser",
    l."ModifiedAtTimestamp",
    l."CreatedAtTimestamp"
FROM (
        SELECT DISTINCT ON (c."ParentId", c."IssueId") c."ParentId",
            c."IssueId",
            c."OrgKey",
            c."CreatedByUser",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp",
            c."CreatedAtTimestamp",
            c."Action"
        FROM risksmart.issue_parent_audit c
        ORDER BY c."ParentId",
            c."IssueId",
            "ModifiedAtTimestamp" DESC
    ) l
WHERE l."Action" = 'INSERT';

/* Audit */
CREATE OR REPLACE FUNCTION risksmart.issue_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.issue_parent_audit(
        "IssueId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."IssueId",
        nr."ParentId",
        nr."OrgKey",
        nr."CreatedByUser",
        updated_user,
        update_timestamp,
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER issue_parent_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.issue_parent FOR EACH ROW EXECUTE FUNCTION risksmart.issue_parent_modified();

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT ap."ControlId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.control_parent ap
UNION ALL
SELECT ip."IndicatorId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.indicator_parent ip
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT ip."IssueId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.issue_parent ip
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId",
    df."OrgKey"
FROM risksmart.document_file df;

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.issue_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

DROP TABLE risksmart.document_issue;

DROP TABLE risksmart.obligation_issue;

ALTER TABLE risksmart.issue_assessment DROP COLUMN "AssociatedControlId";

ALTER TABLE risksmart.issue_assessment_audit DROP COLUMN "AssociatedControlId";

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
-- add a fk constraint
ALTER TABLE risksmart.form_field_configuration
ADD CONSTRAINT "form_field_parent_type_fk" FOREIGN KEY ("FormConfigurationParentType") REFERENCES risksmart.parent_type("Value") ON DELETE CASCADE;
CREATE OR REPLACE FUNCTION risksmart.form_field_configuration_modified() RETURNS trigger AS $body$
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

insert into risksmart.form_field_configuration_audit(
    "FormConfigurationParentType",
    "FieldId",
    "Hidden",
    "ReadOnly",
    "Required",
    "CreatedByUser",
    "OrgKey",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."FormConfigurationParentType",
    nr."FieldId",
    nr."Hidden",
    nr."ReadOnly",
    nr."Required",
    nr."CreatedByUser",
    nr."OrgKey",
    updated_user,
    update_timestamp,
    nr."CreatedAtTimestamp",
    TG_OP
  );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
/* Removing ObjectType from permission_view so its clear these are permissions associated with the "Id"  in question */
DROP VIEW risksmart.permission_view;

CREATE OR REPLACE VIEW risksmart.permission_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    ra."AccessType"
FROM risksmart.contributor_view c
    INNER JOIN auth.user u ON c."UserId" = u."Id"
    INNER JOIN risksmart.node_ancestor na ON na."AncestorId" = c."Id"
    INNER JOIN risksmart.role_access ra ON na."ObjectType" = ra."ObjectType"
    AND u."RoleKey" = ra."RoleKey"
    AND c."ContributorType" = ra."ContributorType";

/* Check whether the user has permission to insert "ObjectType" under "Id". Note, this doesn't check from a business logic
 perspective whether the insert should be allowed  */
CREATE OR REPLACE VIEW risksmart.insert_permission_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    ra."ObjectType"
FROM risksmart.contributor_view c
    INNER JOIN auth.user u ON c."UserId" = u."Id"
    INNER JOIN risksmart.node_ancestor na ON na."AncestorId" = c."Id"
    INNER JOIN risksmart.role_access ra ON u."RoleKey" = ra."RoleKey"
    AND c."ContributorType" = ra."ContributorType"
WHERE ra."AccessType" = 'insert';
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'appetite',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'risk_assessment',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'risk_assessment',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'acceptance',
        'owner',
        'delete'
    );
insert into risksmart.parent_type ("Value", "Comment")
values (
        'custom_attribute_schema',
        'Custom attribute schema'
    );

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'RiskManager',
        'custom_attribute_schema',
        'any',
        'update'
    );
ALTER TABLE risksmart.obligation
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.obligation_audit
ADD COLUMN "SequentialId" integer NULL;

-- Create triggers to populate audit tables
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
        "SequentialId"
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
        nr."SequentialId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER set_sequential_id_trigger BEFORE
INSERT ON risksmart.obligation for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'obligation') AS "SequentialId"
FROM risksmart.obligation
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.obligation i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_obligation_orgKey_sequentialid ON risksmart.obligation("OrgKey", "SequentialId");
ALTER TABLE risksmart.document
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.document_audit
ADD COLUMN "SequentialId" integer NULL;

-- Create triggers to populate audit tables
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
        "SequentialId"
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
        nr."SequentialId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER set_sequential_id_trigger BEFORE
INSERT ON risksmart.document for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'document') AS "SequentialId"
FROM risksmart.document
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.document i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_document_orgKey_sequentialid ON risksmart.document("OrgKey", "SequentialId");
-- Clear parent risk id on child risk
CREATE OR REPLACE FUNCTION risksmart.clear_child_risk_parents() RETURNS trigger AS $body$
DECLARE nr RECORD;

BEGIN if (
    TG_OP = 'UPDATE'
    AND NEW."Tier" <> OLD."Tier"
) THEN
UPDATE risksmart.risk
SET "ParentRiskId" = NULL,
    "ModifiedAtTimestamp" = NEW."ModifiedAtTimestamp",
    "ModifiedByUser" = NEW."ModifiedByUser"
WHERE "ParentRiskId" = NEW."Id"
    AND "OrgKey" = NEW."OrgKey";

RETURN NEW;

elsif (TG_OP = 'DELETE') then
UPDATE risksmart.risk
SET "ParentRiskId" = NULL,
    "ModifiedAtTimestamp" = statement_timestamp(),
    "ModifiedByUser" = risksmart.get_hasura_user_id()
WHERE "ParentRiskId" = OLD."Id"
    AND "OrgKey" = OLD."OrgKey";

RETURN OLD;

else RETURN NEW;

END IF;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER clear_child_risk_parents_trigger
AFTER
UPDATE
    OR DELETE ON risksmart.risk FOR EACH ROW EXECUTE FUNCTION risksmart.clear_child_risk_parents();
CREATE TABLE IF NOT EXISTS "risksmart"."assessment" (
    "Id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "SequentialId" integer NULL,
    "Title" text NOT NULL,
    "Summary" text NOT NULL,
    "TargetCompletionDate" timestamptz,
    "ActualCompletionDate" timestamptz,
    "StartDate" timestamptz,
    "NextTestDate" timestamptz,
    "OrgKey" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    PRIMARY KEY ("Id")
);

ALTER TABLE risksmart."assessment"
ADD CONSTRAINT "assessment_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart."assessment"
ADD CONSTRAINT "assessment_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart."assessment"
ADD CONSTRAINT "assessment_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

CREATE TRIGGER set_sequential_id_trigger BEFORE
INSERT ON risksmart.assessment for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'assessment') AS "SequentialId"
FROM risksmart.assessment
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.assessment i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_assessment_orgKey_sequentialid ON risksmart.assessment("OrgKey", "SequentialId");

CREATE TABLE IF NOT EXISTS risksmart."assessment_audit" (
    "Id" uuid not null,
    "SequentialId" integer NULL,
    "Title" text NOT NULL,
    "Summary" text NOT NULL,
    "TargetCompletionDate" timestamptz,
    "ActualCompletionDate" timestamptz,
    "StartDate" timestamptz,
    "NextTestDate" timestamptz,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE TABLE IF NOT EXISTS "risksmart"."document_assessment_result" (
    "Id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "AssessmentId" uuid NOT NULL,
    "DocumentId" uuid NOT NULL,
    "Rating" integer NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    PRIMARY KEY ("Id")
);

ALTER TABLE risksmart."document_assessment_result"
ADD CONSTRAINT "document_assessment_result_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart."document_assessment_result"
ADD CONSTRAINT "document_assessment_result_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart."document_assessment_result"
ADD CONSTRAINT Rating_check CHECK ("Rating" IN (1, 2, 3, 4, 5));

ALTER TABLE risksmart."document_assessment_result"
ADD CONSTRAINT "document_assessment_id_fkey" FOREIGN KEY ("AssessmentId") REFERENCES risksmart.assessment("Id") ON DELETE CASCADE;

ALTER TABLE risksmart."document_assessment_result"
ADD CONSTRAINT "document_assessment_document_id_fkey" FOREIGN KEY ("DocumentId") REFERENCES risksmart.document("Id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS risksmart."document_assessment_result_audit" (
    "Id" uuid NOT NULL,
    "AssessmentId" uuid NOT NULL,
    "DocumentId" uuid NOT NULL,
    "Rating" integer NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE TABLE IF NOT EXISTS "risksmart"."obligation_assessment_result" (
    "Id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "AssessmentId" uuid NOT NULL,
    "ObligationId" uuid NOT NULL,
    "Rating" integer NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    PRIMARY KEY ("Id")
);

ALTER TABLE risksmart."obligation_assessment_result"
ADD CONSTRAINT "obligation_assessment_result_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart."obligation_assessment_result"
ADD CONSTRAINT "obligation_assessment_result_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart."obligation_assessment_result"
ADD CONSTRAINT Rating_check CHECK ("Rating" IN (1, 2, 3, 4, 5));

ALTER TABLE risksmart."obligation_assessment_result"
ADD CONSTRAINT "obligation_assessment_id_fkey" FOREIGN KEY ("AssessmentId") REFERENCES risksmart.assessment("Id") ON DELETE CASCADE;

ALTER TABLE risksmart."obligation_assessment_result"
ADD CONSTRAINT "obligation_assessment_obligation_id_fkey" FOREIGN KEY ("ObligationId") REFERENCES risksmart.obligation("Id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS risksmart."obligation_assessment_result_audit" (
    "Id" uuid NOT NULL,
    "AssessmentId" uuid NOT NULL,
    "DocumentId" uuid NOT NULL,
    "Rating" integer NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE TABLE IF NOT EXISTS "risksmart"."risk_assessment_result" (
    "Id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "AssessmentId" uuid NOT NULL,
    "RiskId" uuid NOT NULL,
    "ControlType" text not null,
    "Likelihood" integer,
    "Impact" integer,
    "Rating" integer not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    PRIMARY KEY ("Id")
);

ALTER TABLE risksmart."risk_assessment_result"
ADD CONSTRAINT "risk_assessment_result_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart."risk_assessment_result"
ADD CONSTRAINT "risk_assessment_result_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart."risk_assessment_result"
ADD CONSTRAINT "risk_assessment_id_fkey" FOREIGN KEY ("AssessmentId") REFERENCES risksmart.assessment("Id") ON DELETE CASCADE;

ALTER TABLE risksmart."risk_assessment_result"
ADD CONSTRAINT "risk_assessment_risk_id_fkey" FOREIGN KEY ("RiskId") REFERENCES risksmart.risk("Id") ON DELETE CASCADE;

CREATE TABLE "risksmart"."risk_assessment_result_control_type" (
    "Value" text NOT NULL,
    "Comment" text NOT NULL,
    PRIMARY KEY ("Value"),
    UNIQUE ("Value")
);

INSERT INTO "risksmart"."risk_assessment_result_control_type" ("Value", "Comment")
VALUES ('Controlled', 'Controlled'),
    ('Uncontrolled', 'Uncontrolled');

ALTER TABLE "risksmart"."risk_assessment_result"
ADD CONSTRAINT "risk_assessment_result_control_type_fkey" FOREIGN KEY ("ControlType") REFERENCES "risksmart"."risk_assessment_result_control_type" ("Value");

ALTER TABLE risksmart."risk_assessment_result"
ADD CONSTRAINT Likelihood_check CHECK (
        "Likelihood" IN (1, 2, 3, 4, 5)
        OR "Likelihood" IS NULL
    );

ALTER TABLE risksmart."risk_assessment_result"
ADD CONSTRAINT Impact_check CHECK (
        "Impact" IN (1, 2, 3, 4, 5)
        OR "Impact" IS NULL
    );

ALTER TABLE risksmart."risk_assessment_result"
ADD CONSTRAINT Rating_check CHECK ("Rating" IN (1, 2, 3, 4, 5));

CREATE TABLE IF NOT EXISTS risksmart."risk_assessment_result_audit" (
    "Id" uuid NOT NULL,
    "AssessmentId" uuid NOT NULL,
    "RiskId" uuid NOT NULL,
    "ControlType" text not null,
    "Likelihood" integer,
    "Impact" integer,
    "Rating" integer not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

insert into risksmart."parent_type" ("Value", "Comment")
values ('assessment', 'Assessment'),
    (
        'document_assessment_result',
        'Document Assessment Result'
    ),
    (
        'obligation_assessment_result',
        'Obligation Assessment Result'
    ),
    (
        'risk_assessment_result',
        'Risk Assessment Result'
    );

INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT a."Id",
    'assessment',
    a."OrgKey"
FROM risksmart.assessment a;

INSERT INTO risksmart.role_access(
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES -- Standard
    ('Standard', 'assessment', 'owner', 'read'),
    ('Standard', 'assessment', 'owner', 'update'),
    ('Standard', 'assessment', 'owner', 'delete'),
    ('Standard', 'assessment', 'contributor', 'read'),
    (
        'Standard',
        'assessment',
        'contributor',
        'update'
    ),
    -- Risk Manager
    ('RiskManager', 'assessment', 'any', 'read'),
    ('RiskManager', 'assessment', 'any', 'update'),
    ('RiskManager', 'assessment', 'any', 'delete'),
    ('RiskManager', 'assessment', 'any', 'insert'),
    -- Read only
    ('ReadOnly', 'assessment', 'any', 'read'),
    -- Standard
    (
        'Standard',
        'document_assessment_result',
        'owner',
        'read'
    ),
    (
        'Standard',
        'document_assessment_result',
        'owner',
        'update'
    ),
    (
        'Standard',
        'document_assessment_result',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'document_assessment_result',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'document_assessment_result',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'obligation_assessment_result',
        'owner',
        'read'
    ),
    (
        'Standard',
        'obligation_assessment_result',
        'owner',
        'update'
    ),
    (
        'Standard',
        'obligation_assessment_result',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'obligation_assessment_result',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'obligation_assessment_result',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'risk_assessment_result',
        'owner',
        'read'
    ),
    (
        'Standard',
        'risk_assessment_result',
        'owner',
        'update'
    ),
    (
        'Standard',
        'risk_assessment_result',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'risk_assessment_result',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'risk_assessment_result',
        'contributor',
        'update'
    ),
    -- Risk Manager
    (
        'RiskManager',
        'document_assessment_result',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'document_assessment_result',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'document_assessment_result',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'document_assessment_result',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'obligation_assessment_result',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'obligation_assessment_result',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'obligation_assessment_result',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'obligation_assessment_result',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'risk_assessment_result',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'risk_assessment_result',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'risk_assessment_result',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'risk_assessment_result',
        'any',
        'insert'
    ),
    -- Read only
    (
        'ReadOnly',
        'document_assessment_result',
        'any',
        'read'
    ),
    (
        'ReadOnly',
        'obligation_assessment_result',
        'any',
        'read'
    ),
    (
        'ReadOnly',
        'risk_assessment_result',
        'any',
        'read'
    );

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT dar."Id",
    dar."AssessmentId" as "ParentId",
    dar."OrgKey"
FROM risksmart.document_assessment_result dar
UNION ALL
SELECT oar."Id",
    oar."AssessmentId" as "ParentId",
    oar."OrgKey"
FROM risksmart.obligation_assessment_result oar
UNION ALL
SELECT rar."Id",
    rar."AssessmentId" as "ParentId",
    rar."OrgKey"
FROM risksmart.risk_assessment_result rar
UNION ALL
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT ap."ControlId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.control_parent ap
UNION ALL
SELECT ip."IndicatorId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.indicator_parent ip
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT ip."IssueId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.issue_parent ip
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId",
    df."OrgKey"
FROM risksmart.document_file df;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.assessment
ADD CONSTRAINT "node_assessment_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.document_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.document_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.document_assessment_result
ADD CONSTRAINT "node_document_assessment_result_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.document_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.obligation_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.obligation_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.obligation_assessment_result
ADD CONSTRAINT "node_obligation_assessment_result_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.obligation_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.risk_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.risk_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.risk_assessment_result
ADD CONSTRAINT "node_risk_assessment_result_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();
-- Clear parent risk id on child risk
CREATE OR REPLACE FUNCTION risksmart.clear_child_obligation_parents() RETURNS trigger AS $body$
DECLARE nr RECORD;

BEGIN if (
    TG_OP = 'UPDATE'
    AND NEW."Type" <> OLD."Type"
) THEN
UPDATE risksmart.obligation
SET "ParentId" = NULL,
    "ModifiedAtTimestamp" = NEW."ModifiedAtTimestamp",
    "ModifiedByUser" = NEW."ModifiedByUser"
WHERE "ParentId" = NEW."Id"
    AND "OrgKey" = NEW."OrgKey";

RETURN NEW;

elsif (TG_OP = 'DELETE') then
UPDATE risksmart.obligation
SET "ParentId" = NULL,
    "ModifiedAtTimestamp" = statement_timestamp(),
    "ModifiedByUser" = risksmart.get_hasura_user_id()
WHERE "ParentId" = OLD."Id"
    AND "OrgKey" = OLD."OrgKey";

RETURN OLD;

else RETURN NEW;

END IF;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER clear_child_obligation_parents_trigger
AFTER
UPDATE
    OR DELETE ON risksmart.obligation FOR EACH ROW EXECUTE FUNCTION risksmart.clear_child_obligation_parents();
insert into risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
values ('Standard', 'public_policies', 'any', 'read');

/* View to check if a user has access to all items of a particular type  */
CREATE OR REPLACE VIEW risksmart.user_role_access AS
SELECT u."Id" as "UserId",
    ra."ObjectType",
    ra."AccessType"
FROM risksmart.role_access ra
    INNER JOIN auth.user u ON u."RoleKey" = ra."RoleKey"
    AND ra."ContributorType" = 'any';
ALTER TABLE risksmart.node
ADD "SequentialId" int NULL;

CREATE OR REPLACE FUNCTION risksmart.node_insert() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE sequential_id integer;

BEGIN BEGIN sequential_id := NEW."SequentialId";

EXCEPTION
WHEN undefined_column THEN sequential_id := NULL;

END;

INSERT INTO risksmart.node ("Id", "ObjectType", "OrgKey", "SequentialId")
VALUES(
        NEW."Id",
        TG_TABLE_NAME,
        NEW."OrgKey",
        sequential_id
    )
RETURNING "Id" INTO NEW."Id";

RETURN NEW;

END;

$$;

/* Rename triggers to ensure they run before node_insert (triggers run in alphabetical order) */
ALTER TRIGGER issue_set_sequential_id_trigger ON risksmart.issue
RENAME TO a_set_sequential_id_trigger;

ALTER TRIGGER set_sequential_id_trigger ON risksmart.control
RENAME TO a_set_sequential_id_trigger;

ALTER TRIGGER set_sequential_id_trigger ON risksmart.risk
RENAME TO a_set_sequential_id_trigger;

ALTER TRIGGER set_sequential_id_trigger ON risksmart.action
RENAME TO a_set_sequential_id_trigger;

ALTER TRIGGER set_sequential_id_trigger ON risksmart.indicator
RENAME TO a_set_sequential_id_trigger;

ALTER TRIGGER set_sequential_id_trigger ON risksmart.obligation
RENAME TO a_set_sequential_id_trigger;

ALTER TRIGGER set_sequential_id_trigger ON risksmart.document
RENAME TO a_set_sequential_id_trigger;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

UPDATE risksmart.node n
SET "SequentialId" = o."SequentialId"
FROM risksmart.issue o
WHERE n."Id" = o."Id";

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

UPDATE risksmart.node n
SET "SequentialId" = o."SequentialId"
FROM risksmart.action o
WHERE n."Id" = o."Id";

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

UPDATE risksmart.node n
SET "SequentialId" = o."SequentialId"
FROM risksmart.obligation o
WHERE n."Id" = o."Id";

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

UPDATE risksmart.node n
SET "SequentialId" = o."SequentialId"
FROM risksmart.control o
WHERE n."Id" = o."Id";

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

UPDATE risksmart.node n
SET "SequentialId" = o."SequentialId"
FROM risksmart.risk o
WHERE n."Id" = o."Id";

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

UPDATE risksmart.node n
SET "SequentialId" = o."SequentialId"
FROM risksmart.document o
WHERE n."Id" = o."Id";

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

UPDATE risksmart.node n
SET "SequentialId" = o."SequentialId"
FROM risksmart.indicator o
WHERE n."Id" = o."Id";

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;
CREATE OR REPLACE FUNCTION risksmart.get_org_node_ancestor_view(orgKey text) RETURNS SETOF risksmart.node_ancestor AS $$ WITH RECURSIVE flattened_nodes (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    ) AS (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT ff."Id",
            f."ParentId" AS "AncestorId",
            (ff."Depth" + 1),
            ff."ObjectType",
            ff."OrgKey"
        FROM flattened_nodes ff
            INNER JOIN risksmart.node_parent_view f ON ff."AncestorId" = f."Id"
    )
SELECT DISTINCT fpo."Id",
    fpo."AncestorId",
    fpo."Depth",
    fpo."ObjectType",
    fpo."OrgKey"
FROM flattened_nodes fpo;

$$ LANGUAGE SQL STABLE;
update risksmart.risk
set "ParentRiskId" = NULL,
    "ModifiedAtTimestamp" = now()
WHERE "ParentRiskId" NOT IN (
        SELECT r."Id"
        FROM risksmart.risk r
    );
CREATE TABLE risksmart.owner_group (
    "ParentId" uuid NOT NULL,
    "UserGroupId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    primary key ("ParentId", "UserGroupId")
);

CREATE TABLE risksmart.owner_group_audit (
    "ParentId" uuid NOT NULL,
    "UserGroupId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentId", "UserGroupId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.owner_group
ADD CONSTRAINT "owner_group_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.owner_group
ADD CONSTRAINT "owner_group_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.owner_group
ADD CONSTRAINT "owner_group_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.owner_group
ADD CONSTRAINT "owner_group_UserGroupId_fkey" FOREIGN KEY ("UserGroupId") REFERENCES risksmart.user_group("Id") ON DELETE CASCADE;

;

ALTER TABLE risksmart.owner_group
ADD CONSTRAINT "owner_group_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

CREATE INDEX "owner_group_userGroupId_parentId" on risksmart.owner_group using btree ("UserGroupId", "ParentId");

CREATE OR REPLACE FUNCTION risksmart.owner_group_modified() RETURNS trigger AS $body$
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

insert into risksmart.owner_group_audit(
        "ParentId",
        "UserGroupId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentId",
        nr."UserGroupId",
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

CREATE TRIGGER owner_group_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.owner_group FOR EACH ROW EXECUTE FUNCTION risksmart.owner_group_modified();
CREATE TABLE risksmart.contributor_group (
    "ParentId" uuid NOT NULL,
    "UserGroupId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    primary key ("ParentId", "UserGroupId")
);

CREATE TABLE risksmart.contributor_group_audit (
    "ParentId" uuid NOT NULL,
    "UserGroupId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("ParentId", "UserGroupId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.contributor_group
ADD CONSTRAINT "contributor_group_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.contributor_group
ADD CONSTRAINT "contributor_group_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.contributor_group
ADD CONSTRAINT "contributor_group_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.contributor_group
ADD CONSTRAINT "contributor_group_UserGroupId_fkey" FOREIGN KEY ("UserGroupId") REFERENCES risksmart.user_group("Id") ON DELETE CASCADE;

;

ALTER TABLE risksmart.contributor_group
ADD CONSTRAINT "contributor_group_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

;

CREATE INDEX "contributor_group_userGroupId_parentId" on risksmart.contributor_group using btree ("UserGroupId", "ParentId");

CREATE OR REPLACE FUNCTION risksmart.contributor_group_modified() RETURNS trigger AS $body$
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

insert into risksmart.contributor_group_audit(
        "ParentId",
        "UserGroupId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentId",
        nr."UserGroupId",
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

CREATE TRIGGER contributor_group_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.contributor_group FOR EACH ROW EXECUTE FUNCTION risksmart.contributor_group_modified();
CREATE TABLE risksmart.user_group_user (
    "UserGroupId" uuid NOT NULL,
    "UserId" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL default statement_timestamp(),
    primary key ("UserGroupId", "UserId")
);

CREATE TABLE risksmart.user_group_user_audit (
    "UserGroupId" uuid NOT NULL,
    "UserId" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("UserGroupId", "UserId", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.user_group_user
ADD CONSTRAINT "user_group_user_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.user_group_user
ADD CONSTRAINT "user_group_user_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.user_group_user
ADD CONSTRAINT "user_group_user_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.user_group_user
ADD CONSTRAINT "user_group_user_userId_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.user_group_user
ADD CONSTRAINT "user_group_user_UserGroupId_fkey" FOREIGN KEY ("UserGroupId") REFERENCES risksmart.user_group("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.user_group_user
ADD CONSTRAINT "user_group_user_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES auth.user("Id");

CREATE INDEX "user_group_user_userId_userGroupId" on risksmart.user_group_user using btree ("UserId", "UserGroupId");

CREATE OR REPLACE FUNCTION risksmart.user_group_user_modified() RETURNS trigger AS $body$
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

insert into risksmart.user_group_user_audit(
        "UserGroupId",
        "UserId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."UserGroupId",
        nr."UserId",
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

CREATE TRIGGER user_group_user_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.user_group_user FOR EACH ROW EXECUTE FUNCTION risksmart.user_group_user_modified();
CREATE OR REPLACE VIEW risksmart.contributor_view AS --  Contributor permissions
SELECT c."ParentId" as "Id",
    c."OrgKey",
    c."UserId",
    'contributor' as "ContributorType",
    null as "UserGroupId"
FROM risksmart.contributor c
UNION ALL
-- Contributor permissions
SELECT cg."ParentId",
    cg."OrgKey",
    ugu."UserId",
    'contributor',
    cg."UserGroupId"
FROM risksmart.contributor_group cg
    INNER JOIN risksmart.user_group_user ugu ON cg."UserGroupId" = ugu."UserGroupId"
UNION ALL
-- Owner permissions
SELECT o."ParentId",
    o."OrgKey",
    o."UserId",
    'owner',
    null
FROM risksmart.owner o
UNION ALL
-- Owner permissions
SELECT og."ParentId",
    og."OrgKey",
    ugu."UserId",
    'owner',
    og."UserGroupId"
FROM risksmart.owner_group og
    INNER JOIN risksmart.user_group_user ugu ON og."UserGroupId" = ugu."UserGroupId";
/* This function was useful when we required recursion to get ancestors, but now we can live without it */
DROP FUNCTION risksmart.get_ancestors;

CREATE OR REPLACE VIEW risksmart.ancestor_contributor_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    na."ObjectType",
    c."ContributorType",
    na."AncestorId",
    c."UserGroupId"
FROM risksmart.contributor_view c
    INNER JOIN risksmart.node_ancestor na ON na."AncestorId" = c."Id";

/* get ancestor contributors, including what group the contributor was in */
CREATE OR REPLACE FUNCTION risksmart.get_ancestor_contributors(id uuid) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    na."ObjectType",
    c."ContributorType",
    na."AncestorId",
    c."UserGroupId"
FROM risksmart.node_ancestor na
    INNER JOIN risksmart.contributor_view c ON na."AncestorId" = c."Id"
WHERE na."Id" = id;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_node_ancestor_contributors(record risksmart.node) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

/* Note we can potentially refactor out the need for the functions below in a future release */
CREATE OR REPLACE FUNCTION risksmart.get_control_group_ancestor_contributors(record risksmart.control_group) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_risk_ancestor_contributors(record risksmart.risk) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_action_ancestor_contributors(record risksmart.action) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_document_ancestor_contributors(record risksmart.document) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_indicator_ancestor_contributors(record risksmart.indicator) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_issue_ancestor_contributors(record risksmart.issue) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_control_ancestor_contributors(record risksmart.control) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.get_obligation_ancestor_contributors(record risksmart.obligation) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;
insert into risksmart."parent_type" ("Value", "Comment")
values ('approval_result', 'Approval result');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'approval_result',
        'owner',
        'delete'
    ),
    ('Standard', 'approval_result', 'owner', 'insert'),
    ('Standard', 'approval_result', 'owner', 'read'),
    ('Standard', 'approval_result', 'owner', 'update'),
    (
        'Standard',
        'approval_result',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'approval_result',
        'contributor',
        'insert'
    ),
    (
        'Standard',
        'approval_result',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'approval_result',
        'contributor',
        'update'
    ),
    (
        'RiskManager',
        'approval_result',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'approval_result',
        'any',
        'insert'
    ),
    ('RiskManager', 'approval_result', 'any', 'read'),
    (
        'RiskManager',
        'approval_result',
        'any',
        'update'
    ),
    ('ReadOnly', 'approval_result', 'any', 'read');

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT ap."ControlId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.control_parent ap
UNION ALL
SELECT ip."IndicatorId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.indicator_parent ip
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT ip."IssueId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.issue_parent ip
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId",
    df."OrgKey"
FROM risksmart.document_file df
UNION ALL
SELECT df."Id",
    df."ParentId",
    df."OrgKey"
FROM risksmart.approval_result df;

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.approval_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.approval_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.approval_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT ar."Id",
    'approval_result',
    ar."OrgKey"
FROM risksmart.approval_result ar;

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.approval_result
ADD CONSTRAINT "approval_result_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");
alter table risksmart.conversation
add column "ParentId" uuid NULL;

alter table risksmart.conversation_audit
add column "ParentId" uuid NULL;

alter table risksmart.conversation
ADD CONSTRAINT "conversation_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION risksmart.conversation_modified() RETURNS trigger AS $body$
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

insert into risksmart.conversation_audit(
        "Id",
        "IsResolved",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ParentId"
    )
values (
        nr."Id",
        nr."IsResolved",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."ParentId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('conversation', 'Conversation');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Standard', 'conversation', 'owner', 'read'),
    (
        'Standard',
        'conversation',
        'owner',
        'update'
    ),
    (
        'Standard',
        'conversation',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'conversation',
        'owner',
        'delete'
    ),
    (
        'Standard',
        'conversation',
        'contributor',
        'read'
    ),
    (
        'Standard',
        'conversation',
        'contributor',
        'update'
    ),
    (
        'Standard',
        'conversation',
        'contributor',
        'insert'
    ),
    (
        'Standard',
        'conversation',
        'contributor',
        'delete'
    ),
    (
        'RiskManager',
        'conversation',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'conversation',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'conversation',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'conversation',
        'any',
        'delete'
    ),
    (
        'ReadOnly',
        'conversation',
        'any',
        'read'
    );

ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT cg."Id",
    'conversation',
    cg."OrgKey"
FROM risksmart.conversation cg;

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.conversation FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.conversation FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.conversation
ADD CONSTRAINT "conversation_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT dar."Id",
    dar."AssessmentId" as "ParentId",
    dar."OrgKey"
FROM risksmart.document_assessment_result dar
UNION ALL
SELECT oar."Id",
    oar."AssessmentId" as "ParentId",
    oar."OrgKey"
FROM risksmart.obligation_assessment_result oar
UNION ALL
SELECT rar."Id",
    rar."AssessmentId" as "ParentId",
    rar."OrgKey"
FROM risksmart.risk_assessment_result rar
UNION ALL
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT ap."ControlId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.control_parent ap
UNION ALL
SELECT ip."IndicatorId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.indicator_parent ip
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT ip."IssueId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.issue_parent ip
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId",
    df."OrgKey"
FROM risksmart.document_file df
UNION ALL
SELECT df."Id",
    df."ParentId",
    df."OrgKey"
FROM risksmart.approval_result df
UNION ALL
SELECT c."Id",
    c."ParentId",
    c."OrgKey"
FROM risksmart.conversation c
WHERE c."ParentId" IS NOT NULL;

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.conversation FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();
CREATE OR REPLACE FUNCTION risksmart.get_assessment_ancestor_contributors(record risksmart.assessment) RETURNS SETOF risksmart.ancestor_contributor_view AS $$
SELECT ac."Id",
    ac."OrgKey",
    ac."UserId",
    ac."ObjectType",
    ac."ContributorType",
    ac."AncestorId",
    ac."UserGroupId"
FROM risksmart.get_ancestor_contributors(record."Id") ac;

$$ LANGUAGE SQL STABLE;
ALTER TABLE risksmart.owner_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;
alter table "risksmart"."assessment"
add column "CompletedByUser" text null;

ALTER TABLE risksmart."assessment"
ADD CONSTRAINT "assessment_completedByUser_fkey" FOREIGN KEY ("CompletedByUser") REFERENCES auth.user("Id");

alter table "risksmart"."assessment_audit"
add column "CompletedBy" text null;

INSERT INTO risksmart.version_status ("Value", "Comment")
VALUES ('review_due', 'Review Due');

CREATE TABLE risksmart.consequence_type ("Value" text PRIMARY KEY, "Comment" text);

ALTER TABLE risksmart.consequence
ADD COLUMN "Type" text;

ALTER TABLE risksmart.consequence_audit
ADD COLUMN "Type" text;

CREATE OR REPLACE FUNCTION risksmart.consequence_modified() RETURNS trigger AS $body$
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

insert into risksmart.consequence_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Criticality",
        "CostType",
        "CostValue",
        "ParentIssueId",
        "Type",
        "Meta",
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
        nr."Title",
        nr."Description",
        nr."Criticality",
        nr."CostType",
        nr."CostValue",
        nr."ParentIssueId",
        nr."Type",
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

$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.consequence
ADD CONSTRAINT "consequence_type_fkey" FOREIGN KEY ("Type") REFERENCES risksmart.consequence_type("Value");

INSERT INTO risksmart.consequence_type ("Value", "Comment")
VALUES ('customer', 'Customer'),
    ('operational', 'Operational'),
    ('reputational', 'Reputational'),
    ('legal_and_regulatory', 'Legal & Regulatory'),
    ('financial', 'Financial');

-- Update types (but only for Gatehouse)
UPDATE risksmart.consequence
set "Type" = 'customer',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Title" = 'Operational'
    AND "OrgKey" = 'org_dlZTZm0A0MabjdBG';

UPDATE risksmart.consequence
set "Type" = 'reputational',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Title" = 'Reputational'
    AND "OrgKey" = 'org_dlZTZm0A0MabjdBG';

UPDATE risksmart.consequence
set "Type" = 'legal_and_regulatory',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Title" = 'Legal & Regulatory'
    AND "OrgKey" = 'org_dlZTZm0A0MabjdBG';

UPDATE risksmart.consequence
set "Type" = 'financial',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Title" = 'Net loss'
    AND "OrgKey" = 'org_dlZTZm0A0MabjdBG';

UPDATE risksmart.consequence
set "Type" = 'financial',
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "Title" = 'Remedial cost'
    AND "OrgKey" = 'org_dlZTZm0A0MabjdBG';
CREATE OR REPLACE FUNCTION risksmart.document_file_public_status(document_file_row risksmart.document_file)
RETURNS TEXT LANGUAGE plpgsql STABLE AS $$
  BEGIN
      IF document_file_row."Status" = 'review_due' THEN
        RETURN 'published';
      ELSE
        RETURN document_file_row."Status";
      END IF;
  END;
$$;

INSERT INTO risksmart.cost_type ("Value", "Comment")
VALUES ('customers_impacted', 'Customers impacted');
DROP FUNCTION IF EXISTS risksmart.document_file_public_status();
DELETE FROM risksmart.version_status WHERE "Value" IN ('review_due');

-- Add risk assessment parent types
insert into risksmart."parent_type" ("Value", "Comment")
values (
        'uncontrolled_risk_assessment_result',
        'Uncontrolled Risk Assessment Result'
    ),
    (
        'controlled_risk_assessment_result',
        'Controlled Risk Assessment Result'
    ) ON CONFLICT DO NOTHING;

-- Add originating item field
ALTER TABLE risksmart."assessment"
ADD COLUMN IF NOT EXISTS "OriginatingItemId" uuid NULL;

-- Make ratings nullable
ALTER TABLE risksmart."document_assessment_result"
ALTER COLUMN "Rating" DROP NOT NULL;

ALTER TABLE risksmart."obligation_assessment_result"
ALTER COLUMN "Rating" DROP NOT NULL;

ALTER TABLE risksmart."risk_assessment_result"
ALTER COLUMN "Rating" DROP NOT NULL;

ALTER TABLE risksmart."document_assessment_result_audit"
ALTER COLUMN "Rating" DROP NOT NULL;

ALTER TABLE risksmart."obligation_assessment_result_audit"
ALTER COLUMN "Rating" DROP NOT NULL;

ALTER TABLE risksmart."risk_assessment_result_audit"
ALTER COLUMN "Rating" DROP NOT NULL;

-- Custom Attributes
ALTER TABLE risksmart."assessment"
ADD COLUMN IF NOT EXISTS "CustomAttributeData" JSONB NULL;

ALTER TABLE risksmart."document_assessment_result"
ADD COLUMN IF NOT EXISTS "CustomAttributeData" JSONB NULL;

ALTER TABLE risksmart."obligation_assessment_result"
ADD COLUMN IF NOT EXISTS "CustomAttributeData" JSONB NULL;

ALTER TABLE risksmart."risk_assessment_result"
ADD COLUMN IF NOT EXISTS "CustomAttributeData" JSONB NULL;

-- Custom attribute schema
INSERT INTO risksmart."custom_attribute_schema" (
        "Id",
        "Title",
        "Schema",
        "UiSchema",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    ) (
        SELECT gen_random_uuid(),
            'uncontrolled_risk_assessment_result custom attributes',
            c."Schema",
            c."UiSchema",
            c."OrgKey",
            c."CreatedByUser",
            c."CreatedAtTimestamp",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp"
        FROM risksmart."custom_attribute_schema" c
        WHERE c."Title" = 'risk_uncontrolled_assessment custom attributes'
    ) ON CONFLICT DO NOTHING;

INSERT INTO risksmart."form_configuration" (
        "CustomAttributeSchemaId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    ) (
        SELECT c."Id",
            'uncontrolled_risk_assessment_result',
            c."OrgKey",
            c."CreatedByUser",
            c."CreatedAtTimestamp",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp"
        FROM risksmart."custom_attribute_schema" c
        WHERE c."Title" = 'uncontrolled_risk_assessment_result custom attributes'
    ) ON CONFLICT DO NOTHING;

INSERT INTO risksmart."custom_attribute_schema" (
        "Id",
        "Title",
        "Schema",
        "UiSchema",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    ) (
        SELECT gen_random_uuid(),
            'controlled_risk_assessment_result custom attributes',
            c."Schema",
            c."UiSchema",
            c."OrgKey",
            c."CreatedByUser",
            c."CreatedAtTimestamp",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp"
        FROM risksmart."custom_attribute_schema" c
        WHERE c."Title" = 'risk_controlled_assessment custom attributes'
    ) ON CONFLICT DO NOTHING;

INSERT INTO risksmart."form_configuration" (
        "CustomAttributeSchemaId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    ) (
        SELECT c."Id",
            'controlled_risk_assessment_result',
            c."OrgKey",
            c."CreatedByUser",
            c."CreatedAtTimestamp",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp"
        FROM risksmart."custom_attribute_schema" c
        WHERE c."Title" = 'controlled_risk_assessment_result custom attributes'
    ) ON CONFLICT DO NOTHING;

INSERT INTO risksmart."custom_attribute_schema" (
        "Id",
        "Title",
        "Schema",
        "UiSchema",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    ) (
        SELECT gen_random_uuid(),
            'document_assessment_result custom attributes',
            c."Schema",
            c."UiSchema",
            c."OrgKey",
            c."CreatedByUser",
            c."CreatedAtTimestamp",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp"
        FROM risksmart."custom_attribute_schema" c
        WHERE c."Title" = 'document_assessment custom attributes'
    ) ON CONFLICT DO NOTHING;

INSERT INTO risksmart."form_configuration" (
        "CustomAttributeSchemaId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    ) (
        SELECT c."Id",
            'document_assessment_result',
            c."OrgKey",
            c."CreatedByUser",
            c."CreatedAtTimestamp",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp"
        FROM risksmart."custom_attribute_schema" c
        WHERE c."Title" = 'document_assessment_result custom attributes'
    ) ON CONFLICT DO NOTHING;

INSERT INTO risksmart."custom_attribute_schema" (
        "Id",
        "Title",
        "Schema",
        "UiSchema",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    ) (
        SELECT gen_random_uuid(),
            'obligation_assessment_result custom attributes',
            c."Schema",
            c."UiSchema",
            c."OrgKey",
            c."CreatedByUser",
            c."CreatedAtTimestamp",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp"
        FROM risksmart."custom_attribute_schema" c
        WHERE c."Title" = 'obligation_assessment custom attributes'
    ) ON CONFLICT DO NOTHING;

INSERT INTO risksmart."form_configuration" (
        "CustomAttributeSchemaId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    ) (
        SELECT c."Id",
            'obligation_assessment_result',
            c."OrgKey",
            c."CreatedByUser",
            c."CreatedAtTimestamp",
            c."ModifiedByUser",
            c."ModifiedAtTimestamp"
        FROM risksmart."custom_attribute_schema" c
        WHERE c."Title" = 'obligation_assessment_result custom attributes'
    ) ON CONFLICT DO NOTHING;

-- Assessment audit table
ALTER TABLE risksmart."assessment_audit"
ADD COLUMN IF NOT EXISTS "CompletedByUser" TEXT null;

ALTER TABLE risksmart."assessment_audit"
ADD COLUMN IF NOT EXISTS "CustomAttributeData" JSONB null;

ALTER TABLE risksmart."document_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "CustomAttributeData" JSONB null;

ALTER TABLE risksmart."obligation_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "ObligationId" TEXT;

ALTER TABLE risksmart."obligation_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "CustomAttributeData" JSONB null;

ALTER TABLE risksmart."obligation_assessment_result_audit" DROP COLUMN IF EXISTS "DocumentId";

ALTER TABLE risksmart."risk_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "CustomAttributeData" JSONB null;
CREATE OR REPLACE FUNCTION risksmart.get_audit_tables_json() RETURNS TABLE(json_data JSON, object_type TEXT) AS $$
DECLARE table_record RECORD;

        query TEXT;

        modified_table_name TEXT;

BEGIN FOR table_record IN
  SELECT table_schema,
         table_name
  FROM information_schema.tables
  WHERE table_schema = 'risksmart'
    AND table_name LIKE '%_audit'
    AND table_name not in ('form_field_ordering_audit') -- exclude any tables here that you don't want to be shown in the central audit log
  LOOP modified_table_name := left(
  table_record.table_name,
  length(table_record.table_name) - 6
                              );

query := format(
  'SELECT row_to_json(t) AS json_data, %L AS object_type FROM (SELECT * FROM %I.%I) t',
  modified_table_name,
  table_record.table_schema,
  table_record.table_name
         );

RETURN QUERY EXECUTE query;

  END LOOP;

END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.get_audit_log_description(jsonData JSON, objectType TEXT) RETURNS TEXT AS $$ BEGIN --
  IF objectType = 'user_activity' THEN RETURN 'Authentication';
  ELSIF objectType = 'form_configuration' THEN RETURN jsonData->>'ParentType';
  ELSE RETURN COALESCE(
    jsonData->>'Name',
    jsonData->>'Title',
    jsonData->>'Version',
    jsonData->>'FileName'
              );

  END IF;

END;

$$ LANGUAGE plpgsql;

-- Make sure queries on parent are fast first
CREATE INDEX "idx_document_ParentDocument" on risksmart.document ("ParentDocument");

-- Clean up the bad data
UPDATE risksmart.document
SET "ParentDocument" = null,
    "ModifiedAtTimestamp" = statement_timestamp()
WHERE "ParentDocument" NOT IN (
        SELECT d."Id"
        FROM risksmart.document d
    );

-- Ensure data integrity for future changes
ALTER TABLE risksmart.document
ADD CONSTRAINT "document_parentDocument_fkey" FOREIGN KEY ("ParentDocument") REFERENCES risksmart.document("Id");
INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES (
        'issue_assessment_audit',
        'Issue assessment audit'
    ),
    (
        'organisation_dashboard',
        'Organisation shared dashboards'
    );

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Standard', 'dashboard', 'any', 'read'),
    ('Standard', 'dashboard', 'any', 'delete'),
    ('Standard', 'dashboard', 'any', 'insert'),
    (
        'RiskManager',
        'issue_assessment_audit',
        'any',
        'read'
    ),
    (
        'ReadOnly',
        'issue_assessment_audit',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'organisation_dashboard',
        'any',
        'insert'
    );

CREATE TABLE risksmart.dashboard_sharing_type ("Value" text PRIMARY KEY, "Comment" text);

insert into risksmart.dashboard_sharing_type ("Value", "Comment")
values ('organisation', 'Organisation'),
    ('user_only', 'Private');

ALTER TABLE risksmart.dashboard
ADD CONSTRAINT "Dashboard_Sharing_fkey" FOREIGN KEY ("Sharing") REFERENCES risksmart.dashboard_sharing_type("Value");
CREATE TABLE risksmart.control_type ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.control_type ("Value", "Comment")
VALUES ('Preventive', 'Preventive'),
    ('Corrective', 'Corrective'),
    ('Directive', 'Directive'),
    ('Detective', 'Detective');

ALTER TABLE risksmart.control
ADD CONSTRAINT "Control_type_fkey" FOREIGN KEY ("Type") REFERENCES risksmart.control_type("Value");

ALTER TABLE risksmart.control DROP CONSTRAINT Type_check;
alter table "risksmart"."user_group" add column "Email" text
 null;

INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('impact', 'Impact');

CREATE TABLE risksmart.impact (
    "Id" uuid default gen_random_uuid() not null PRIMARY KEY,
    "SequentialId" integer not null,
    "Name" text not null,
    "Rationale" text null,
    "ImpactAppetite" smallint NULL,
    "LikelihoodAppetite" smallint NULL,
    "CustomAttributeData" jsonb,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    CONSTRAINT "impact_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey"),
    CONSTRAINT impact_id_fkey FOREIGN KEY ("Id") REFERENCES risksmart.node ("Id"),
    CONSTRAINT "impact_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth."user" ("Id"),
    CONSTRAINT "impact_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth."user" ("Id")
);

CREATE TRIGGER a_set_sequential_id_trigger BEFORE
INSERT ON risksmart.impact for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.impact FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.impact FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

CREATE TABLE risksmart.impact_audit (
    "Id" uuid not null,
    "SequentialId" integer not null,
    "Name" text not null,
    "Rationale" text null,
    "ImpactAppetite" smallint NULL,
    "LikelihoodAppetite" smallint NULL,
    "CustomAttributeData" jsonb,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.impact_modified() RETURNS trigger AS $body$
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

insert into risksmart.impact_audit(
        "Id",
        "SequentialId",
        "Name",
        "Rationale",
        "ImpactAppetite",
        "LikelihoodAppetite",
        "CustomAttributeData",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."SequentialId",
        nr."Name",
        nr."Rationale",
        nr."ImpactAppetite",
        nr."LikelihoodAppetite",
        nr."CustomAttributeData",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('ReadOnly', 'impact', 'any', 'read'),
    ('RiskManager', 'impact', 'any', 'read');
alter table "risksmart"."user_group_audit" add column "Email" text
 null;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('RiskManager', 'impact', 'any', 'insert'),
    ('Standard', 'impact', 'any', 'read');
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('RiskManager', 'impact', 'any', 'update');
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('RiskManager', 'impact', 'any', 'delete');
INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('impact_rating', 'Impact rating');

CREATE TABLE risksmart.impact_rating (
    "Id" uuid default gen_random_uuid() not null PRIMARY KEY,
    "ImpactId" uuid not null,
    "RatedItemId" uuid not null,
    "SequentialId" integer not null,
    "Rationale" text not null,
    "Rating" smallint not NULL,
    "TestDate" timestamp with time zone not null,
    "CustomAttributeData" jsonb,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text not null,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    CONSTRAINT "impact_rating_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey"),
    CONSTRAINT impact_rating_id_fkey FOREIGN KEY ("Id") REFERENCES risksmart.node ("Id"),
    CONSTRAINT impact_rating_ratedItemId_fkey FOREIGN KEY ("RatedItemId") REFERENCES risksmart.node ("Id"),
    CONSTRAINT impact_rating_impactId_fkey FOREIGN KEY ("ImpactId") REFERENCES risksmart.impact ("Id"),
    CONSTRAINT "impact_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth."user" ("Id"),
    CONSTRAINT "impact_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth."user" ("Id")
);

CREATE TRIGGER a_set_sequential_id_trigger BEFORE
INSERT ON risksmart.impact_rating for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.impact_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.impact_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.impact_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();

CREATE TABLE risksmart.impact_rating_audit (
    "Id" uuid not null,
    "ImpactId" uuid not null,
    "RatedItemId" uuid not null,
    "SequentialId" integer not null,
    "Rationale" text not null,
    "Rating" smallint not NULL,
    "TestDate" timestamp with time zone not null,
    "CustomAttributeData" jsonb,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text not null,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.impact_rating_modified() RETURNS trigger AS $body$
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

insert into risksmart.impact_rating_audit(
        "Id",
        "ImpactId",
        "RatedItemId",
        "SequentialId",
        "Rationale",
        "Rating",
        "TestDate",
        "CustomAttributeData",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ImpactId",
        nr."RatedItemId",
        nr."SequentialId",
        nr."Rationale",
        nr."Rating",
        nr."TestDate",
        nr."CustomAttributeData",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('ReadOnly', 'impact_rating', 'any', 'read'),
    ('RiskManager', 'impact_rating', 'any', 'read'),
    ('RiskManager', 'impact_rating', 'any', 'delete'),
    ('RiskManager', 'impact_rating', 'any', 'update'),
    ('RiskManager', 'impact_rating', 'any', 'insert'),
    ('Standard', 'impact_rating', 'owner', 'read'),
    (
        'Standard',
        'impact_rating',
        'contributor',
        'read'
    ),
    ('Standard', 'impact_rating', 'owner', 'insert'),
    (
        'Standard',
        'impact_rating',
        'contributor',
        'insert'
    ),
    ('Standard', 'impact_rating', 'owner', 'delete'),
    (
        'Standard',
        'impact_rating',
        'contributor',
        'delete'
    );

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT dar."Id",
    dar."AssessmentId" as "ParentId",
    dar."OrgKey"
FROM risksmart.document_assessment_result dar
UNION ALL
SELECT oar."Id",
    oar."AssessmentId" as "ParentId",
    oar."OrgKey"
FROM risksmart.obligation_assessment_result oar
UNION ALL
SELECT rar."Id",
    rar."AssessmentId" as "ParentId",
    rar."OrgKey"
FROM risksmart.risk_assessment_result rar
UNION ALL
SELECT au."Id",
    au."ParentActionId" as "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT ap."ControlId",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.control_parent ap
UNION ALL
SELECT ip."IndicatorId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.indicator_parent ip
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT ip."IssueId",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.issue_parent ip
UNION ALL
SELECT tr."Id",
    tr."ParentControlId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId",
    df."OrgKey"
FROM risksmart.document_file df
UNION ALL
SELECT df."Id",
    df."ParentId",
    df."OrgKey"
FROM risksmart.approval_result df
UNION ALL
SELECT c."Id",
    c."ParentId",
    c."OrgKey"
FROM risksmart.conversation c
WHERE c."ParentId" IS NOT NULL
UNION ALL
SELECT ir."Id",
    ir."RatedItemId",
    ir."OrgKey"
FROM risksmart.impact_rating ir;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.assessment DISABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.document_assessment_result DISABLE TRIGGER node_ancestor_refresh_trigger;

CREATE TEMP TABLE document_assessment_ids ("Id" uuid, "OldId" uuid);

INSERT INTO document_assessment_ids ("Id", "OldId")
SELECT gen_random_uuid(),
    x."Id"
FROM (
        SELECT DISTINCT "Id"
        FROM risksmart.document_assessment
    ) as x;

INSERT INTO "risksmart"."assessment" (
        "Id",
        "Title",
        "Summary",
        "TargetCompletionDate",
        "ActualCompletionDate",
        "StartDate",
        "CreatedByUser",
        "ModifiedByUser",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "OrgKey",
        "CompletedByUser"
    ) (
        SELECT ni."Id",
            da."Title",
            da."Summary",
            da."TargetCompletionDate",
            da."ActualCompletionDate",
            da."StartDate",
            da."CreatedByUser",
            da."ModifiedByUser",
            da."CreatedAtTimestamp",
            da."ModifiedAtTimestamp",
            da."OrgKey",
            da."CompletedBy"
        FROM "risksmart"."document_assessment" da
            JOIN document_assessment_ids ni ON da."Id" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."tag" (
        "ParentId",
        "TagTypeId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."TagTypeId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."tag" t
            JOIN document_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."department" (
        "ParentId",
        "DepartmentTypeId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."DepartmentTypeId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."department" t
            JOIN document_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."owner" (
        "ParentId",
        "UserId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."UserId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."owner" t
            JOIN document_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."contributor" (
        "ParentId",
        "UserId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."UserId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."contributor" t
            JOIN document_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."relation_file" (
        "ParentType",
        "ParentId",
        "FileId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta"
    ) (
        SELECT 'document_assessment_result',
            ni."Id",
            t."FileId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp",
            t."Meta"
        FROM risksmart."relation_file" t
            JOIN document_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."document_assessment_result" (
        "AssessmentId",
        "Rating",
        "DocumentId",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "OrgKey",
        "CustomAttributeData"
    ) (
        SELECT ni."Id",
            da."Result",
            da."ParentDocumentId",
            da."CreatedByUser",
            da."CreatedAtTimestamp",
            da."OrgKey",
            da."CustomAttributeData"
        FROM "risksmart"."document_assessment" da
            JOIN document_assessment_ids ni ON da."Id" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

DROP TABLE document_assessment_ids;

-- Rebuild node ancestors
INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."Depth",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart."node_ancestor_view" nav
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.assessment ENABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.document_assessment_result ENABLE TRIGGER node_ancestor_refresh_trigger;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.assessment DISABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.obligation_assessment_result DISABLE TRIGGER node_ancestor_refresh_trigger;

CREATE TEMP TABLE obligation_assessment_ids ("Id" uuid, "OldId" uuid);

INSERT INTO obligation_assessment_ids ("Id", "OldId")
SELECT gen_random_uuid(),
    x."Id"
FROM (
        SELECT DISTINCT "Id"
        FROM risksmart.obligation_assessment
    ) as x;

INSERT INTO "risksmart"."assessment" (
        "Id",
        "Title",
        "Summary",
        "TargetCompletionDate",
        "ActualCompletionDate",
        "StartDate",
        "CreatedByUser",
        "ModifiedByUser",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "OrgKey",
        "CompletedByUser"
    ) (
        SELECT ni."Id",
            da."Title",
            da."Summary",
            da."TargetCompletionDate",
            da."ActualCompletionDate",
            da."StartDate",
            da."CreatedByUser",
            da."ModifiedByUser",
            da."CreatedAtTimestamp",
            da."ModifiedAtTimestamp",
            da."OrgKey",
            da."CompletedBy"
        FROM risksmart."obligation_assessment" da
            JOIN obligation_assessment_ids ni ON da."Id" = ni."OldId"
    );

INSERT INTO "risksmart"."tag" (
        "ParentId",
        "TagTypeId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."TagTypeId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."tag" t
            JOIN obligation_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."department" (
        "ParentId",
        "DepartmentTypeId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."DepartmentTypeId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."department" t
            JOIN obligation_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."owner" (
        "ParentId",
        "UserId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."UserId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."owner" t
            JOIN obligation_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."contributor" (
        "ParentId",
        "UserId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."UserId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."contributor" t
            JOIN obligation_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."relation_file" (
        "ParentType",
        "ParentId",
        "FileId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta"
    ) (
        SELECT 'obligation_assessment_result',
            ni."Id",
            t."FileId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp",
            t."Meta"
        FROM risksmart."relation_file" t
            JOIN obligation_assessment_ids ni ON t."ParentId" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."obligation_assessment_result" (
        "AssessmentId",
        "Rating",
        "ObligationId",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "OrgKey",
        "CustomAttributeData"
    ) (
        SELECT ni."Id",
            d."Result",
            d."ParentObligationId",
            d."CreatedByUser",
            d."CreatedAtTimestamp",
            d."OrgKey",
            d."CustomAttributeData"
        FROM "risksmart"."obligation_assessment" d
            JOIN obligation_assessment_ids ni ON d."Id" = ni."OldId"
    ) ON CONFLICT DO NOTHING;

DROP TABLE obligation_assessment_ids;

-- Rebuild node ancestors
INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."Depth",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart."node_ancestor_view" nav
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.assessment ENABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.obligation_assessment_result ENABLE TRIGGER node_ancestor_refresh_trigger;
ALTER TABLE risksmart.node DISABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.assessment DISABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.risk_assessment_result DISABLE TRIGGER node_ancestor_refresh_trigger;

CREATE TEMP TABLE risk_assessment_ids ("Id" uuid, "ParentId" uuid);

INSERT INTO risk_assessment_ids ("Id", "ParentId")
SELECT gen_random_uuid(),
    x."ParentId"
FROM (
        SELECT DISTINCT "ParentId"
        FROM risksmart.risk_assessment
    ) as x;

INSERT INTO "risksmart"."assessment" (
        "Id",
        "Title",
        "Summary",
        "CreatedByUser",
        "ModifiedByUser",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "OrgKey"
    ) (
        SELECT ni."Id",
            r."Title",
            r."Description",
            r."CreatedByUser",
            r."ModifiedByUser",
            r."CreatedAtTimestamp",
            r."ModifiedAtTimestamp",
            r."OrgKey"
        FROM risksmart."risk" r
            JOIN risk_assessment_ids ni ON r."Id" = ni."ParentId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."tag" (
        "ParentId",
        "TagTypeId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."TagTypeId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."tag" t
            JOIN risk_assessment_ids ni ON t."ParentId" = ni."ParentId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."department" (
        "ParentId",
        "DepartmentTypeId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."DepartmentTypeId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."department" t
            JOIN risk_assessment_ids ni ON t."ParentId" = ni."ParentId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."owner" (
        "ParentId",
        "UserId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."UserId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."owner" t
            JOIN risk_assessment_ids ni ON t."ParentId" = ni."ParentId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."contributor" (
        "ParentId",
        "UserId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp"
    ) (
        SELECT ni."Id",
            t."UserId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp"
        FROM risksmart."contributor" t
            JOIN risk_assessment_ids ni ON t."ParentId" = ni."ParentId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."relation_file" (
        "ParentType",
        "ParentId",
        "FileId",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta"
    ) (
        SELECT 'risk_assessment_result',
            ni."Id",
            t."FileId",
            t."ModifiedAtTimestamp",
            t."ModifiedByUser",
            t."OrgKey",
            t."CreatedByUser",
            t."CreatedAtTimestamp",
            t."Meta"
        FROM risksmart."relation_file" t
            JOIN risk_assessment_ids ni ON t."ParentId" = ni."ParentId"
    ) ON CONFLICT DO NOTHING;

INSERT INTO "risksmart"."risk_assessment_result" (
        "AssessmentId",
        "Rating",
        "Impact",
        "Likelihood",
        "ControlType",
        "RiskId",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "OrgKey",
        "CustomAttributeData"
    ) (
        SELECT ni."Id",
            da."Rating",
            da."Impact",
            da."Likelihood",
            da."ControlType",
            da."ParentId",
            da."CreatedByUser",
            da."CreatedAtTimestamp",
            da."OrgKey",
            da."CustomAttributeData"
        FROM "risksmart"."risk_assessment" da
            JOIN risk_assessment_ids ni ON da."ParentId" = ni."ParentId"
    ) ON CONFLICT DO NOTHING;

DROP TABLE risk_assessment_ids;

-- Rebuild node ancestors
INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."Depth",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart."node_ancestor_view" nav
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

ALTER TABLE risksmart.node ENABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.assessment ENABLE TRIGGER node_ancestor_refresh_trigger;

ALTER TABLE risksmart.risk_assessment_result ENABLE TRIGGER node_ancestor_refresh_trigger;
-- Assessments
CREATE OR REPLACE FUNCTION risksmart.assessment_modified() RETURNS trigger AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := statement_timestamp();

END IF;

insert into risksmart.assessment_audit(
        "Id",
        "SequentialId",
        "Title",
        "Summary",
        "TargetCompletionDate",
        "ActualCompletionDate",
        "StartDate",
        "NextTestDate",
        "CompletedByUser",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "CustomAttributeData"
    )
values (
        anr."Id",
        anr."SequentialId",
        anr."Title",
        anr."Summary",
        anr."TargetCompletionDate",
        anr."ActualCompletionDate",
        anr."StartDate",
        anr."NextTestDate",
        anr."CompletedByUser",
        anr."OrgKey",
        a_updated_user,
        a_update_timestamp,
        anr."CreatedByUser",
        anr."CreatedAtTimestamp",
        TG_OP,
        anr."CustomAttributeData"
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assessment_audit_trigger ON risksmart.assessment;

CREATE TRIGGER assessment_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.assessment FOR EACH ROW EXECUTE FUNCTION risksmart.assessment_modified();

-- Document assessment result audit table
CREATE OR REPLACE FUNCTION risksmart.document_assessment_result_modified() RETURNS trigger AS $body$
DECLARE d_nr RECORD;

d_updated_user TEXT := risksmart.get_hasura_user_id();

d_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN IF (TG_OP = 'INSERT') then d_nr := NEW;

elsif (TG_OP = 'DELETE') then d_nr := OLD;

END IF;

insert into risksmart.document_assessment_result_audit(
        "Id",
        "AssessmentId",
        "DocumentId",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CustomAttributeData"
    )
values (
        d_nr."Id",
        d_nr."AssessmentId",
        d_nr."DocumentId",
        d_nr."Rating",
        d_nr."OrgKey",
        d_nr."CreatedByUser",
        d_nr."CreatedAtTimestamp",
        TG_OP,
        d_updated_user,
        d_update_timestamp,
        d_nr."CustomAttributeData"
    );

RETURN d_nr;

END;

$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS document_assessment_result_audit_trigger ON risksmart.document_assessment_result;

CREATE TRIGGER document_assessment_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document_assessment_result FOR EACH ROW EXECUTE FUNCTION risksmart.document_assessment_result_modified();

-- Obligation assessment result audit table
CREATE OR REPLACE FUNCTION risksmart.obligation_assessment_result_modified() RETURNS trigger AS $body$
DECLARE o_nr RECORD;

o_updated_user TEXT := risksmart.get_hasura_user_id();

o_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN IF (TG_OP = 'INSERT') then o_nr := NEW;

elsif (TG_OP = 'DELETE') then o_nr := OLD;

END IF;

insert into risksmart.obligation_assessment_result_audit(
        "Id",
        "AssessmentId",
        "ObligationId",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CustomAttributeData"
    )
values (
        o_nr."Id",
        o_nr."AssessmentId",
        o_nr."ObligationId",
        o_nr."Rating",
        o_nr."OrgKey",
        o_nr."CreatedByUser",
        o_nr."CreatedAtTimestamp",
        TG_OP,
        o_updated_user,
        o_update_timestamp,
        o_nr."CustomAttributeData"
    );

RETURN o_nr;

END;

$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS obligation_assessment_result_audit_trigger ON risksmart.obligation_assessment_result;

CREATE TRIGGER obligation_assessment_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.obligation_assessment_result FOR EACH ROW EXECUTE FUNCTION risksmart.obligation_assessment_result_modified();

-- Risk assessment result audit table
CREATE OR REPLACE FUNCTION risksmart.risk_assessment_result_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

updated_user TEXT := risksmart.get_hasura_user_id();

update_timestamp timestamp with time zone := statement_timestamp();

BEGIN IF (TG_OP = 'INSERT') then nr := NEW;

elsif (TG_OP = 'DELETE') then nr := OLD;

END IF;

insert into risksmart.risk_assessment_result_audit(
        "Id",
        "AssessmentId",
        "RiskId",
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
        "CustomAttributeData"
    )
values (
        nr."Id",
        nr."AssessmentId",
        nr."RiskId",
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
        nr."CustomAttributeData"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS risk_assessment_result_audit_trigger ON risksmart.risk_assessment_result;

CREATE TRIGGER risk_assessment_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.risk_assessment_result FOR EACH ROW EXECUTE FUNCTION risksmart.risk_assessment_result_modified();
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Standard', 'assessment', 'owner', 'insert'),
    (
        'Standard',
        'assessment',
        'contributor',
        'insert'
    ),
    (
        'Standard',
        'assessment',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'document_assessment_result',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'document_assessment_result',
        'contributor',
        'insert'
    ),
    (
        'Standard',
        'document_assessment_result',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'obligation_assessment_result',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'obligation_assessment_result',
        'contributor',
        'insert'
    ),
    (
        'Standard',
        'obligation_assessment_result',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'risk_assessment_result',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'risk_assessment_result',
        'contributor',
        'insert'
    ),
    (
        'Standard',
        'risk_assessment_result',
        'contributor',
        'delete'
    );

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT dar."Id",
    dar."AssessmentId" AS "ParentId",
    dar."OrgKey"
FROM risksmart.document_assessment_result dar
UNION ALL
SELECT oar."Id",
    oar."AssessmentId" AS "ParentId",
    oar."OrgKey"
FROM risksmart.obligation_assessment_result oar
UNION ALL
SELECT rar."Id",
    rar."AssessmentId" AS "ParentId",
    rar."OrgKey"
FROM risksmart.risk_assessment_result rar
UNION ALL
SELECT ass."Id",
    ass."OriginatingItemId" AS "ParentId",
    ass."OrgKey"
FROM risksmart.assessment ass
WHERE ass."OriginatingItemId" IS NOT NULL
UNION ALL
SELECT au."Id",
    au."ParentActionId" AS "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId" AS "Id",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT ap."ControlId" AS "Id",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.control_parent ap
UNION ALL
SELECT ip."IndicatorId" AS "Id",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.indicator_parent ip
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId" AS "ParentId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId" AS "ParentId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId" AS "ParentId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT ip."IssueId" AS "Id",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.issue_parent ip
UNION ALL
SELECT tr."Id",
    tr."ParentControlId" AS "ParentId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId" AS "ParentId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId" AS "ParentId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId" AS "ParentId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId" AS "ParentId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId" AS "ParentId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId" AS "ParentId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId" AS "ParentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId" AS "ParentId",
    df."OrgKey"
FROM risksmart.document_file df
UNION ALL
SELECT df."Id",
    df."ParentId",
    df."OrgKey"
FROM risksmart.approval_result df
UNION ALL
SELECT c."Id",
    c."ParentId",
    c."OrgKey"
FROM risksmart.conversation c
WHERE c."ParentId" IS NOT NULL
UNION ALL
SELECT ir."Id",
    ir."RatedItemId" AS "ParentId",
    ir."OrgKey"
FROM risksmart.impact_rating ir;
ALTER TABLE risksmart.issue_assessment DROP CONSTRAINT issuetype_check;
INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Standard', 'risk', 'owner', 'insert');

CREATE OR REPLACE VIEW risksmart.node_parent_view AS
SELECT dar."Id",
    dar."AssessmentId" AS "ParentId",
    dar."OrgKey"
FROM risksmart.document_assessment_result dar
UNION ALL
SELECT oar."Id",
    oar."AssessmentId" AS "ParentId",
    oar."OrgKey"
FROM risksmart.obligation_assessment_result oar
UNION ALL
SELECT rar."Id",
    rar."AssessmentId" AS "ParentId",
    rar."OrgKey"
FROM risksmart.risk_assessment_result rar
UNION ALL
SELECT ass."Id",
    ass."OriginatingItemId" AS "ParentId",
    ass."OrgKey"
FROM risksmart.assessment ass
WHERE ass."OriginatingItemId" IS NOT NULL
UNION ALL
SELECT au."Id",
    au."ParentActionId" AS "ParentId",
    au."OrgKey"
FROM risksmart.action_update au
UNION ALL
SELECT ap."ActionId" AS "Id",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.action_parent ap
UNION ALL
SELECT ap."ControlId" AS "Id",
    ap."ParentId",
    ap."OrgKey"
FROM risksmart.control_parent ap
UNION ALL
SELECT ip."IndicatorId" AS "Id",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.indicator_parent ip
UNION ALL
SELECT oa."Id",
    oa."ParentObligationId" AS "ParentId",
    oa."OrgKey"
FROM risksmart.obligation_assessment oa
UNION ALL
SELECT oi."Id",
    oi."ParentObligationId" AS "ParentId",
    oi."OrgKey"
FROM risksmart.obligation_impact oi
UNION ALL
SELECT oi."Id",
    oi."ParentIssueId" AS "ParentId",
    oi."OrgKey"
FROM risksmart.issue_assessment oi
UNION ALL
SELECT ip."IssueId" AS "Id",
    ip."ParentId",
    ip."OrgKey"
FROM risksmart.issue_parent ip
UNION ALL
SELECT tr."Id",
    tr."ParentControlId" AS "ParentId",
    tr."OrgKey"
FROM risksmart.test_result tr
UNION ALL
SELECT ra."Id",
    ra."ParentId",
    ra."OrgKey"
FROM risksmart.risk_assessment ra
UNION ALL
SELECT ir."Id",
    ir."IndicatorId" AS "ParentId",
    ir."OrgKey"
FROM risksmart.indicator_result ir
UNION ALL
SELECT a."Id",
    a."ParentRiskId" AS "ParentId",
    a."OrgKey"
FROM risksmart.acceptance a
UNION ALL
SELECT a."Id",
    a."ParentRiskId" AS "ParentId",
    a."OrgKey"
FROM risksmart.appetite a
UNION ALL
SELECT ri."Id",
    ri."ParentIssueId" AS "ParentId",
    ri."OrgKey"
FROM risksmart.issue_update ri
UNION ALL
SELECT c."Id",
    c."ParentIssueId" AS "ParentId",
    c."OrgKey"
FROM risksmart.consequence c
UNION ALL
SELECT c."Id",
    c."ParentIssueId" AS "ParentId",
    c."OrgKey"
FROM risksmart.cause c
UNION ALL
SELECT c."Id",
    c."ParentDocumentId" AS "ParentId",
    c."OrgKey"
FROM risksmart.document_assessment c
UNION ALL
SELECT df."Id",
    df."ParentDocumentId" AS "ParentId",
    df."OrgKey"
FROM risksmart.document_file df
UNION ALL
SELECT df."Id",
    df."ParentId",
    df."OrgKey"
FROM risksmart.approval_result df
UNION ALL
SELECT c."Id",
    c."ParentId",
    c."OrgKey"
FROM risksmart.conversation c
WHERE c."ParentId" IS NOT NULL
UNION ALL
SELECT ir."Id",
    ir."RatedItemId" AS "ParentId",
    ir."OrgKey"
FROM risksmart.impact_rating ir
UNION ALL
SELECT ir."Id",
    ir."ParentRiskId",
    ir."OrgKey"
FROM risksmart.risk ir
WHERE ir."ParentRiskId" IS NOT NULL;

CREATE OR REPLACE TRIGGER node_ancestor_refresh_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk FOR EACH ROW EXECUTE PROCEDURE risksmart.node_ancestor_refresh();
create table risksmart.node_parent (
    "Id" uuid,
    "ParentId" uuid,
    "OrgKey" text,
    primary key ("Id", "ParentId")
);

create index ix_node_parent_parent_id_id on risksmart.node_parent("ParentId", "Id", "OrgKey");

create index ix_node_parent_orgkey on risksmart.node_parent("OrgKey", "Id", "ParentId");

insert into risksmart.node_parent ("Id", "ParentId", "OrgKey")
SELECT npv."Id",
    npv."ParentId",
    npv."OrgKey"
FROM risksmart.node_parent_view npv;

CREATE OR REPLACE FUNCTION risksmart.node_parent_refresh(org_id text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np
WHERE np."OrgKey" = org_id
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_parent_view npv
        WHERE npv."Id" = np."Id"
            AND npv."OrgKey" = org_id
            AND npv."ParentId" = np."ParentId"
    );

INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT npv."Id",
    npv."ParentId",
    npv."OrgKey"
FROM risksmart.node_parent_view npv
WHERE npv."OrgKey" = org_id
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_parent np
        WHERE np."OrgKey" = org_id
            AND np."Id" = npv."Id"
            AND np."ParentId" = npv."ParentId"
    );

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_ancestor_refresh() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE org_id TEXT;

BEGIN
SELECT coalesce(NEW."OrgKey", OLD."OrgKey") into org_id;

perform risksmart.node_parent_refresh(org_id);

DELETE FROM risksmart.node_ancestor na
WHERE na."OrgKey" = org_id
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.get_org_node_ancestor_view(org_id) nav
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."Depth",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart.get_org_node_ancestor_view(org_id) nav
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."OrgKey" = org_id
            AND nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

return null;

END;

$$;

DROP VIEW IF EXISTS risksmart.node_ancestor_view;

CREATE OR REPLACE FUNCTION risksmart.get_org_node_ancestor_view(orgKey text) RETURNS SETOF risksmart.node_ancestor AS $$ WITH RECURSIVE flattened_nodes (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    ) AS (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT ff."Id",
            f."ParentId" AS "AncestorId",
            (ff."Depth" + 1),
            ff."ObjectType",
            ff."OrgKey"
        FROM flattened_nodes ff
            INNER JOIN risksmart.node_parent f ON ff."AncestorId" = f."Id"
    )
SELECT DISTINCT fpo."Id",
    fpo."AncestorId",
    fpo."Depth",
    fpo."ObjectType",
    fpo."OrgKey"
FROM flattened_nodes fpo;

$$ LANGUAGE SQL STABLE;
create index ix_node_orgkey_id on risksmart.node("OrgKey", "Id");
ALTER TABLE risksmart.impact_rating DROP COLUMN "Rationale";

-- Not live yet, so just delete existing records so we can have a not null on Completed by
DELETE FROM risksmart.impact_rating;

ALTER TABLE risksmart.impact_rating
ADD COLUMN "CompletedBy" text not null;

ALTER TABLE risksmart.impact_rating
ADD CONSTRAINT "impact_rating_CompletedBy_fkey" FOREIGN KEY ("CompletedBy") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.impact_rating_audit DROP COLUMN "Rationale";

ALTER TABLE risksmart.impact_rating_audit
ADD COLUMN "CompletedBy" text not null;

CREATE OR REPLACE FUNCTION risksmart.impact_rating_modified() RETURNS trigger AS $body$
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

insert into risksmart.impact_rating_audit(
        "Id",
        "CompletedBy",
        "ImpactId",
        "RatedItemId",
        "SequentialId",
        "Rating",
        "TestDate",
        "CustomAttributeData",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."CompletedBy",
        nr."ImpactId",
        nr."RatedItemId",
        nr."SequentialId",
        nr."Rating",
        nr."TestDate",
        nr."CustomAttributeData",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
create index IF NOT EXISTS ix_node_ancestor_org_key on risksmart.node_ancestor("OrgKey");

CREATE OR REPLACE FUNCTION risksmart.get_org_node_ancestor_view(orgKey text) RETURNS SETOF risksmart.node_ancestor AS $$
SELECT n."Id",
    n."Id" AS "AncestorId",
    0,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np1."ParentId" AS "AncestorId",
    1,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np2."ParentId" AS "AncestorId",
    2,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
    INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np3."ParentId" AS "AncestorId",
    3,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
    INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
    INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np4."ParentId" AS "AncestorId",
    4,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
    INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
    INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
    INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np5."ParentId" AS "AncestorId",
    5,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
    INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
    INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
    INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
    INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np6."ParentId" AS "AncestorId",
    6,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
    INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
    INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
    INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
    INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
    INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np7."ParentId" AS "AncestorId",
    7,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
    INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
    INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
    INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
    INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
    INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
    INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np8."ParentId" AS "AncestorId",
    8,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
    INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
    INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
    INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
    INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
    INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
    INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
    INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np9."ParentId" AS "AncestorId",
    9,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
    INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
    INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
    INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
    INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
    INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
    INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
    INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
    INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
WHERE n."OrgKey" = orgKey
UNION ALL
SELECT n."Id",
    np10."ParentId" AS "AncestorId",
    10,
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node n
    INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
    INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
    INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
    INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
    INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
    INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
    INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
    INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
    INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
    INNER JOIN risksmart.node_parent np10 ON np9."ParentId" = np10."Id"
WHERE n."OrgKey" = orgKey;

$$ LANGUAGE SQL STABLE;
CREATE OR REPLACE FUNCTION risksmart.get_org_node_ancestor_view(orgKey text) RETURNS SETOF risksmart.node_ancestor AS $$
SELECT DISTINCT a."Id",
    a."AncestorId",
    a."Depth",
    a."ObjectType",
    a."OrgKey"
FROM (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0 as "Depth",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np1."ParentId" AS "AncestorId",
            1,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np2."ParentId" AS "AncestorId",
            2,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np3."ParentId" AS "AncestorId",
            3,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np4."ParentId" AS "AncestorId",
            4,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np5."ParentId" AS "AncestorId",
            5,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np6."ParentId" AS "AncestorId",
            6,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np7."ParentId" AS "AncestorId",
            7,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np8."ParentId" AS "AncestorId",
            8,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np9."ParentId" AS "AncestorId",
            9,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
            INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np10."ParentId" AS "AncestorId",
            10,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
            INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
            INNER JOIN risksmart.node_parent np10 ON np9."ParentId" = np10."Id"
        WHERE n."OrgKey" = orgKey
    ) a;

$$ LANGUAGE SQL STABLE;
CREATE TABLE IF NOT EXISTS risksmart.tag_type_group (
    "Id" uuid default gen_random_uuid() not null,
    "Name" text not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    CONSTRAINT "TagTypeGroup_pkey" PRIMARY KEY ("OrgKey", "Name"),
    CONSTRAINT "tag_type_group_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey"),
    CONSTRAINT "tag_type_group_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth."user" ("Id"),
    CONSTRAINT "tag_type_group_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth."user" ("Id"),
    UNIQUE ("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.tag_type_group_audit (
    "Id" uuid not null,
    "Name" text not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "Action" risksmart.db_action,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.tag_type
ADD COLUMN IF NOT EXISTS "TagTypeGroupId" uuid;

ALTER TABLE risksmart.tag_type
ADD CONSTRAINT tag_type_TagTypeGroupId_fkey FOREIGN KEY ("TagTypeGroupId") REFERENCES risksmart.tag_type_group ("Id");

ALTER TABLE risksmart.tag_type_audit
ADD COLUMN IF NOT EXISTS "TagTypeGroupId" uuid;

CREATE OR REPLACE FUNCTION risksmart.tag_type_modified() RETURNS trigger AS $body$
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

insert into risksmart.tag_type_audit(
        "TagTypeId",
        "Name",
        "Description",
        "OrgKey",
        "TagTypeGroupId",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."TagTypeId",
        nr."Name",
        nr."Description",
        nr."OrgKey",
        nr."TagTypeGroupId",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.tag_type_group_modified() RETURNS trigger AS $body$
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

INSERT INTO risksmart.tag_type_group_audit(
        "Id",
        "Name",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."Id",
        nr."Name",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER tag_type_group_audit_insert_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.tag_type_group FOR EACH ROW EXECUTE FUNCTION risksmart.tag_type_group_modified();
-- Risk
ALTER TABLE risksmart."document_assessment_result"
ADD COLUMN IF NOT EXISTS "Rationale" TEXT NULL;

ALTER TABLE risksmart."document_assessment_result"
ADD COLUMN IF NOT EXISTS "TestDate" timestamptz NULL;

ALTER TABLE risksmart."document_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "Rationale" TEXT NULL;

ALTER TABLE risksmart."document_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "TestDate" timestamptz NULL;

-- Obligation
ALTER TABLE risksmart."obligation_assessment_result"
ADD COLUMN IF NOT EXISTS "Rationale" TEXT NULL;

ALTER TABLE risksmart."obligation_assessment_result"
ADD COLUMN IF NOT EXISTS "TestDate" timestamptz NULL;

ALTER TABLE risksmart."obligation_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "Rationale" TEXT NULL;

ALTER TABLE risksmart."obligation_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "TestDate" timestamptz NULL;

-- Risk
ALTER TABLE risksmart."risk_assessment_result"
ADD COLUMN IF NOT EXISTS "Rationale" TEXT NULL;

ALTER TABLE risksmart."risk_assessment_result"
ADD COLUMN IF NOT EXISTS "TestDate" timestamptz NULL;

ALTER TABLE risksmart."risk_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "Rationale" TEXT NULL;

ALTER TABLE risksmart."risk_assessment_result_audit"
ADD COLUMN IF NOT EXISTS "TestDate" timestamptz NULL;

-- Update audit triggers
-- Document assessment result audit table
CREATE OR REPLACE FUNCTION risksmart.document_assessment_result_modified() RETURNS trigger AS $body$
DECLARE d_nr RECORD;

d_updated_user TEXT := risksmart.get_hasura_user_id();

d_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN IF (TG_OP = 'INSERT') then d_nr := NEW;

elsif (TG_OP = 'DELETE') then d_nr := OLD;

END IF;

insert into risksmart.document_assessment_result_audit(
        "Id",
        "AssessmentId",
        "DocumentId",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CustomAttributeData",
        "Rationale",
        "TestDate"
    )
values (
        d_nr."Id",
        d_nr."AssessmentId",
        d_nr."DocumentId",
        d_nr."Rating",
        d_nr."OrgKey",
        d_nr."CreatedByUser",
        d_nr."CreatedAtTimestamp",
        TG_OP,
        d_updated_user,
        d_update_timestamp,
        d_nr."CustomAttributeData",
        d_nr."Rationale",
        d_nr."TestDate"
    );

RETURN d_nr;

END;

$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS document_assessment_result_audit_trigger ON risksmart.document_assessment_result;

CREATE TRIGGER document_assessment_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document_assessment_result FOR EACH ROW EXECUTE FUNCTION risksmart.document_assessment_result_modified();

-- Obligation assessment result audit table
CREATE OR REPLACE FUNCTION risksmart.obligation_assessment_result_modified() RETURNS trigger AS $body$
DECLARE o_nr RECORD;

o_updated_user TEXT := risksmart.get_hasura_user_id();

o_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN IF (TG_OP = 'INSERT') then o_nr := NEW;

elsif (TG_OP = 'DELETE') then o_nr := OLD;

END IF;

insert into risksmart.obligation_assessment_result_audit(
        "Id",
        "AssessmentId",
        "ObligationId",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CustomAttributeData",
        "Rationale",
        "TestDate"
    )
values (
        o_nr."Id",
        o_nr."AssessmentId",
        o_nr."ObligationId",
        o_nr."Rating",
        o_nr."OrgKey",
        o_nr."CreatedByUser",
        o_nr."CreatedAtTimestamp",
        TG_OP,
        o_updated_user,
        o_update_timestamp,
        o_nr."CustomAttributeData",
        o_nr."Rationale",
        o_nr."TestDate"
    );

RETURN o_nr;

END;

$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS obligation_assessment_result_audit_trigger ON risksmart.obligation_assessment_result;

CREATE TRIGGER obligation_assessment_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.obligation_assessment_result FOR EACH ROW EXECUTE FUNCTION risksmart.obligation_assessment_result_modified();

-- Risk assessment result audit table
CREATE OR REPLACE FUNCTION risksmart.risk_assessment_result_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

updated_user TEXT := risksmart.get_hasura_user_id();

update_timestamp timestamp with time zone := statement_timestamp();

BEGIN IF (TG_OP = 'INSERT') then nr := NEW;

elsif (TG_OP = 'DELETE') then nr := OLD;

END IF;

insert into risksmart.risk_assessment_result_audit(
        "Id",
        "AssessmentId",
        "RiskId",
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
        "TestDate"
    )
values (
        nr."Id",
        nr."AssessmentId",
        nr."RiskId",
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
        nr."TestDate"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS risk_assessment_result_audit_trigger ON risksmart.risk_assessment_result;

CREATE TRIGGER risk_assessment_result_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.risk_assessment_result FOR EACH ROW EXECUTE FUNCTION risksmart.risk_assessment_result_modified();
ALTER TABLE risksmart.tag_type ALTER COLUMN "TagTypeId" set default gen_random_uuid();

alter table risksmart.indicator
add column "UpperAppetiteNum" numeric;

alter table risksmart.indicator
add column "LowerAppetiteNum" numeric;

alter table risksmart.indicator_audit
add column "UpperAppetiteNum" numeric;

alter table risksmart.indicator_audit
add column "LowerAppetiteNum" numeric;

CREATE OR REPLACE FUNCTION risksmart.indicator_modified() RETURNS trigger AS $body$
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

insert into risksmart.indicator_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Type",
        "TestFrequency",
        "Unit",
        "UpperToleranceNum",
        "LowerToleranceNum",
        "TargetValueTxt",
        "UpperAppetiteNum",
        "LowerAppetiteNum",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "SequentialId",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Description",
        nr."Type",
        nr."TestFrequency",
        nr."Unit",
        nr."UpperToleranceNum",
        nr."LowerToleranceNum",
        nr."TargetValueTxt",
        nr."UpperAppetiteNum",
        nr."LowerAppetiteNum",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."SequentialId",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
alter table risksmart.risk_assessment_result DROP CONSTRAINT rating_check;
alter table "risksmart"."tag"
  add constraint "tag_TagTypeId_fkey"
  foreign key ("TagTypeId")
  references "risksmart"."tag_type"
  ("TagTypeId") on update restrict on delete restrict;

CREATE TABLE IF NOT EXISTS risksmart.department_type_group (
    "Id" uuid default gen_random_uuid() not null,
    "Name" text not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    CONSTRAINT "DepartmentTypeGroup_pkey" PRIMARY KEY ("OrgKey", "Name"),
    CONSTRAINT "department_type_group_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey"),
    CONSTRAINT "department_type_group_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth."user" ("Id"),
    CONSTRAINT "department_type_group_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth."user" ("Id"),
    UNIQUE ("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.department_type_group_audit (
    "Id" uuid not null,
    "Name" text not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "Action" risksmart.db_action,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.department_type
ADD COLUMN IF NOT EXISTS "DepartmentTypeGroupId" uuid;

ALTER TABLE risksmart.department_type
ADD CONSTRAINT department_type_DepartmentTypeGroupId_fkey FOREIGN KEY ("DepartmentTypeGroupId") REFERENCES risksmart.department_type_group ("Id");

ALTER TABLE risksmart.department_type_audit
ADD COLUMN IF NOT EXISTS "DepartmentTypeGroupId" uuid;

CREATE OR REPLACE FUNCTION risksmart.department_type_modified() RETURNS trigger AS $body$
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

insert into risksmart.department_type_audit(
        "DepartmentTypeId",
        "Name",
        "Description",
        "OrgKey",
        "DepartmentTypeGroupId",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."DepartmentTypeId",
        nr."Name",
        nr."Description",
        nr."OrgKey",
        nr."DepartmentTypeGroupId",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.department_type_group_modified() RETURNS trigger AS $body$
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

INSERT INTO risksmart.department_type_group_audit(
        "Id",
        "Name",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."Id",
        nr."Name",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER department_type_group_audit_insert_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.department_type_group FOR EACH ROW EXECUTE FUNCTION risksmart.department_type_group_modified();
CREATE INDEX "idx_impact_rating_impactId" on risksmart.impact_rating ("ImpactId");

CREATE INDEX "idx_impact_rating_orgKey" on risksmart.impact_rating ("OrgKey");

CREATE INDEX "idx_impact_rating_ratedItemId" on risksmart.impact_rating ("RatedItemId");
ALTER TABLE risksmart.document_file
ADD COLUMN "CustomAttributeData" JSONB;

ALTER TABLE risksmart.document_file_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.document_file_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_file_audit(
        "Id",
        "Version",
        "FileId",
        "Summary",
        "Status",
        "ReasonForReview",
        "ReviewedBy",
        "ReviewDate",
        "NextReviewDate",
        "ParentDocumentId",
        "Content",
        "Type",
        "Link",
        "CustomAttributeData",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action"
    )
values (
        nr."Id",
        nr."Version",
        nr."FileId",
        nr."Summary",
        nr."Status",
        nr."ReasonForReview",
        nr."ReviewedBy",
        nr."ReviewDate",
        nr."NextReviewDate",
        nr."ParentDocumentId",
        nr."Content",
        nr."Type",
        nr."Link",
        nr."CustomAttributeData",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
ALTER TABLE risksmart.department_type
ALTER COLUMN "DepartmentTypeId"
set default gen_random_uuid();
CREATE FUNCTION risksmart.disable_node_ancestor_refresh_trigger() RETURNS void LANGUAGE plpgsql AS $$
DECLARE rec RECORD;

BEGIN FOR rec IN
SELECT t.event_object_schema as table_schema,
    t.event_object_table AS table_name,
    t.trigger_name
FROM information_schema.triggers t
WHERE t.trigger_name = 'node_ancestor_refresh_trigger' LOOP EXECUTE 'ALTER TABLE "' || rec.table_schema || '"."' || rec.table_name || '" DISABLE TRIGGER "' || rec.trigger_name || '";';

END LOOP;

END $$;

CREATE FUNCTION risksmart.enable_node_ancestor_refresh_trigger() RETURNS void LANGUAGE plpgsql AS $$
DECLARE rec RECORD;

BEGIN FOR rec IN
SELECT t.event_object_schema as table_schema,
    t.event_object_table AS table_name,
    t.trigger_name
FROM information_schema.triggers t
WHERE t.trigger_name = 'node_ancestor_refresh_trigger' LOOP EXECUTE 'ALTER TABLE "' || rec.table_schema || '"."' || rec.table_name || '" ENABLE TRIGGER "' || rec.trigger_name || '";';

END LOOP;

END $$;

CREATE OR REPLACE VIEW risksmart.node_ancestor_view as
SELECT DISTINCT a."Id",
    a."AncestorId",
    a."Depth",
    a."ObjectType",
    a."OrgKey"
FROM (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            0 as "Depth",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
        UNION ALL
        SELECT n."Id",
            np1."ParentId" AS "AncestorId",
            1,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
        UNION ALL
        SELECT n."Id",
            np2."ParentId" AS "AncestorId",
            2,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
        UNION ALL
        SELECT n."Id",
            np3."ParentId" AS "AncestorId",
            3,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
        UNION ALL
        SELECT n."Id",
            np4."ParentId" AS "AncestorId",
            4,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
        UNION ALL
        SELECT n."Id",
            np5."ParentId" AS "AncestorId",
            5,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
        UNION ALL
        SELECT n."Id",
            np6."ParentId" AS "AncestorId",
            6,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
        UNION ALL
        SELECT n."Id",
            np7."ParentId" AS "AncestorId",
            7,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
        UNION ALL
        SELECT n."Id",
            np8."ParentId" AS "AncestorId",
            8,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
        UNION ALL
        SELECT n."Id",
            np9."ParentId" AS "AncestorId",
            9,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
            INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
        UNION ALL
        SELECT n."Id",
            np10."ParentId" AS "AncestorId",
            10,
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
            INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
            INNER JOIN risksmart.node_parent np10 ON np9."ParentId" = np10."Id"
    ) a;

CREATE OR REPLACE FUNCTION risksmart.node_parent_refresh_all_orgs() RETURNS void LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_parent_view npv
        WHERE npv."Id" = np."Id"
            AND npv."ParentId" = np."ParentId"
    );

INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT npv."Id",
    npv."ParentId",
    npv."OrgKey"
FROM risksmart.node_parent_view npv
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_parent np
        WHERE np."Id" = npv."Id"
            AND np."ParentId" = npv."ParentId"
    );

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_ancestor_refresh_all_orgs() RETURNS void LANGUAGE plpgsql AS $$ BEGIN perform risksmart.node_parent_refresh_all_orgs();

DELETE FROM risksmart.node_ancestor na
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor_view nav
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "Depth",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."Depth",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart.node_ancestor_view nav
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

END;

$$;
-- In many to many world, an ancestor can appear at multple depths, so removing so we can main a primary key of "Id" and "AncestorId"
ALTER TABLE risksmart.node_ancestor DROP COLUMN "Depth";

DROP VIEW risksmart.node_ancestor_view;

-- Removing Depth from view
CREATE OR REPLACE VIEW risksmart.node_ancestor_view as
SELECT DISTINCT a."Id",
    a."AncestorId",
    a."ObjectType",
    a."OrgKey"
FROM (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
        UNION ALL
        SELECT n."Id",
            np1."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
        UNION ALL
        SELECT n."Id",
            np2."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
        UNION ALL
        SELECT n."Id",
            np3."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
        UNION ALL
        SELECT n."Id",
            np4."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
        UNION ALL
        SELECT n."Id",
            np5."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
        UNION ALL
        SELECT n."Id",
            np6."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
        UNION ALL
        SELECT n."Id",
            np7."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
        UNION ALL
        SELECT n."Id",
            np8."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
        UNION ALL
        SELECT n."Id",
            np9."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
            INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
        UNION ALL
        SELECT n."Id",
            np10."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
            INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
            INNER JOIN risksmart.node_parent np10 ON np9."ParentId" = np10."Id"
    ) a;

-- Removing depth
CREATE OR REPLACE FUNCTION risksmart.get_org_node_ancestor_view(orgKey text) RETURNS SETOF risksmart.node_ancestor AS $$
SELECT DISTINCT a."Id",
    a."AncestorId",
    a."ObjectType",
    a."OrgKey"
FROM (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np1."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np2."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np3."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np4."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np5."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np6."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np7."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np8."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np9."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
            INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
        WHERE n."OrgKey" = orgKey
        UNION ALL
        SELECT n."Id",
            np10."ParentId" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.node_parent np1 ON n."Id" = np1."Id"
            INNER JOIN risksmart.node_parent np2 ON np1."ParentId" = np2."Id"
            INNER JOIN risksmart.node_parent np3 ON np2."ParentId" = np3."Id"
            INNER JOIN risksmart.node_parent np4 ON np3."ParentId" = np4."Id"
            INNER JOIN risksmart.node_parent np5 ON np4."ParentId" = np5."Id"
            INNER JOIN risksmart.node_parent np6 ON np5."ParentId" = np6."Id"
            INNER JOIN risksmart.node_parent np7 ON np6."ParentId" = np7."Id"
            INNER JOIN risksmart.node_parent np8 ON np7."ParentId" = np8."Id"
            INNER JOIN risksmart.node_parent np9 ON np8."ParentId" = np9."Id"
            INNER JOIN risksmart.node_parent np10 ON np9."ParentId" = np10."Id"
        WHERE n."OrgKey" = orgKey
    ) a;

$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION risksmart.node_ancestor_refresh_all_orgs() RETURNS void LANGUAGE plpgsql AS $$ BEGIN perform risksmart.node_parent_refresh_all_orgs();

DELETE FROM risksmart.node_ancestor na
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor_view nav
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart.node_ancestor_view nav
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_ancestor_refresh() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE org_id TEXT;

BEGIN
SELECT coalesce(NEW."OrgKey", OLD."OrgKey") into org_id;

perform risksmart.node_parent_refresh(org_id);

DELETE FROM risksmart.node_ancestor na
WHERE na."OrgKey" = org_id
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.get_org_node_ancestor_view(org_id) nav
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart.get_org_node_ancestor_view(org_id) nav
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."OrgKey" = org_id
            AND nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

return null;

END;

$$;
ALTER TABLE risksmart.cause
ALTER COLUMN "Significance" DROP NOT NULL;

ALTER TABLE risksmart.cause_audit
ALTER COLUMN "Significance" DROP NOT NULL;
ALTER TABLE "risksmart"."user_group"
ADD COLUMN "Description" text null;

ALTER TABLE "risksmart"."user_group_audit"
ADD COLUMN "Description" text null;

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.user_group_modified() RETURNS trigger AS $body$
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

insert into risksmart.user_group_audit(
        "Id",
        "Name",
        "Email",
        "Description",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Name",
        nr."Email",
        nr."Description",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
ALTER TABLE risksmart.user_group
ALTER COLUMN "Id"
set default gen_random_uuid();
ALTER TABLE "risksmart"."user_group"
ADD CONSTRAINT unique_orgkey_name_constraint UNIQUE ("OrgKey", "Name");
CREATE OR REPLACE FUNCTION risksmart.risk_assessment_result_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

updated_user TEXT := risksmart.get_hasura_user_id();

update_timestamp timestamp with time zone := statement_timestamp();

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

elsif (TG_OP = 'DELETE') then nr := OLD;

END IF;

insert into risksmart.risk_assessment_result_audit(
        "Id",
        "AssessmentId",
        "RiskId",
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
        "TestDate"
    )
values (
        nr."Id",
        nr."AssessmentId",
        nr."RiskId",
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
        nr."TestDate"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.obligation_assessment_result_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
DECLARE o_nr RECORD;

o_updated_user TEXT := risksmart.get_hasura_user_id();

o_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then o_nr := NEW;

elsif (TG_OP = 'DELETE') then o_nr := OLD;

END IF;

insert into risksmart.obligation_assessment_result_audit(
        "Id",
        "AssessmentId",
        "ObligationId",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CustomAttributeData",
        "Rationale",
        "TestDate"
    )
values (
        o_nr."Id",
        o_nr."AssessmentId",
        o_nr."ObligationId",
        o_nr."Rating",
        o_nr."OrgKey",
        o_nr."CreatedByUser",
        o_nr."CreatedAtTimestamp",
        TG_OP,
        o_updated_user,
        o_update_timestamp,
        o_nr."CustomAttributeData",
        o_nr."Rationale",
        o_nr."TestDate"
    );

RETURN o_nr;

END;

$BODY$;

CREATE OR REPLACE FUNCTION risksmart.document_assessment_result_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
DECLARE d_nr RECORD;

d_updated_user TEXT := risksmart.get_hasura_user_id();

d_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then d_nr := NEW;

elsif (TG_OP = 'DELETE') then d_nr := OLD;

END IF;

insert into risksmart.document_assessment_result_audit(
        "Id",
        "AssessmentId",
        "DocumentId",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CustomAttributeData",
        "Rationale",
        "TestDate"
    )
values (
        d_nr."Id",
        d_nr."AssessmentId",
        d_nr."DocumentId",
        d_nr."Rating",
        d_nr."OrgKey",
        d_nr."CreatedByUser",
        d_nr."CreatedAtTimestamp",
        TG_OP,
        d_updated_user,
        d_update_timestamp,
        d_nr."CustomAttributeData",
        d_nr."Rationale",
        d_nr."TestDate"
    );

RETURN d_nr;

END;

$BODY$;
ALTER TABLE risksmart.risk_assessment DROP CONSTRAINT "risk_assessment_ModifiedByUser_fkey";

ALTER TABLE risksmart.risk_assessment DROP CONSTRAINT "risk_assessment_createdByUser_fkey";

ALTER TABLE risksmart.risk_assessment DROP CONSTRAINT "risk_assessment_id_fkey";

ALTER TABLE risksmart.risk_assessment DROP CONSTRAINT "risk_assessment_orgKey_fkey";

ALTER TABLE risksmart.risk_assessment
    RENAME TO old_risk_assessment;

ALTER TABLE risksmart.risk_assessment_audit
    RENAME TO old_risk_assessment_audit;

ALTER TABLE risksmart.document_assessment DROP CONSTRAINT "Document_assessment_status_fkey";

ALTER TABLE risksmart.document_assessment DROP CONSTRAINT "document_assessment_CompletedBy_fkey";

ALTER TABLE risksmart.document_assessment DROP CONSTRAINT "document_assessment_ModifiedByUser_fkey";

ALTER TABLE risksmart.document_assessment DROP CONSTRAINT "document_assessment_Owner_fkey";

ALTER TABLE risksmart.document_assessment DROP CONSTRAINT "document_assessment_createdByUser_fkey";

ALTER TABLE risksmart.document_assessment DROP CONSTRAINT "document_assessment_id_fkey";

ALTER TABLE risksmart.document_assessment DROP CONSTRAINT "document_assessment_orgKey_fkey";

ALTER TABLE risksmart.document_assessment
    RENAME TO old_document_assessment;

ALTER TABLE risksmart.document_assessment_audit
    RENAME TO old_document_assessment_audit;

ALTER TABLE risksmart.obligation_assessment DROP CONSTRAINT "Obligation_assessment_status_fkey";

ALTER TABLE risksmart.obligation_assessment DROP CONSTRAINT "obligation_assessment_CompletedBy_fkey";

ALTER TABLE risksmart.obligation_assessment DROP CONSTRAINT "obligation_assessment_ModifiedByUser_fkey";

ALTER TABLE risksmart.obligation_assessment DROP CONSTRAINT "obligation_assessment_Owner_fkey";

ALTER TABLE risksmart.obligation_assessment DROP CONSTRAINT "obligation_assessment_createdByUser_fkey";

ALTER TABLE risksmart.obligation_assessment DROP CONSTRAINT "obligation_assessment_id_fkey";

ALTER TABLE risksmart.obligation_assessment DROP CONSTRAINT "obligation_assessment_orgKey_fkey";

ALTER TABLE risksmart.obligation_assessment
    RENAME TO old_obligation_assessment;

ALTER TABLE risksmart.obligation_assessment_audit
    RENAME TO old_obligation_assessment_audit;
ALTER TABLE risksmart.issue
ALTER COLUMN "ImpactsCustomer" DROP NOT NULL;

ALTER TABLE risksmart.issue
ALTER COLUMN "IsExternalIssue" DROP NOT NULL;

ALTER TABLE risksmart.issue_audit
ALTER COLUMN "ImpactsCustomer" DROP NOT NULL;

ALTER TABLE risksmart.issue_audit
ALTER COLUMN "IsExternalIssue" DROP NOT NULL;
ALTER TABLE risksmart.obligation_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;
ALTER TABLE risksmart.obligation_impact_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;
ALTER TABLE risksmart.user_group_user_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;
ALTER TABLE risksmart.indicator_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;
ALTER TABLE risksmart.indicator_result_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;
ALTER TABLE risksmart.document_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT npv."Id",
    npv."ParentId",
    npv."OrgKey"
FROM risksmart.node_parent_view npv
WHERE npv."OrgKey" in (
        select i."OrgKey"
        from inserted i
    )
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_parent np
            INNER JOIN inserted i ON i."OrgKey" = np."OrgKey"
        WHERE np."Id" = npv."Id"
            AND np."ParentId" = npv."ParentId"
    );

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np
WHERE np."OrgKey" in (
        select i."OrgKey"
        from deleted i
    )
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_parent_view npv
            INNER JOIN deleted d ON d."OrgKey" = npv."OrgKey"
        WHERE npv."Id" = np."Id"
            AND npv."ParentId" = np."ParentId"
    );

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np
WHERE np."OrgKey" in (
        select i."OrgKey"
        from deleted i
    )
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_parent_view npv
            INNER JOIN deleted d ON d."OrgKey" = npv."OrgKey"
        WHERE npv."Id" = np."Id"
            AND npv."ParentId" = np."ParentId"
    );

INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT npv."Id",
    npv."ParentId",
    npv."OrgKey"
FROM risksmart.node_parent_view npv
WHERE npv."OrgKey" in (
        select i."OrgKey"
        from inserted i
    )
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_parent np
            INNER JOIN inserted i ON i."OrgKey" = np."OrgKey"
        WHERE np."Id" = npv."Id"
            AND np."ParentId" = npv."ParentId"
    );

return null;

END;

$$;

-- Performance tweek so that node ancestors aren't rebuild on uncessarily changes
CREATE OR REPLACE FUNCTION risksmart.node_ancestor_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart.node_ancestor_view nav
WHERE nav."OrgKey" in (
        select i."OrgKey"
        from inserted i
    )
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
            INNER JOIN inserted i ON i."OrgKey" = na."OrgKey"
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_ancestor_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_ancestor na
WHERE na."OrgKey" in (
        select i."OrgKey"
        from deleted i
    )
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor_view nav
            INNER JOIN deleted d ON d."OrgKey" = nav."OrgKey"
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.disable_node_ancestor_refresh_trigger() RETURNS void LANGUAGE plpgsql AS $$
DECLARE rec RECORD;

BEGIN FOR rec IN
SELECT t.event_object_schema as table_schema,
    t.event_object_table AS table_name,
    t.trigger_name
FROM information_schema.triggers t
WHERE t.trigger_name in (
        'node_ancestor_delete_refresh_trigger',
        'node_ancestor_insert_refresh_trigger'
    ) LOOP EXECUTE 'ALTER TABLE "' || rec.table_schema || '"."' || rec.table_name || '" DISABLE TRIGGER "' || rec.trigger_name || '";';

END LOOP;

END $$;

CREATE OR REPLACE FUNCTION risksmart.enable_node_ancestor_refresh_trigger() RETURNS void LANGUAGE plpgsql AS $$
DECLARE rec RECORD;

BEGIN FOR rec IN
SELECT t.event_object_schema as table_schema,
    t.event_object_table AS table_name,
    t.trigger_name
FROM information_schema.triggers t
WHERE t.trigger_name in (
        'node_ancestor_delete_refresh_trigger',
        'node_ancestor_insert_refresh_trigger'
    ) LOOP EXECUTE 'ALTER TABLE "' || rec.table_schema || '"."' || rec.table_name || '" ENABLE TRIGGER "' || rec.trigger_name || '";';

END LOOP;

END $$;

-- Update triggers on node_parent to rebuild ancestors
CREATE OR REPLACE TRIGGER node_ancestor_insert_refresh_trigger
AFTER
INSERT ON risksmart.node_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_insert();

CREATE OR REPLACE TRIGGER node_ancestor_delete_refresh_trigger
AFTER DELETE ON risksmart.node_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_delete();

-- Update triggers on node to just rebuild ancestors, and not node_parent
DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.node;

CREATE OR REPLACE TRIGGER node_ancestor_insert_refresh_trigger
AFTER
INSERT ON risksmart.node REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_insert();

CREATE OR REPLACE TRIGGER node_ancestor_delete_refresh_trigger
AFTER DELETE ON risksmart.node REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_ancestor_delete();

DROP FUNCTION risksmart.node_parent_refresh;

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.acceptance;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.acceptance REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.acceptance REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.acceptance REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.action_parent;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.action_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.action_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.action_parent REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.action_update;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.action_update REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.action_update REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.action_update REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.appetite;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.appetite REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.appetite REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.appetite REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.approval_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.approval_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.approval_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.approval_result REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.assessment;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.assessment REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.assessment REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.assessment REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.cause;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.cause REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.cause REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.cause REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.consequence;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.consequence REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.consequence REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.consequence REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.control_parent;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.control_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.control_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.control_parent REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.conversation;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.conversation REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.conversation REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.conversation REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.document_assessment_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.document_assessment_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.document_assessment_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.document_assessment_result REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.document_file;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.document_file REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.document_file REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.document_file REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.impact_rating;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.impact_rating REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.impact_rating REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.impact_rating REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.indicator_parent;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.indicator_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.indicator_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.indicator_parent REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.indicator_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.indicator_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.indicator_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.indicator_result REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.issue_assessment;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.issue_assessment REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.issue_assessment REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.issue_assessment REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.issue_parent;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.issue_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.issue_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.issue_parent REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.issue_update;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.issue_update REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.issue_update REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.issue_update REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.obligation_assessment_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.obligation_assessment_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.obligation_assessment_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.obligation_assessment_result REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.obligation_impact;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.obligation_impact REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.obligation_impact REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.obligation_impact REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.risk;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.risk REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.risk REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.risk REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.risk_assessment_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.risk_assessment_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.risk_assessment_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.risk_assessment_result REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.test_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.test_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.test_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.test_result REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();

DROP TRIGGER IF EXISTS node_ancestor_refresh_trigger ON risksmart.acceptance;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.acceptance REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.acceptance REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.acceptance REFERENCING NEW TABLE AS inserted OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_update();
CREATE OR REPLACE FUNCTION risksmart.node_insert() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
DECLARE sequential_id integer;

BEGIN BEGIN sequential_id := NEW."SequentialId";

EXCEPTION
WHEN undefined_column THEN sequential_id := NULL;

END;

INSERT INTO risksmart.node ("Id", "ObjectType", "OrgKey", "SequentialId")
VALUES(
        NEW."Id",
        TG_TABLE_NAME,
        NEW."OrgKey",
        sequential_id
    )
RETURNING "Id" INTO NEW."Id";

/*
 Avoid full rebuild of node_ancestor from node table triggers
 Note: a full rebuild will happen anyway if there are any relationships are inserted
 */
INSERT INTO risksmart.node_ancestor("Id", "AncestorId", "ObjectType", "OrgKey")
VALUES (NEW."Id", NEW."Id", TG_TABLE_NAME, NEW."OrgKey");

RETURN NEW;

END;

$BODY$;

DROP TRIGGER IF EXISTS node_ancestor_insert_refresh_trigger ON risksmart.node;

CREATE OR REPLACE FUNCTION risksmart.node_delete() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$ BEGIN
DELETE FROM risksmart.node
WHERE "Id" = OLD."Id"
    AND "OrgKey" = OLD."OrgKey";

/*
 Avoid full rebuild of node_ancestor from node table triggers
 Note: a full rebuild will happen anyway if there are any relationships are deleted
 */
DELETE FROM risksmart.node_ancestor
WHERE "Id" = NEW."Id"
    AND "AncestorId" = NEW."Id"
    AND "OrgKey" = NEW."OrgKey";

RETURN NULL;

END;

$BODY$;

DROP TRIGGER IF EXISTS node_ancestor_delete_refresh_trigger ON risksmart.node;
CREATE OR REPLACE FUNCTION risksmart.node_ancestor_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "ObjectType",
        "OrgKey"
    )
SELECT DISTINCT nav."Id",
    nav."AncestorId",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart.node_ancestor_view nav
WHERE nav."OrgKey" in (
        select i."OrgKey"
        from inserted i
    )
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
            INNER JOIN inserted i ON i."OrgKey" = na."OrgKey"
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

return null;

END;

$$;
CREATE OR REPLACE FUNCTION risksmart.node_ancestor_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart.node_ancestor_view nav
WHERE nav."OrgKey" in (
        select i."OrgKey"
        from inserted i
    )
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_ancestor_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_ancestor na
WHERE na."OrgKey" in (
        select i."OrgKey"
        from deleted i
    )
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor_view nav
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

return null;

END;

$$;
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentRiskId",
    i."OrgKey"
FROM inserted i;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentRiskId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (old."ParentRiskId" <> new."ParentRiskId") THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentRiskId"
    AND np."Id" = old."Id";

INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentRiskId",
    new."OrgKey";

END IF;

return null;

END;

$$;

DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.appetite;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.appetite;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.appetite;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.appetite REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentriskid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.appetite REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentriskid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.appetite FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentriskid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN -- Could potentially add an if statement here to avoid statement after trigger running on an empty insert
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentRiskId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentRiskId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentRiskId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentRiskId" <> new."ParentRiskId"
        OR (
            old."ParentRiskId" IS NOT NULL
            AND new."ParentRiskId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentRiskId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."ParentRiskId" <> new."ParentRiskId"
    OR (
        new."ParentRiskId" IS NOT NULL
        AND old."ParentRiskId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentRiskId",
    new."OrgKey";

END IF;

return null;

END;

$$;

DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.acceptance;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.acceptance;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.acceptance;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.acceptance REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentriskid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.acceptance REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentriskid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.acceptance FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentriskid();

DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.risk;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.risk;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.risk;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.risk REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentriskid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.risk REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentriskid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.risk FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentriskid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 
 approval_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.approval_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.approval_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.approval_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.approval_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.approval_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.approval_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentid();

/*
 
 conversation
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.conversation;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.conversation;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.conversation;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.conversation REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.conversation REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.conversation FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_parentissueid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentIssueId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentIssueId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_parentissueid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentIssueId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_parentissueid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentIssueId" <> new."ParentIssueId"
        OR (
            old."ParentIssueId" IS NOT NULL
            AND new."ParentIssueId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentIssueId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."ParentIssueId" <> new."ParentIssueId"
    OR (
        new."ParentIssueId" IS NOT NULL
        AND old."ParentIssueId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentIssueId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 issue_assessment
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.issue_assessment;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.issue_assessment;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.issue_assessment;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.issue_assessment REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.issue_assessment REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.issue_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentissueid();

/*
 issue_update
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.issue_update;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.issue_update;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.issue_update;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.issue_update REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.issue_update REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.issue_update FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentissueid();

/*
 consequence
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.consequence;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.consequence;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.consequence;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.consequence REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.consequence REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.consequence FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentissueid();

/*
 cause
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.cause;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.cause;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.cause;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.cause REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.cause REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.cause FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentissueid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_assessmentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."AssessmentId",
    i."OrgKey"
FROM inserted i
WHERE i."AssessmentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_assessmentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."AssessmentId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_assessmentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."AssessmentId" <> new."AssessmentId"
        OR (
            old."AssessmentId" IS NOT NULL
            AND new."AssessmentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."AssessmentId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."AssessmentId" <> new."AssessmentId"
    OR (
        new."AssessmentId" IS NOT NULL
        AND old."AssessmentId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."AssessmentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 document_assessment_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.document_assessment_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.document_assessment_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.document_assessment_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.document_assessment_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_assessmentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.document_assessment_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_assessmentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.document_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_assessmentid();

/*
 obligation_assessment_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.obligation_assessment_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.obligation_assessment_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.obligation_assessment_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.obligation_assessment_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_assessmentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.obligation_assessment_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_assessmentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.obligation_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_assessmentid();

/*
 risk_assessment_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.risk_assessment_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.risk_assessment_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.risk_assessment_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.risk_assessment_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_assessmentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.risk_assessment_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_assessmentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.risk_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_assessmentid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_originatingitemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."OriginatingItemId",
    i."OrgKey"
FROM inserted i
WHERE i."OriginatingItemId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_originatingitemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."OriginatingItemId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_originatingitemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."OriginatingItemId" <> new."OriginatingItemId"
        OR (
            old."OriginatingItemId" IS NOT NULL
            AND new."OriginatingItemId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."OriginatingItemId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."OriginatingItemId" <> new."OriginatingItemId"
    OR (
        new."OriginatingItemId" IS NOT NULL
        AND old."OriginatingItemId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."OriginatingItemId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 assessment
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.assessment;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.assessment;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.assessment;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.assessment REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_originatingitemid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.assessment REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_originatingitemid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_originatingitemid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_parentactionid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentActionId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentActionId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_parentactionid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentActionId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_parentactionid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentActionId" <> new."ParentActionId"
        OR (
            old."ParentActionId" IS NOT NULL
            AND new."ParentActionId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentActionId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."ParentActionId" <> new."ParentActionId"
    OR (
        new."ParentActionId" IS NOT NULL
        AND old."ParentActionId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentActionId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 action_update
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.action_update;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.action_update;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.action_update;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.action_update REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentactionid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.action_update REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentactionid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.action_update FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentactionid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_parentobligationid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentObligationId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentObligationId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_parentobligationid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentObligationId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_parentobligationid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentObligationId" <> new."ParentObligationId"
        OR (
            old."ParentObligationId" IS NOT NULL
            AND new."ParentObligationId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentObligationId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."ParentObligationId" <> new."ParentObligationId"
    OR (
        new."ParentObligationId" IS NOT NULL
        AND old."ParentObligationId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentObligationId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 obligation_impact
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.obligation_impact;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.obligation_impact;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.obligation_impact;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.obligation_impact REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentobligationid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.obligation_impact REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentobligationid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.obligation_impact FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentobligationid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_parentcontrolid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentControlId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentControlId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_parentcontrolid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentControlId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_parentcontrolid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentControlId" <> new."ParentControlId"
        OR (
            old."ParentControlId" IS NOT NULL
            AND new."ParentControlId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentControlId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."ParentControlId" <> new."ParentControlId"
    OR (
        new."ParentControlId" IS NOT NULL
        AND old."ParentControlId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentControlId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 test_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.test_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.test_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.test_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.test_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentcontrolid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.test_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentcontrolid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.test_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentcontrolid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_indicatorid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."IndicatorId",
    i."OrgKey"
FROM inserted i
WHERE i."IndicatorId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_indicatorid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."IndicatorId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_indicatorid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."IndicatorId" <> new."IndicatorId"
        OR (
            old."IndicatorId" IS NOT NULL
            AND new."IndicatorId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."IndicatorId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."IndicatorId" <> new."IndicatorId"
    OR (
        new."IndicatorId" IS NOT NULL
        AND old."IndicatorId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."IndicatorId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 indicator_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.indicator_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.indicator_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.indicator_result;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.indicator_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_indicatorid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.indicator_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_indicatorid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.indicator_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_indicatorid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_parentdocumentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentDocumentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentDocumentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_parentdocumentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentDocumentId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_parentdocumentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentDocumentId" <> new."ParentDocumentId"
        OR (
            old."ParentDocumentId" IS NOT NULL
            AND new."ParentDocumentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentDocumentId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."ParentDocumentId" <> new."ParentDocumentId"
    OR (
        new."ParentDocumentId" IS NOT NULL
        AND old."ParentDocumentId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentDocumentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 document_file
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.document_file;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.document_file;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.document_file;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.document_file REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_parentdocumentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.document_file REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_parentdocumentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.document_file FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_parentdocumentid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_rateditemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."Id",
    i."RatedItemId",
    i."OrgKey"
FROM inserted i
WHERE i."RatedItemId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_rateditemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."RatedItemId"
    AND np."Id" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_rateditemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."RatedItemId" <> new."RatedItemId"
        OR (
            old."RatedItemId" IS NOT NULL
            AND new."RatedItemId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."RatedItemId"
    AND np."Id" = old."Id";

END IF;

IF (
    old."RatedItemId" <> new."RatedItemId"
    OR (
        new."RatedItemId" IS NOT NULL
        AND old."RatedItemId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."RatedItemId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 impact_rating
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.impact_rating;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.impact_rating;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.impact_rating;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.impact_rating REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_rateditemid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.impact_rating REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_rateditemid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.impact_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_rateditemid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_actionid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."ActionId",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_actionid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentId"
    AND np."Id" = d."ActionId";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_actionid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentId"
    AND np."Id" = old."ActionId";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."ActionId",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 action_parent
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.action_parent;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.action_parent;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.action_parent;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.action_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_actionid_parentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.action_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_actionid_parentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.action_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_actionid_parentid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_controlid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."ControlId",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_controlid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentId"
    AND np."Id" = d."ControlId";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_controlid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentId"
    AND np."Id" = old."ControlId";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."ControlId",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 control_parent
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.control_parent;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.control_parent;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.control_parent;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.control_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_controlid_parentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.control_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_controlid_parentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.control_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_controlid_parentid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_issueid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."IssueId",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_issueid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentId"
    AND np."Id" = d."IssueId";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_issueid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentId"
    AND np."Id" = old."IssueId";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."IssueId",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 issue_parent
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.issue_parent;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.issue_parent;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.issue_parent;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.issue_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_issueid_parentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.issue_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_issueid_parentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.issue_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_issueid_parentid();
CREATE OR REPLACE FUNCTION risksmart.node_parent_insert_with_indicatorid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT i."IndicatorId",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_delete_with_indicatorid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_parent np USING deleted d
WHERE np."ParentId" = d."ParentId"
    AND np."Id" = d."IndicatorId";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.node_parent_update_with_indicatorid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.node_parent np
WHERE np."ParentId" = old."ParentId"
    AND np."Id" = old."IndicatorId";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.node_parent (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."IndicatorId",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 indicator_parent
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.indicator_parent;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.indicator_parent;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.indicator_parent;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.indicator_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_insert_with_indicatorid_parentid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.indicator_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.node_parent_delete_with_indicatorid_parentid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.indicator_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.node_parent_update_with_indicatorid_parentid();
CREATE OR REPLACE FUNCTION risksmart.node_ancestor_refresh_all_orgs() RETURNS void LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.node_ancestor na
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor_view nav
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "ObjectType",
        "OrgKey"
    )
SELECT nav."Id",
    nav."AncestorId",
    nav."ObjectType",
    nav."OrgKey"
FROM risksmart.node_ancestor_view nav
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE nav."Id" = na."Id"
            AND nav."AncestorId" = na."AncestorId"
    );

END;

$$;

drop function risksmart.node_parent_refresh_all_orgs;

drop function risksmart.node_parent_insert;

drop function risksmart.node_parent_update;

drop function risksmart.node_parent_delete;

drop view risksmart.node_parent_view;
INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('linked_item', 'Linked item');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('ReadOnly', 'linked_item', 'any', 'read'),
    ('ReadOnly', 'linked_item', 'owner', 'delete'),
    (
        'ReadOnly',
        'linked_item',
        'contributor',
        'delete'
    ),
    ('ReadOnly', 'linked_item', 'owner', 'insert'),
    (
        'ReadOnly',
        'linked_item',
        'contributor',
        'insert'
    ),
    ('Standard', 'linked_item', 'owner', 'read'),
    ('Standard', 'linked_item', 'owner', 'delete'),
    ('Standard', 'linked_item', 'owner', 'insert'),
    ('Standard', 'linked_item', 'contributor', 'read'),
    (
        'Standard',
        'linked_item',
        'contributor',
        'delete'
    ),
    (
        'Standard',
        'linked_item',
        'contributor',
        'insert'
    ),
    ('RiskManager', 'linked_item', 'any', 'read'),
    ('RiskManager', 'linked_item', 'any', 'delete'),
    ('RiskManager', 'linked_item', 'any', 'insert');

CREATE TABLE "risksmart"."linked_item" (
    "OrgKey" text NOT NULL,
    "Source" uuid NOT NULL,
    "Target" uuid NOT NULL,
    "RelationshipType" text DEFAULT 'parent_child',
    "CreatedAtTimestamp" timestamptz NOT NULL DEFAULT statement_timestamp(),
    "CreatedByUser" text,
    PRIMARY KEY ("Source", "Target"),
    CONSTRAINT "linked_item_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey"),
    CONSTRAINT "linked_item_source_fkey" FOREIGN KEY ("Source") REFERENCES risksmart.node ("Id") ON DELETE CASCADE,
    CONSTRAINT "linked_item_target_fkey" FOREIGN KEY ("Target") REFERENCES risksmart.node ("Id") ON DELETE CASCADE,
    CONSTRAINT "linked_item_relationship" CHECK (
        "RelationshipType" in ('parent_child', 'sibling')
    ),
    CONSTRAINT "linked_item_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth."user" ("Id")
);

CREATE unique index "linked_items" on "risksmart"."linked_item"(
    greatest("Source", "Target"),
    least("Target", "Source")
);

CREATE index "linked_items_key" ON risksmart."linked_item" ("Source", "Target", "OrgKey", "RelationshipType");

CREATE TABLE "risksmart"."linked_item_audit" (
    "OrgKey" text NOT NULL,
    "Source" uuid,
    "Target" uuid,
    "RelationshipType" text,
    "CreatedAtTimestamp" timestamptz NOT NULL,
    "CreatedByUser" text,
    "ModifiedAtTimestamp" timestamptz NOT NULL,
    "ModifiedByUser" text,
    "Action" text NOT NULL,
    PRIMARY KEY ("Source", "Target", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.linked_item_modified() RETURNS trigger AS $body$
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

insert into risksmart.linked_item_audit(
        "Source",
        "Target",
        "RelationshipType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Source",
        nr."Target",
        nr."RelationshipType",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

-- Update node parent refresh function
DROP VIEW IF EXISTS risksmart.node_ancestor_view;

CREATE OR REPLACE VIEW risksmart.node_ancestor_view as
SELECT DISTINCT a."Id",
    a."AncestorId",
    a."ObjectType",
    a."OrgKey"
FROM (
        SELECT n."Id",
            n."Id" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
        UNION ALL
        SELECT n."Id",
            np1."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
        WHERE np1."RelationshipType" = 'parent_child'
        UNION ALL
        SELECT n."Id",
            np2."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
            INNER JOIN risksmart.linked_item np2 ON np1."Source" = np2."Target"
        WHERE np1."RelationshipType" = 'parent_child'
            AND np2."RelationshipType" = 'parent_child'
        UNION ALL
        SELECT n."Id",
            np3."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
            INNER JOIN risksmart.linked_item np2 ON np1."Source" = np2."Target"
            INNER JOIN risksmart.linked_item np3 ON np2."Source" = np3."Target"
        WHERE np1."RelationshipType" = 'parent_child'
            AND np2."RelationshipType" = 'parent_child'
            AND np3."RelationshipType" = 'parent_child'
        UNION ALL
        SELECT n."Id",
            np4."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
            INNER JOIN risksmart.linked_item np2 ON np1."Source" = np2."Target"
            INNER JOIN risksmart.linked_item np3 ON np2."Source" = np3."Target"
            INNER JOIN risksmart.linked_item np4 ON np3."Source" = np4."Target"
        WHERE np1."RelationshipType" = 'parent_child'
            AND np2."RelationshipType" = 'parent_child'
            AND np3."RelationshipType" = 'parent_child'
            AND np4."RelationshipType" = 'parent_child'
        UNION ALL
        SELECT n."Id",
            np5."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
            INNER JOIN risksmart.linked_item np2 ON np1."Source" = np2."Target"
            INNER JOIN risksmart.linked_item np3 ON np2."Source" = np3."Target"
            INNER JOIN risksmart.linked_item np4 ON np3."Source" = np4."Target"
            INNER JOIN risksmart.linked_item np5 ON np4."Source" = np5."Target"
        WHERE np1."RelationshipType" = 'parent_child'
            AND np2."RelationshipType" = 'parent_child'
            AND np3."RelationshipType" = 'parent_child'
            AND np4."RelationshipType" = 'parent_child'
            AND np5."RelationshipType" = 'parent_child'
        UNION ALL
        SELECT n."Id",
            np6."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
            INNER JOIN risksmart.linked_item np2 ON np1."Source" = np2."Target"
            INNER JOIN risksmart.linked_item np3 ON np2."Source" = np3."Target"
            INNER JOIN risksmart.linked_item np4 ON np3."Source" = np4."Target"
            INNER JOIN risksmart.linked_item np5 ON np4."Source" = np5."Target"
            INNER JOIN risksmart.linked_item np6 ON np5."Source" = np6."Target"
        WHERE np1."RelationshipType" = 'parent_child'
            AND np2."RelationshipType" = 'parent_child'
            AND np3."RelationshipType" = 'parent_child'
            AND np4."RelationshipType" = 'parent_child'
            AND np5."RelationshipType" = 'parent_child'
            AND np6."RelationshipType" = 'parent_child'
        UNION ALL
        SELECT n."Id",
            np7."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
            INNER JOIN risksmart.linked_item np2 ON np1."Source" = np2."Target"
            INNER JOIN risksmart.linked_item np3 ON np2."Source" = np3."Target"
            INNER JOIN risksmart.linked_item np4 ON np3."Source" = np4."Target"
            INNER JOIN risksmart.linked_item np5 ON np4."Source" = np5."Target"
            INNER JOIN risksmart.linked_item np6 ON np5."Source" = np6."Target"
            INNER JOIN risksmart.linked_item np7 ON np6."Source" = np7."Target"
        WHERE np1."RelationshipType" = 'parent_child'
            AND np2."RelationshipType" = 'parent_child'
            AND np3."RelationshipType" = 'parent_child'
            AND np4."RelationshipType" = 'parent_child'
            AND np5."RelationshipType" = 'parent_child'
            AND np6."RelationshipType" = 'parent_child'
            AND np7."RelationshipType" = 'parent_child'
        UNION ALL
        SELECT n."Id",
            np8."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
            INNER JOIN risksmart.linked_item np2 ON np1."Source" = np2."Target"
            INNER JOIN risksmart.linked_item np3 ON np2."Source" = np3."Target"
            INNER JOIN risksmart.linked_item np4 ON np3."Source" = np4."Target"
            INNER JOIN risksmart.linked_item np5 ON np4."Source" = np5."Target"
            INNER JOIN risksmart.linked_item np6 ON np5."Source" = np6."Target"
            INNER JOIN risksmart.linked_item np7 ON np6."Source" = np7."Target"
            INNER JOIN risksmart.linked_item np8 ON np7."Source" = np8."Target"
        WHERE np1."RelationshipType" = 'parent_child'
            AND np2."RelationshipType" = 'parent_child'
            AND np3."RelationshipType" = 'parent_child'
            AND np4."RelationshipType" = 'parent_child'
            AND np5."RelationshipType" = 'parent_child'
            AND np6."RelationshipType" = 'parent_child'
            AND np7."RelationshipType" = 'parent_child'
            AND np8."RelationshipType" = 'parent_child'
        UNION ALL
        SELECT n."Id",
            np9."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
            INNER JOIN risksmart.linked_item np2 ON np1."Source" = np2."Target"
            INNER JOIN risksmart.linked_item np3 ON np2."Source" = np3."Target"
            INNER JOIN risksmart.linked_item np4 ON np3."Source" = np4."Target"
            INNER JOIN risksmart.linked_item np5 ON np4."Source" = np5."Target"
            INNER JOIN risksmart.linked_item np6 ON np5."Source" = np6."Target"
            INNER JOIN risksmart.linked_item np7 ON np6."Source" = np7."Target"
            INNER JOIN risksmart.linked_item np8 ON np7."Source" = np8."Target"
            INNER JOIN risksmart.linked_item np9 ON np8."Source" = np9."Target"
        WHERE np1."RelationshipType" = 'parent_child'
            AND np2."RelationshipType" = 'parent_child'
            AND np3."RelationshipType" = 'parent_child'
            AND np4."RelationshipType" = 'parent_child'
            AND np5."RelationshipType" = 'parent_child'
            AND np6."RelationshipType" = 'parent_child'
            AND np7."RelationshipType" = 'parent_child'
            AND np8."RelationshipType" = 'parent_child'
            AND np9."RelationshipType" = 'parent_child'
        UNION ALL
        SELECT n."Id",
            np10."Source" AS "AncestorId",
            n."ObjectType",
            n."OrgKey"
        FROM risksmart.node n
            INNER JOIN risksmart.linked_item np1 ON n."Id" = np1."Target"
            INNER JOIN risksmart.linked_item np2 ON np1."Source" = np2."Target"
            INNER JOIN risksmart.linked_item np3 ON np2."Source" = np3."Target"
            INNER JOIN risksmart.linked_item np4 ON np3."Source" = np4."Target"
            INNER JOIN risksmart.linked_item np5 ON np4."Source" = np5."Target"
            INNER JOIN risksmart.linked_item np6 ON np5."Source" = np6."Target"
            INNER JOIN risksmart.linked_item np7 ON np6."Source" = np7."Target"
            INNER JOIN risksmart.linked_item np8 ON np7."Source" = np8."Target"
            INNER JOIN risksmart.linked_item np9 ON np8."Source" = np9."Target"
            INNER JOIN risksmart.linked_item np10 ON np9."Source" = np10."Target"
        WHERE np1."RelationshipType" = 'parent_child'
            AND np2."RelationshipType" = 'parent_child'
            AND np3."RelationshipType" = 'parent_child'
            AND np4."RelationshipType" = 'parent_child'
            AND np5."RelationshipType" = 'parent_child'
            AND np6."RelationshipType" = 'parent_child'
            AND np7."RelationshipType" = 'parent_child'
            AND np8."RelationshipType" = 'parent_child'
            AND np9."RelationshipType" = 'parent_child'
            AND np10."RelationshipType" = 'parent_child'
    ) a;

CREATE OR REPLACE TRIGGER node_ancestor_insert_refresh_trigger
AFTER
INSERT ON risksmart.linked_item REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE FUNCTION risksmart.node_ancestor_insert();

CREATE OR REPLACE TRIGGER node_ancestor_delete_refresh_trigger
AFTER DELETE ON risksmart.linked_item REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE FUNCTION risksmart.node_ancestor_delete();

-- Migrate node parent
INSERT INTO risksmart.linked_item ("Target", "Source", "OrgKey", "RelationshipType")
SELECT np."Id",
    np."ParentId",
    np."OrgKey",
    'parent_child'
FROM risksmart.node_parent np
    JOIN risksmart.node n1 ON n1."Id" = np."Id"
    JOIN risksmart.node n2 ON n2."Id" = np."ParentId"
WHERE n1."ObjectType" NOT IN (
        'risk_assessment',
        'obligation_assessment',
        'document_assessment'
    )
    AND n2."ObjectType" NOT IN (
        'risk_assessment',
        'obligation_assessment',
        'document_assessment'
    );
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentRiskId",
    i."OrgKey"
FROM inserted i;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentRiskId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (old."ParentRiskId" <> new."ParentRiskId") THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentRiskId"
    AND np."Target" = old."Id";

INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentRiskId",
    new."OrgKey";

END IF;

return null;

END;

$$;

DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.appetite;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.appetite;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.appetite;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.appetite REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentriskid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.appetite REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentriskid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.appetite FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentriskid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN -- Could potentially add an if statement here to avoid statement after trigger running on an empty insert
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentRiskId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentRiskId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentRiskId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_parentriskid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentRiskId" <> new."ParentRiskId"
        OR (
            old."ParentRiskId" IS NOT NULL
            AND new."ParentRiskId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentRiskId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."ParentRiskId" <> new."ParentRiskId"
    OR (
        new."ParentRiskId" IS NOT NULL
        AND old."ParentRiskId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentRiskId",
    new."OrgKey";

END IF;

return null;

END;

$$;

DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.acceptance;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.acceptance;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.acceptance;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.acceptance REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentriskid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.acceptance REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentriskid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.acceptance FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentriskid();

DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.risk;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.risk;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.risk;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.risk REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentriskid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.risk REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentriskid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.risk FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentriskid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 
 approval_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.approval_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.approval_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.approval_result;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.approval_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.approval_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.approval_result FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();

/*
 
 conversation
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.conversation;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.conversation;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.conversation;

CREATE OR REPLACE TRIGGER linked_item__insert_trigger
AFTER
INSERT ON risksmart.conversation REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();

CREATE OR REPLACE TRIGGER linked_item__delete_trigger
AFTER DELETE ON risksmart.conversation REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE OR REPLACE TRIGGER linked_item__update_trigger
AFTER
UPDATE ON risksmart.conversation FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentissueid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentIssueId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentIssueId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_parentissueid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentIssueId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_parentissueid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentIssueId" <> new."ParentIssueId"
        OR (
            old."ParentIssueId" IS NOT NULL
            AND new."ParentIssueId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentIssueId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."ParentIssueId" <> new."ParentIssueId"
    OR (
        new."ParentIssueId" IS NOT NULL
        AND old."ParentIssueId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentIssueId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 issue_assessment
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.issue_assessment;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.issue_assessment;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.issue_assessment;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.issue_assessment REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentissueid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.issue_assessment REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentissueid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.issue_assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentissueid();

/*
 issue_update
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.issue_update;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.issue_update;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.issue_update;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.issue_update REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentissueid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.issue_update REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentissueid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.issue_update FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentissueid();

/*
 consequence
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.consequence;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.consequence;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.consequence;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.consequence REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.consequence REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.consequence FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentissueid();

/*
 cause
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.cause;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.cause;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.cause;

CREATE OR REPLACE TRIGGER node_parent_insert_trigger
AFTER
INSERT ON risksmart.cause REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_delete_trigger
AFTER DELETE ON risksmart.cause REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentissueid();

CREATE OR REPLACE TRIGGER node_parent_update_trigger
AFTER
UPDATE ON risksmart.cause FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentissueid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_assessmentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."AssessmentId",
    i."OrgKey"
FROM inserted i
WHERE i."AssessmentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_assessmentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."AssessmentId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_assessmentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."AssessmentId" <> new."AssessmentId"
        OR (
            old."AssessmentId" IS NOT NULL
            AND new."AssessmentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."AssessmentId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."AssessmentId" <> new."AssessmentId"
    OR (
        new."AssessmentId" IS NOT NULL
        AND old."AssessmentId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."AssessmentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 document_assessment_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.document_assessment_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.document_assessment_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.document_assessment_result;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.document_assessment_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_assessmentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.document_assessment_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_assessmentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.document_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_assessmentid();

/*
 obligation_assessment_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.obligation_assessment_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.obligation_assessment_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.obligation_assessment_result;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.obligation_assessment_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_assessmentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.obligation_assessment_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_assessmentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.obligation_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_assessmentid();

/*
 risk_assessment_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.risk_assessment_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.risk_assessment_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.risk_assessment_result;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.risk_assessment_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_assessmentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.risk_assessment_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_assessmentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.risk_assessment_result FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_assessmentid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_originatingitemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."OriginatingItemId",
    i."OrgKey"
FROM inserted i
WHERE i."OriginatingItemId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_originatingitemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."OriginatingItemId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_originatingitemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."OriginatingItemId" <> new."OriginatingItemId"
        OR (
            old."OriginatingItemId" IS NOT NULL
            AND new."OriginatingItemId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."OriginatingItemId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."OriginatingItemId" <> new."OriginatingItemId"
    OR (
        new."OriginatingItemId" IS NOT NULL
        AND old."OriginatingItemId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."OriginatingItemId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 assessment
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.assessment;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.assessment;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.assessment;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.assessment REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_originatingitemid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.assessment REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_originatingitemid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.assessment FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_originatingitemid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentactionid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentActionId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentActionId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_parentactionid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentActionId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_parentactionid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentActionId" <> new."ParentActionId"
        OR (
            old."ParentActionId" IS NOT NULL
            AND new."ParentActionId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentActionId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."ParentActionId" <> new."ParentActionId"
    OR (
        new."ParentActionId" IS NOT NULL
        AND old."ParentActionId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentActionId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 action_update
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.action_update;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.action_update;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.action_update;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.action_update REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentactionid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.action_update REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentactionid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.action_update FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentactionid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentobligationid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentObligationId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentObligationId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_parentobligationid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentObligationId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_parentobligationid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentObligationId" <> new."ParentObligationId"
        OR (
            old."ParentObligationId" IS NOT NULL
            AND new."ParentObligationId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentObligationId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."ParentObligationId" <> new."ParentObligationId"
    OR (
        new."ParentObligationId" IS NOT NULL
        AND old."ParentObligationId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentObligationId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 obligation_impact
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.obligation_impact;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.obligation_impact;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.obligation_impact;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.obligation_impact REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentobligationid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.obligation_impact REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentobligationid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.obligation_impact FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentobligationid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentcontrolid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentControlId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentControlId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_parentcontrolid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentControlId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_parentcontrolid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentControlId" <> new."ParentControlId"
        OR (
            old."ParentControlId" IS NOT NULL
            AND new."ParentControlId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentControlId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."ParentControlId" <> new."ParentControlId"
    OR (
        new."ParentControlId" IS NOT NULL
        AND old."ParentControlId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentControlId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 test_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.test_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.test_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.test_result;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.test_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentcontrolid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.test_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentcontrolid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.test_result FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentcontrolid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_indicatorid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."IndicatorId",
    i."OrgKey"
FROM inserted i
WHERE i."IndicatorId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_indicatorid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."IndicatorId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_indicatorid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."IndicatorId" <> new."IndicatorId"
        OR (
            old."IndicatorId" IS NOT NULL
            AND new."IndicatorId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."IndicatorId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."IndicatorId" <> new."IndicatorId"
    OR (
        new."IndicatorId" IS NOT NULL
        AND old."IndicatorId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."IndicatorId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 indicator_result
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.indicator_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.indicator_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.indicator_result;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.indicator_result REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_indicatorid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.indicator_result REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_indicatorid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.indicator_result FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_indicatorid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentdocumentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentDocumentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentDocumentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_parentdocumentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentDocumentId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_parentdocumentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentDocumentId" <> new."ParentDocumentId"
        OR (
            old."ParentDocumentId" IS NOT NULL
            AND new."ParentDocumentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentDocumentId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."ParentDocumentId" <> new."ParentDocumentId"
    OR (
        new."ParentDocumentId" IS NOT NULL
        AND old."ParentDocumentId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."ParentDocumentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 document_file
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.document_file;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.document_file;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.document_file;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.document_file REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentdocumentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.document_file REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentdocumentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.document_file FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentdocumentid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_rateditemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."RatedItemId",
    i."OrgKey"
FROM inserted i
WHERE i."RatedItemId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_rateditemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."RatedItemId"
    AND np."Target" = d."Id";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_rateditemid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."RatedItemId" <> new."RatedItemId"
        OR (
            old."RatedItemId" IS NOT NULL
            AND new."RatedItemId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."RatedItemId"
    AND np."Target" = old."Id";

END IF;

IF (
    old."RatedItemId" <> new."RatedItemId"
    OR (
        new."RatedItemId" IS NOT NULL
        AND old."RatedItemId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."Id",
    new."RatedItemId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 impact_rating
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.impact_rating;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.impact_rating;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.impact_rating;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.impact_rating REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_rateditemid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.impact_rating REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_rateditemid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.impact_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_rateditemid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_actionid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."ActionId",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_actionid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentId"
    AND np."Target" = d."ActionId";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_actionid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentId"
    AND np."Target" = old."ActionId";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."ActionId",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 action_parent
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.action_parent;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.action_parent;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.action_parent;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.action_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_actionid_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.action_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_actionid_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.action_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_actionid_parentid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_controlid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."ControlId",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_controlid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentId"
    AND np."Target" = d."ControlId";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_controlid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentId"
    AND np."Target" = old."ControlId";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."ControlId",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 control_parent
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.control_parent;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.control_parent;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.control_parent;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.control_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_controlid_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.control_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_controlid_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.control_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_controlid_parentid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_issueid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."IssueId",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_issueid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentId"
    AND np."Target" = d."IssueId";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_issueid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentId"
    AND np."Id" = old."IssueId";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT new."IssueId",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 issue_parent
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.issue_parent;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.issue_parent;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.issue_parent;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.issue_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_issueid_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.issue_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_issueid_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.issue_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_issueid_parentid();
CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_indicatorid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."IndicatorId",
    i."ParentId",
    i."OrgKey"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_delete_with_indicatorid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM risksmart.linked_item np USING deleted d
WHERE np."Source" = d."ParentId"
    AND np."Target" = d."IndicatorId";

return null;

END;

$$;

CREATE OR REPLACE FUNCTION risksmart.linked_item_update_with_indicatorid_parentid() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF (
        old."ParentId" <> new."ParentId"
        OR (
            old."ParentId" IS NOT NULL
            AND new."ParentId" IS NULL
        )
    ) THEN
DELETE FROM risksmart.linked_item np
WHERE np."Source" = old."ParentId"
    AND np."Target" = old."IndicatorId";

END IF;

IF (
    old."ParentId" <> new."ParentId"
    OR (
        new."ParentId" IS NOT NULL
        AND old."ParentId" IS NULL
    )
) THEN
INSERT INTO risksmart.linked_item (
        "Id",
        "ParentId",
        "OrgKey"
    )
SELECT new."IndicatorId",
    new."ParentId",
    new."OrgKey";

END IF;

return null;

END;

$$;

/*
 indicator_parent
 */
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.indicator_parent;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.indicator_parent;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.indicator_parent;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.indicator_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_indicatorid_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.indicator_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_indicatorid_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.indicator_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_indicatorid_parentid();
ALTER TABLE "risksmart"."user_group"
ADD COLUMN "OwnerContributor" BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE "risksmart"."user_group_audit"
ADD COLUMN "OwnerContributor" boolean null;

-- Create triggers to populate audit tables
CREATE OR REPLACE FUNCTION risksmart.user_group_modified() RETURNS trigger AS $body$
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

insert into risksmart.user_group_audit(
        "Id",
        "Name",
        "Email",
        "Description",
        "OwnerContributor",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Name",
        nr."Email",
        nr."Description",
        nr."OwnerContributor",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
ALTER TABLE risksmart.owner_group_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;

ALTER TABLE risksmart.contributor_group_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;