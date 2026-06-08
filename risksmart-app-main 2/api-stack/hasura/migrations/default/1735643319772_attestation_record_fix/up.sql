/*
 Delete all attestation records that are incorrectly linked to a document rather then a document version 
 */
delete from risksmart.attestation_record
where "NodeId" not in (
        select "Id"
        from risksmart.document_file
    );