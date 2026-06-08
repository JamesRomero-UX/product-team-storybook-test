CREATE INDEX "idx_document_file_parent_published_desc" 
ON risksmart.document_file ("ParentDocumentId", "OrgKey", "PublishedDate" DESC NULLS LAST);

CREATE INDEX  "idx_document_file_parent_created_desc "
ON risksmart.document_file ("ParentDocumentId", "OrgKey", "CreatedAtTimestamp" DESC);

DROP INDEX IF EXISTS risksmart.document_file_parentDocumentId;
