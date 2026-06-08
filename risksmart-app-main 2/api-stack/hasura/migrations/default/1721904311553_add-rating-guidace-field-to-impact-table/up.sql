ALTER TABLE risksmart."impact"
  ADD COLUMN "RatingGuidance" text;

ALTER TABLE risksmart."impact_audit"
  ADD COLUMN "RatingGuidance" text;

CREATE
OR REPLACE FUNCTION risksmart.impact_modified() RETURNS trigger AS
$body$
DECLARE
anr                        RECORD;
  DECLARE
a_updated_user     TEXT;
  DECLARE
a_update_timestamp timestamp with time zone;

BEGIN
  if
(
    TG_OP = 'UPDATE'
      OR TG_OP = 'INSERT'
    ) then
    anr := NEW;

    a_updated_user
:= NEW."ModifiedByUser";

    a_update_timestamp
:= NEW."ModifiedAtTimestamp";

  elsif
(TG_OP = 'DELETE') then
    anr := OLD;

    a_updated_user
:= risksmart.get_hasura_user_id();

    a_update_timestamp
:= statement_timestamp();

END IF;

insert into risksmart.impact_audit("Id",
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
                                   "Action")
values (anr."Id",
        anr."SequentialId",
        anr."Name",
        anr."Rationale",
        anr."ImpactAppetite",
        anr."LikelihoodAppetite",
        anr."CustomAttributeData",
        anr."OrgKey",
        anr."CreatedByUser",
        anr."CreatedAtTimestamp",
        a_updated_user,
        a_update_timestamp,
        TG_OP);

RETURN anr;

END;

$body$
LANGUAGE plpgsql;

create trigger impact_audit_trigger
  after insert or
update or
delete
on risksmart.impact
  for each row
  execute procedure risksmart.impact_modified();
