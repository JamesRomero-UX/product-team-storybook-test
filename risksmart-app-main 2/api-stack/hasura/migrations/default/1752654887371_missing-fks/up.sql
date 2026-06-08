delete from risksmart.cause
where "ParentIssueId" not in (
        select "Id"
        from risksmart.issue
    );

ALTER TABLE risksmart.cause
ADD FOREIGN KEY ("ParentIssueId") REFERENCES risksmart.issue("Id") ON DELETE CASCADE;

delete from risksmart.consequence
where "ParentIssueId" not in (
        select "Id"
        from risksmart.issue
    );

ALTER TABLE risksmart.consequence
ADD FOREIGN KEY ("ParentIssueId") REFERENCES risksmart.issue("Id") ON DELETE CASCADE;

delete from risksmart.issue_update
where "ParentIssueId" not in (
        select "Id"
        from risksmart.issue
    );

ALTER TABLE risksmart.issue_update
ADD FOREIGN KEY ("ParentIssueId") REFERENCES risksmart.issue("Id") ON DELETE CASCADE;

delete from risksmart.test_result
where "ParentControlId" not in (
        select "Id"
        from risksmart.control
    );

ALTER TABLE risksmart.test_result
ADD FOREIGN KEY ("ParentControlId") REFERENCES risksmart.control("Id") ON DELETE CASCADE;

delete from risksmart.assessment_activity
where "ParentId" not in (
        select "Id"
        from risksmart.node
    );

ALTER TABLE risksmart.assessment_activity
ADD FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

delete from risksmart.assessment_activity
where "RiskId" not in (
        select "Id"
        from risksmart.risk
    );

ALTER TABLE risksmart.assessment_activity
ADD FOREIGN KEY ("RiskId") REFERENCES risksmart.risk("Id") ON DELETE CASCADE;

delete from risksmart.wizard
where "RiskId" not in (
        select "Id"
        from risksmart.risk
    );

ALTER TABLE risksmart.wizard
ADD FOREIGN KEY ("RiskId") REFERENCES risksmart.risk("Id") ON DELETE CASCADE;

delete from risksmart.wizard
where "AssessmentId" not in (
        select "Id"
        from risksmart.assessment
    );

ALTER TABLE risksmart.wizard
ADD FOREIGN KEY ("AssessmentId") REFERENCES risksmart.assessment("Id") ON DELETE CASCADE;

delete from risksmart.wizard
where "ActivityId" not in (
        select "Id"
        from risksmart.assessment_activity
    );

ALTER TABLE risksmart.wizard
ADD FOREIGN KEY ("ActivityId") REFERENCES risksmart.assessment_activity("Id") ON DELETE CASCADE;

delete from risksmart.action_update
where "ParentActionId" not in (
        select "Id"
        from risksmart.action
    );

ALTER TABLE risksmart.action_update
ADD FOREIGN KEY ("ParentActionId") REFERENCES risksmart.action("Id") ON DELETE CASCADE;

delete from risksmart.obligation_impact
where "ParentObligationId" not in (
        select "Id"
        from risksmart.obligation
    );

ALTER TABLE risksmart.obligation_impact
ADD FOREIGN KEY ("ParentObligationId") REFERENCES risksmart.obligation("Id") ON DELETE CASCADE;

delete from risksmart.relation_file
where "FileId" not in (
        select "Id"
        from risksmart.file
    );

ALTER TABLE risksmart.relation_file
ADD FOREIGN KEY ("FileId") REFERENCES risksmart.file("Id") ON DELETE CASCADE;

delete from risksmart.indicator_result
where "IndicatorId" not in (
        select "Id"
        from risksmart.indicator
    );

ALTER TABLE risksmart.indicator_result
ADD FOREIGN KEY ("IndicatorId") REFERENCES risksmart.indicator("Id") ON DELETE CASCADE;

delete from risksmart.document_linked_document
where "DocumentId" not in (
        select "Id"
        from risksmart.document
    );

ALTER TABLE risksmart.document_linked_document
ADD FOREIGN KEY ("DocumentId") REFERENCES risksmart.document("Id") ON DELETE CASCADE;

delete from risksmart.document_linked_document
where "LinkedDocumentId" not in (
        select "Id"
        from risksmart.document
    );

ALTER TABLE risksmart.document_linked_document
ADD FOREIGN KEY ("LinkedDocumentId") REFERENCES risksmart.document("Id") ON DELETE CASCADE;

delete from risksmart.document_file
where "ParentDocumentId" not in (
        select "Id"
        from risksmart.document
    );

ALTER TABLE risksmart.document_file
ADD FOREIGN KEY ("ParentDocumentId") REFERENCES risksmart.document("Id") ON DELETE CASCADE;

delete from risksmart.issue_assessment
where "ParentIssueId" not in (
        select "Id"
        from risksmart.issue
    );

ALTER TABLE risksmart.issue_assessment
ADD FOREIGN KEY ("ParentIssueId") REFERENCES risksmart.issue("Id") ON DELETE CASCADE;

delete from risksmart.approver
where "UserId" not in (
        select "Id"
        from auth.user
    );

ALTER TABLE risksmart.approver
ADD FOREIGN KEY ("UserId") REFERENCES auth.user("Id");

delete from risksmart.form_configuration
where "CustomAttributeSchemaId" not in (
        select "Id"
        from risksmart.custom_attribute_schema
    );

ALTER TABLE risksmart.form_configuration
ADD FOREIGN KEY ("CustomAttributeSchemaId") REFERENCES risksmart.custom_attribute_schema("Id");

delete from risksmart.change_request
where "ActionUserId" not in (
        select "Id"
        from auth.user
    );

ALTER TABLE risksmart.change_request
ADD FOREIGN KEY ("ActionUserId") REFERENCES auth.user("Id");

delete from risksmart.impact_parent
where "ParentId" not in (
        select "Id"
        from risksmart.node
    );

ALTER TABLE risksmart.impact_parent
ADD FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

delete from risksmart.third_party_response
where "ParentId" not in (
        select "Id"
        from risksmart.third_party
    );

ALTER TABLE risksmart.third_party_response
ADD FOREIGN KEY ("ParentId") REFERENCES risksmart.third_party("Id") ON DELETE CASCADE;