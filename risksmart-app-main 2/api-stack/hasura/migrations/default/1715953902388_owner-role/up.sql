INSERT INTO risksmart."role_access" (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES ('Owner', 'obligation', 'any', 'read'),
    ('Owner', 'document', 'any', 'read'),
    ('Owner', 'indicator', 'any', 'read'),
    ('Owner', 'risk', 'any', 'read'),
    ('Owner', 'control', 'any', 'read'),
    ('Owner', 'action', 'any', 'read'),
    ('Owner', 'action_update', 'any', 'read'),
    ('Owner', 'obligation_impact', 'any', 'read'),
    ('Owner', 'issue_assessment', 'any', 'read'),
    ('Owner', 'issue', 'any', 'read'),
    ('Owner', 'dashboard', 'any', 'read'),
    ('Owner', 'indicator_result', 'any', 'read'),
    ('Owner', 'issue_update', 'any', 'read'),
    ('Owner', 'risk_assessment', 'any', 'read'),
    ('Owner', 'control_group', 'any', 'read'),
    ('Owner', 'appetite', 'any', 'read'),
    ('Owner', 'document_assessment', 'any', 'read'),
    ('Owner', 'document_file', 'any', 'read'),
    ('Owner', 'consequence', 'any', 'read'),
    ('Owner', 'acceptance', 'any', 'read'),
    ('Owner', 'test_result', 'any', 'read'),
    ('Owner', 'cause', 'any', 'read'),
    ('Owner', 'obligation_assessment', 'any', 'read'),
    ('Owner', 'assessment', 'any', 'read'),
    (
        'Owner',
        'document_assessment_result',
        'any',
        'read'
    ),
    (
        'Owner',
        'obligation_assessment_result',
        'any',
        'read'
    ),
    ('Owner', 'risk_assessment_result', 'any', 'read'),
    ('Owner', 'approval_result', 'any', 'read'),
    ('Owner', 'conversation', 'any', 'read'),
    ('Owner', 'issue_assessment_audit', 'any', 'read'),
    ('Owner', 'impact', 'any', 'read'),
    ('Owner', 'impact_rating', 'any', 'read'),
    ('Owner', 'linked_item', 'any', 'read'),
    ('Owner', 'linked_item', 'owner', 'delete'),
    ('Owner', 'linked_item', 'contributor', 'delete'),
    ('Owner', 'linked_item', 'owner', 'insert'),
    ('Owner', 'linked_item', 'contributor', 'insert'),
    ('Owner', 'change_request', 'any', 'read'),
    ('Owner', 'obligation', 'owner', 'delete'),
    ('Owner', 'obligation', 'owner', 'update'),
    ('Owner', 'document', 'owner', 'delete'),
    ('Owner', 'document', 'owner', 'update'),
    ('Owner', 'indicator', 'owner', 'delete'),
    ('Owner', 'indicator', 'owner', 'update'),
    ('Owner', 'risk', 'owner', 'delete'),
    ('Owner', 'risk', 'owner', 'update'),
    ('Owner', 'control', 'owner', 'delete'),
    ('Owner', 'control', 'owner', 'update'),
    ('Owner', 'control', 'contributor', 'delete'),
    ('Owner', 'control', 'contributor', 'update'),
    ('Owner', 'action', 'owner', 'delete'),
    ('Owner', 'action', 'owner', 'update'),
    ('Owner', 'action', 'contributor', 'delete'),
    ('Owner', 'action', 'contributor', 'update'),
    ('Owner', 'action_update', 'owner', 'delete'),
    ('Owner', 'action_update', 'owner', 'update'),
    (
        'Owner',
        'action_update',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'action_update',
        'contributor',
        'update'
    ),
    ('Owner', 'obligation_impact', 'owner', 'delete'),
    ('Owner', 'obligation_impact', 'owner', 'update'),
    (
        'Owner',
        'obligation_impact',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'obligation_impact',
        'contributor',
        'update'
    ),
    (
        'Owner',
        'issue_assessment',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'issue_assessment',
        'contributor',
        'update'
    ),
    ('Owner', 'issue_assessment', 'owner', 'delete'),
    ('Owner', 'issue_assessment', 'owner', 'update'),
    ('Owner', 'issue', 'contributor', 'delete'),
    ('Owner', 'issue', 'contributor', 'update'),
    ('Owner', 'issue', 'owner', 'delete'),
    ('Owner', 'issue', 'owner', 'update'),
    ('Owner', 'action_update', 'owner', 'insert'),
    (
        'Owner',
        'action_update',
        'contributor',
        'insert'
    ),
    ('Owner', 'obligation_impact', 'owner', 'insert'),
    (
        'Owner',
        'obligation_impact',
        'contributor',
        'insert'
    ),
    ('Owner', 'issue_assessment', 'owner', 'insert'),
    (
        'Owner',
        'issue_assessment',
        'contributor',
        'insert'
    ),
    ('Owner', 'issue', 'contributor', 'insert'),
    ('Owner', 'issue', 'owner', 'insert'),
    (
        'Owner',
        'obligation_assessment',
        'contributor',
        'insert'
    ),
    (
        'Owner',
        'obligation_assessment',
        'contributor',
        'update'
    ),
    (
        'Owner',
        'obligation_assessment',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'obligation_assessment',
        'owner',
        'insert'
    ),
    (
        'Owner',
        'obligation_assessment',
        'owner',
        'update'
    ),
    (
        'Owner',
        'obligation_assessment',
        'owner',
        'delete'
    ),
    ('Owner', 'test_result', 'owner', 'update'),
    ('Owner', 'test_result', 'owner', 'insert'),
    ('Owner', 'test_result', 'contributor', 'delete'),
    ('Owner', 'test_result', 'contributor', 'update'),
    ('Owner', 'test_result', 'contributor', 'insert'),
    ('Owner', 'risk_assessment', 'owner', 'update'),
    ('Owner', 'risk_assessment', 'owner', 'insert'),
    (
        'Owner',
        'risk_assessment',
        'contributor',
        'update'
    ),
    (
        'Owner',
        'risk_assessment',
        'contributor',
        'insert'
    ),
    ('Owner', 'indicator_result', 'owner', 'update'),
    ('Owner', 'indicator_result', 'owner', 'insert'),
    (
        'Owner',
        'indicator_result',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'indicator_result',
        'contributor',
        'update'
    ),
    (
        'Owner',
        'indicator_result',
        'contributor',
        'insert'
    ),
    ('Owner', 'appetite', 'owner', 'update'),
    ('Owner', 'appetite', 'owner', 'insert'),
    ('Owner', 'appetite', 'contributor', 'delete'),
    ('Owner', 'appetite', 'contributor', 'update'),
    ('Owner', 'appetite', 'contributor', 'insert'),
    ('Owner', 'acceptance', 'owner', 'update'),
    ('Owner', 'acceptance', 'owner', 'insert'),
    ('Owner', 'acceptance', 'contributor', 'delete'),
    ('Owner', 'acceptance', 'contributor', 'update'),
    ('Owner', 'acceptance', 'contributor', 'insert'),
    ('Owner', 'issue_update', 'owner', 'delete'),
    ('Owner', 'issue_update', 'owner', 'update'),
    ('Owner', 'issue_update', 'owner', 'insert'),
    ('Owner', 'issue_update', 'contributor', 'delete'),
    ('Owner', 'issue_update', 'contributor', 'update'),
    ('Owner', 'issue_update', 'contributor', 'insert'),
    ('Owner', 'action', 'owner', 'insert'),
    ('Owner', 'action', 'contributor', 'insert'),
    ('Owner', 'consequence', 'owner', 'delete'),
    ('Owner', 'consequence', 'owner', 'update'),
    ('Owner', 'consequence', 'owner', 'insert'),
    ('Owner', 'consequence', 'contributor', 'delete'),
    ('Owner', 'consequence', 'contributor', 'update'),
    ('Owner', 'consequence', 'contributor', 'insert'),
    ('Owner', 'cause', 'owner', 'delete'),
    ('Owner', 'cause', 'owner', 'update'),
    ('Owner', 'cause', 'owner', 'insert'),
    ('Owner', 'cause', 'contributor', 'delete'),
    ('Owner', 'cause', 'contributor', 'update'),
    ('Owner', 'cause', 'contributor', 'insert'),
    (
        'Owner',
        'document_assessment',
        'owner',
        'delete'
    ),
    (
        'Owner',
        'document_assessment',
        'owner',
        'update'
    ),
    (
        'Owner',
        'document_assessment',
        'owner',
        'insert'
    ),
    (
        'Owner',
        'document_assessment',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'document_assessment',
        'contributor',
        'update'
    ),
    (
        'Owner',
        'document_assessment',
        'contributor',
        'insert'
    ),
    ('Owner', 'document_file', 'owner', 'delete'),
    ('Owner', 'document_file', 'owner', 'update'),
    ('Owner', 'document_file', 'owner', 'insert'),
    (
        'Owner',
        'document_file',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'document_file',
        'contributor',
        'update'
    ),
    (
        'Owner',
        'document_file',
        'contributor',
        'insert'
    ),
    ('Owner', 'control', 'owner', 'insert'),
    ('Owner', 'control', 'contributor', 'insert'),
    ('Owner', 'test_result', 'owner', 'delete'),
    ('Owner', 'indicator_result', 'owner', 'delete'),
    ('Owner', 'indicator', 'owner', 'insert'),
    ('Owner', 'indicator', 'contributor', 'insert'),
    ('Owner', 'indicator', 'contributor', 'delete'),
    ('Owner', 'indicator', 'contributor', 'update'),
    ('Owner', 'appetite', 'owner', 'delete'),
    (
        'Owner',
        'risk_assessment',
        'contributor',
        'delete'
    ),
    ('Owner', 'risk_assessment', 'owner', 'delete'),
    ('Owner', 'acceptance', 'owner', 'delete'),
    ('Owner', 'assessment', 'owner', 'update'),
    ('Owner', 'assessment', 'owner', 'delete'),
    ('Owner', 'assessment', 'contributor', 'update'),
    (
        'Owner',
        'document_assessment_result',
        'owner',
        'update'
    ),
    (
        'Owner',
        'document_assessment_result',
        'owner',
        'delete'
    ),
    (
        'Owner',
        'document_assessment_result',
        'contributor',
        'update'
    ),
    (
        'Owner',
        'obligation_assessment_result',
        'owner',
        'update'
    ),
    (
        'Owner',
        'obligation_assessment_result',
        'owner',
        'delete'
    ),
    (
        'Owner',
        'obligation_assessment_result',
        'contributor',
        'update'
    ),
    (
        'Owner',
        'risk_assessment_result',
        'owner',
        'update'
    ),
    (
        'Owner',
        'risk_assessment_result',
        'owner',
        'delete'
    ),
    (
        'Owner',
        'risk_assessment_result',
        'contributor',
        'update'
    ),
    ('Owner', 'approval_result', 'owner', 'delete'),
    ('Owner', 'approval_result', 'owner', 'insert'),
    ('Owner', 'approval_result', 'owner', 'update'),
    (
        'Owner',
        'approval_result',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'approval_result',
        'contributor',
        'insert'
    ),
    (
        'Owner',
        'approval_result',
        'contributor',
        'update'
    ),
    ('Owner', 'conversation', 'owner', 'update'),
    ('Owner', 'conversation', 'owner', 'insert'),
    ('Owner', 'conversation', 'owner', 'delete'),
    ('Owner', 'conversation', 'contributor', 'update'),
    ('Owner', 'conversation', 'contributor', 'insert'),
    ('Owner', 'conversation', 'contributor', 'delete'),
    ('Owner', 'dashboard', 'any', 'delete'),
    ('Owner', 'dashboard', 'any', 'insert'),
    ('Owner', 'impact_rating', 'owner', 'insert'),
    (
        'Owner',
        'impact_rating',
        'contributor',
        'insert'
    ),
    ('Owner', 'impact_rating', 'owner', 'delete'),
    (
        'Owner',
        'impact_rating',
        'contributor',
        'delete'
    ),
    ('Owner', 'assessment', 'owner', 'insert'),
    ('Owner', 'assessment', 'contributor', 'insert'),
    ('Owner', 'assessment', 'contributor', 'delete'),
    (
        'Owner',
        'document_assessment_result',
        'owner',
        'insert'
    ),
    (
        'Owner',
        'document_assessment_result',
        'contributor',
        'insert'
    ),
    (
        'Owner',
        'document_assessment_result',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'obligation_assessment_result',
        'owner',
        'insert'
    ),
    (
        'Owner',
        'obligation_assessment_result',
        'contributor',
        'insert'
    ),
    (
        'Owner',
        'obligation_assessment_result',
        'contributor',
        'delete'
    ),
    (
        'Owner',
        'risk_assessment_result',
        'owner',
        'insert'
    ),
    (
        'Owner',
        'risk_assessment_result',
        'contributor',
        'insert'
    ),
    (
        'Owner',
        'risk_assessment_result',
        'contributor',
        'delete'
    ),
    ('Owner', 'risk', 'owner', 'insert'),
    ('Owner', 'change_request', 'any', 'insert');