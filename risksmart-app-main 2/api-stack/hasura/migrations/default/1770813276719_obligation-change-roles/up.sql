INSERT INTO auth."role_resource_type" ("ResourceType", "IsTopLevel")
VALUES ('obligation_change', false);

INSERT INTO auth."role_type_resource_type" ("RoleKey", "ResourceType")
VALUES ('ComplianceViewer', 'obligation_change'),
    ('ComplianceManager', 'obligation_change');