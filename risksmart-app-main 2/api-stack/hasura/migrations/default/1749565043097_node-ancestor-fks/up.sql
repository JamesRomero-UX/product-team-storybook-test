/**
 * This migration script adds foreign key constraints to the `node_ancestor` table.
 * It ensures that the `Id` and `AncestorId` columns reference valid entries in the `node` table.
 * It also cleans up any orphaned records in the `node_ancestor` table before applying the constraints.
 */
DELETE FROM risksmart.node_ancestor
WHERE "Id" not in (
        SELECT "Id"
        FROM risksmart.node
    );

DELETE FROM risksmart.node_ancestor
WHERE "AncestorId" not in (
        SELECT "Id"
        FROM risksmart.node
    );

ALTER TABLE risksmart.node_ancestor
ADD CONSTRAINT node_ancestor_id_fkey FOREIGN KEY ("Id") REFERENCES risksmart.node ("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.node_ancestor
ADD CONSTRAINT node_ancestor_ancestor_id_fkey FOREIGN KEY ("AncestorId") REFERENCES risksmart.node ("Id") ON DELETE CASCADE;