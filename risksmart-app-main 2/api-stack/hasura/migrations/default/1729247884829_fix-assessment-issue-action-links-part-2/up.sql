INSERT INTO risksmart.issue_parent(
        "IssueId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "ParentType"
    )
select target_id,
    source_id,
    org_key,
    'SYSTEM',
    'SYSTEM',
    now(),
    now(),
    'assessment'
from risksmart.issue_assessment_siblings;

INSERT INTO risksmart.action_parent(
        "ActionId",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "ParentType"
    )
select target_id,
    source_id,
    org_key,
    'SYSTEM',
    'SYSTEM',
    now(),
    now(),
    'assessment'
from risksmart.action_assessment_siblings;

DROP TABLE risksmart.action_assessment_siblings;

DROP TABLE risksmart.issue_assessment_siblings;