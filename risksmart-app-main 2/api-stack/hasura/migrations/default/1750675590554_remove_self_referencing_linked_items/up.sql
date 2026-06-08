DELETE FROM risksmart.linked_item WHERE "Source" = "Target";

ALTER TABLE risksmart.linked_item
    ADD CONSTRAINT check_not_self_referencing
        CHECK ("Target" != "Source");