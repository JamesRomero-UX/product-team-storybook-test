ALTER TABLE risksmart."linked_item"
ADD COLUMN "Id" uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE;