ALTER SYSTEM
SET max_connections TO '250';

ALTER SYSTEM
SET max_locks_per_transaction TO '1024';

create schema if not exists "config";

CREATE TABLE IF NOT EXISTS config.env(
    "Name" text NOT NULL,
    "ValueString" text,
    "ValueInteger" integer,
    CONSTRAINT env_pkey PRIMARY KEY("Name")
);

insert into config.env ("Name", "ValueString")
values ('stage', 'dev');