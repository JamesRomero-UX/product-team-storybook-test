insert into risksmart.parent_type ("Value", "Comment")
values ('tag_type', 'Tag type');

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.tag_type FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.tag_type FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT d."Id",
    'tag_type',
    d."OrgKey"
FROM risksmart.tag_type d;

insert into risksmart.parent_type ("Value", "Comment")
values ('department_type', 'Department Type');

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.department_type FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.department_type FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

INSERT INTO risksmart.node("Id", "ObjectType", "OrgKey")
SELECT d."Id",
    'department_type',
    d."OrgKey"
FROM risksmart.department_type d;