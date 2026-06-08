CREATE TABLE risksmart.change_request_file_operation ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.change_request_file_operation ("Value", "Comment")
VALUES ('added', 'Added'),
    ('removed', 'Removed');

ALTER TABLE risksmart.relation_file
    ADD COLUMN "ChangeRequestFileOperation" text NULL REFERENCES risksmart.change_request_file_operation ("Value") ON DELETE SET NULL;
