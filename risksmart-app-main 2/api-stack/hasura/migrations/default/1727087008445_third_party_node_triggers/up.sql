CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.third_party FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.third_party FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();
