/**
 This is a backout migration for the removal of foreign keys in the node_ancestor table.
 
 When a risksmart.node record is deleted, it relies on the risksmart.linked_item triggers to refresh the risksmart.node_ancestor table.
 If we have foreign keys in the risksmart.node_ancestor table, there is the potential for the node_ancestor table records to get deleted first depending on the order of cascade delete operations.
 
 This could potential lead to a situation where permissions remain in tact between a a node and its grandparent when the parent is deleted.
 
 
 To avoid this, using an after trigger on the risksmart.node table.
 
 So the order will be
 
 
 1. Delete the risksmart.node record
 2. Cascade delete on risksmart.linked_item records
 3. After trigger on risksmart.linked_item to refresh the risksmart.node_ancestor table
 4. After trigger on risksmart.node to delete the risksmart.node_ancestor records (for nodes that don't have linked items records)
 
 
 */
ALTER TABLE risksmart.node_ancestor DROP CONSTRAINT node_ancestor_id_fkey;

ALTER TABLE risksmart.node_ancestor DROP CONSTRAINT node_ancestor_ancestor_id_fkey;

/**
 Delete the node_ancestor records that are associated with the deleted node.
 **/
CREATE OR REPLACE FUNCTION risksmart.delete_node_ancestors() RETURNS trigger AS $body$ BEGIN
DELETE FROM risksmart.node_ancestor
WHERE "Id" = OLD."Id"
    OR "AncestorId" = OLD."Id";

RETURN OLD;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER delete_node_ancestors
AFTER DELETE ON risksmart.node FOR EACH ROW EXECUTE FUNCTION risksmart.delete_node_ancestors();