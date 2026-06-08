CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.obligation REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.obligation REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.obligation FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();

-- Ensure permissions work for existing obligations
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey"
    )
SELECT i."Id",
    i."ParentId",
    i."OrgKey"
FROM risksmart.obligation i
WHERE i."ParentId" IS NOT NULL ON CONFLICT DO NOTHING;

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'Standard',
        'obligation',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'obligation',
        'contributor',
        'insert'
    ),
    (
        'StandardEnhanced',
        'obligation',
        'owner',
        'insert'
    ),
    (
        'StandardEnhanced',
        'obligation',
        'contributor',
        'insert'
    );