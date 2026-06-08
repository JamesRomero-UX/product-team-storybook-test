CREATE TABLE risksmart.issue_assessment_siblings (
    id uuid,
    source_id uuid,
    target_id uuid,
    org_key text
);

CREATE TABLE risksmart.action_assessment_siblings (
    id uuid,
    source_id uuid,
    target_id uuid,
    org_key text
);

insert into risksmart.issue_assessment_siblings (id, source_id, target_id, org_key)
select li."Id",
    li."Source",
    li."Target",
    li."OrgKey"
from risksmart.linked_item li
    inner join risksmart.issue i on i."Id" = li."Target"
    inner join risksmart.assessment a on a."Id" = li."Source"
WHERE li."RelationshipType" = 'sibling';

insert into risksmart.action_assessment_siblings (id, source_id, target_id, org_key)
select li."Id",
    li."Source",
    li."Target",
    li."OrgKey"
from risksmart.linked_item li
    inner join risksmart.action i on i."Id" = li."Target"
    inner join risksmart.assessment a on a."Id" = li."Source"
WHERE li."RelationshipType" = 'sibling';

delete from risksmart.linked_item
where "Id" in (
        select id
        from risksmart.issue_assessment_siblings
    );

delete from risksmart.linked_item
where "Id" in (
        select id
        from risksmart.action_assessment_siblings
    );