-- Add role_access entries for internal audit result and second line result entity types.
-- These parent_type values were created in migrations 1750675590556 and 1750849742690
-- but no role_access entries were added, so permissions were never enforced correctly.

INSERT INTO risksmart.role_access ("RoleKey", "ObjectType", "ContributorType", "AccessType")
VALUES
    -- ============================================================
    -- Internal Audit Result types
    -- ============================================================

    -- CustomerSupport: full CRUD on all internal audit result types (any contributor)
    ('CustomerSupport', 'document_internal_audit_result', 'any', 'read'),
    ('CustomerSupport', 'document_internal_audit_result', 'any', 'insert'),
    ('CustomerSupport', 'document_internal_audit_result', 'any', 'update'),
    ('CustomerSupport', 'document_internal_audit_result', 'any', 'delete'),

    ('CustomerSupport', 'obligation_internal_audit_result', 'any', 'read'),
    ('CustomerSupport', 'obligation_internal_audit_result', 'any', 'insert'),
    ('CustomerSupport', 'obligation_internal_audit_result', 'any', 'update'),
    ('CustomerSupport', 'obligation_internal_audit_result', 'any', 'delete'),

    ('CustomerSupport', 'risk_controlled_internal_audit_result', 'any', 'read'),
    ('CustomerSupport', 'risk_controlled_internal_audit_result', 'any', 'insert'),
    ('CustomerSupport', 'risk_controlled_internal_audit_result', 'any', 'update'),
    ('CustomerSupport', 'risk_controlled_internal_audit_result', 'any', 'delete'),

    ('CustomerSupport', 'risk_uncontrolled_internal_audit_result', 'any', 'read'),
    ('CustomerSupport', 'risk_uncontrolled_internal_audit_result', 'any', 'insert'),
    ('CustomerSupport', 'risk_uncontrolled_internal_audit_result', 'any', 'update'),
    ('CustomerSupport', 'risk_uncontrolled_internal_audit_result', 'any', 'delete'),

    ('CustomerSupport', 'control_test_internal_audit_result', 'any', 'read'),
    ('CustomerSupport', 'control_test_internal_audit_result', 'any', 'insert'),
    ('CustomerSupport', 'control_test_internal_audit_result', 'any', 'update'),
    ('CustomerSupport', 'control_test_internal_audit_result', 'any', 'delete'),

    ('CustomerSupport', 'impact_internal_audit_rating', 'any', 'read'),
    ('CustomerSupport', 'impact_internal_audit_rating', 'any', 'insert'),
    ('CustomerSupport', 'impact_internal_audit_rating', 'any', 'update'),
    ('CustomerSupport', 'impact_internal_audit_rating', 'any', 'delete'),

    -- RiskManager: full CRUD on all internal audit result types (any contributor)
    ('RiskManager', 'document_internal_audit_result', 'any', 'read'),
    ('RiskManager', 'document_internal_audit_result', 'any', 'insert'),
    ('RiskManager', 'document_internal_audit_result', 'any', 'update'),
    ('RiskManager', 'document_internal_audit_result', 'any', 'delete'),

    ('RiskManager', 'obligation_internal_audit_result', 'any', 'read'),
    ('RiskManager', 'obligation_internal_audit_result', 'any', 'insert'),
    ('RiskManager', 'obligation_internal_audit_result', 'any', 'update'),
    ('RiskManager', 'obligation_internal_audit_result', 'any', 'delete'),

    ('RiskManager', 'risk_controlled_internal_audit_result', 'any', 'read'),
    ('RiskManager', 'risk_controlled_internal_audit_result', 'any', 'insert'),
    ('RiskManager', 'risk_controlled_internal_audit_result', 'any', 'update'),
    ('RiskManager', 'risk_controlled_internal_audit_result', 'any', 'delete'),

    ('RiskManager', 'risk_uncontrolled_internal_audit_result', 'any', 'read'),
    ('RiskManager', 'risk_uncontrolled_internal_audit_result', 'any', 'insert'),
    ('RiskManager', 'risk_uncontrolled_internal_audit_result', 'any', 'update'),
    ('RiskManager', 'risk_uncontrolled_internal_audit_result', 'any', 'delete'),

    ('RiskManager', 'control_test_internal_audit_result', 'any', 'read'),
    ('RiskManager', 'control_test_internal_audit_result', 'any', 'insert'),
    ('RiskManager', 'control_test_internal_audit_result', 'any', 'update'),
    ('RiskManager', 'control_test_internal_audit_result', 'any', 'delete'),

    ('RiskManager', 'impact_internal_audit_rating', 'any', 'read'),
    ('RiskManager', 'impact_internal_audit_rating', 'any', 'insert'),
    ('RiskManager', 'impact_internal_audit_rating', 'any', 'update'),
    ('RiskManager', 'impact_internal_audit_rating', 'any', 'delete'),

    -- InternalAudit: full CRUD on all internal audit result types (owner)
    ('InternalAudit', 'document_internal_audit_result', 'owner', 'read'),
    ('InternalAudit', 'document_internal_audit_result', 'owner', 'insert'),
    ('InternalAudit', 'document_internal_audit_result', 'owner', 'update'),
    ('InternalAudit', 'document_internal_audit_result', 'owner', 'delete'),

    ('InternalAudit', 'obligation_internal_audit_result', 'owner', 'read'),
    ('InternalAudit', 'obligation_internal_audit_result', 'owner', 'insert'),
    ('InternalAudit', 'obligation_internal_audit_result', 'owner', 'update'),
    ('InternalAudit', 'obligation_internal_audit_result', 'owner', 'delete'),

    ('InternalAudit', 'risk_controlled_internal_audit_result', 'owner', 'read'),
    ('InternalAudit', 'risk_controlled_internal_audit_result', 'owner', 'insert'),
    ('InternalAudit', 'risk_controlled_internal_audit_result', 'owner', 'update'),
    ('InternalAudit', 'risk_controlled_internal_audit_result', 'owner', 'delete'),

    ('InternalAudit', 'risk_uncontrolled_internal_audit_result', 'owner', 'read'),
    ('InternalAudit', 'risk_uncontrolled_internal_audit_result', 'owner', 'insert'),
    ('InternalAudit', 'risk_uncontrolled_internal_audit_result', 'owner', 'update'),
    ('InternalAudit', 'risk_uncontrolled_internal_audit_result', 'owner', 'delete'),

    ('InternalAudit', 'control_test_internal_audit_result', 'owner', 'read'),
    ('InternalAudit', 'control_test_internal_audit_result', 'owner', 'insert'),
    ('InternalAudit', 'control_test_internal_audit_result', 'owner', 'update'),
    ('InternalAudit', 'control_test_internal_audit_result', 'owner', 'delete'),

    ('InternalAudit', 'impact_internal_audit_rating', 'owner', 'read'),
    ('InternalAudit', 'impact_internal_audit_rating', 'owner', 'insert'),
    ('InternalAudit', 'impact_internal_audit_rating', 'owner', 'update'),
    ('InternalAudit', 'impact_internal_audit_rating', 'owner', 'delete'),

    -- ============================================================
    -- Second Line Result types
    -- ============================================================

    -- CustomerSupport: full CRUD on all second line result types (any contributor)
    ('CustomerSupport', 'document_second_line_result', 'any', 'read'),
    ('CustomerSupport', 'document_second_line_result', 'any', 'insert'),
    ('CustomerSupport', 'document_second_line_result', 'any', 'update'),
    ('CustomerSupport', 'document_second_line_result', 'any', 'delete'),

    ('CustomerSupport', 'obligation_second_line_result', 'any', 'read'),
    ('CustomerSupport', 'obligation_second_line_result', 'any', 'insert'),
    ('CustomerSupport', 'obligation_second_line_result', 'any', 'update'),
    ('CustomerSupport', 'obligation_second_line_result', 'any', 'delete'),

    ('CustomerSupport', 'risk_controlled_second_line_result', 'any', 'read'),
    ('CustomerSupport', 'risk_controlled_second_line_result', 'any', 'insert'),
    ('CustomerSupport', 'risk_controlled_second_line_result', 'any', 'update'),
    ('CustomerSupport', 'risk_controlled_second_line_result', 'any', 'delete'),

    ('CustomerSupport', 'risk_uncontrolled_second_line_result', 'any', 'read'),
    ('CustomerSupport', 'risk_uncontrolled_second_line_result', 'any', 'insert'),
    ('CustomerSupport', 'risk_uncontrolled_second_line_result', 'any', 'update'),
    ('CustomerSupport', 'risk_uncontrolled_second_line_result', 'any', 'delete'),

    ('CustomerSupport', 'control_test_second_line_result', 'any', 'read'),
    ('CustomerSupport', 'control_test_second_line_result', 'any', 'insert'),
    ('CustomerSupport', 'control_test_second_line_result', 'any', 'update'),
    ('CustomerSupport', 'control_test_second_line_result', 'any', 'delete'),

    ('CustomerSupport', 'impact_second_line_rating', 'any', 'read'),
    ('CustomerSupport', 'impact_second_line_rating', 'any', 'insert'),
    ('CustomerSupport', 'impact_second_line_rating', 'any', 'update'),
    ('CustomerSupport', 'impact_second_line_rating', 'any', 'delete'),

    -- RiskManager: full CRUD on all second line result types (any contributor)
    ('RiskManager', 'document_second_line_result', 'any', 'read'),
    ('RiskManager', 'document_second_line_result', 'any', 'insert'),
    ('RiskManager', 'document_second_line_result', 'any', 'update'),
    ('RiskManager', 'document_second_line_result', 'any', 'delete'),

    ('RiskManager', 'obligation_second_line_result', 'any', 'read'),
    ('RiskManager', 'obligation_second_line_result', 'any', 'insert'),
    ('RiskManager', 'obligation_second_line_result', 'any', 'update'),
    ('RiskManager', 'obligation_second_line_result', 'any', 'delete'),

    ('RiskManager', 'risk_controlled_second_line_result', 'any', 'read'),
    ('RiskManager', 'risk_controlled_second_line_result', 'any', 'insert'),
    ('RiskManager', 'risk_controlled_second_line_result', 'any', 'update'),
    ('RiskManager', 'risk_controlled_second_line_result', 'any', 'delete'),

    ('RiskManager', 'risk_uncontrolled_second_line_result', 'any', 'read'),
    ('RiskManager', 'risk_uncontrolled_second_line_result', 'any', 'insert'),
    ('RiskManager', 'risk_uncontrolled_second_line_result', 'any', 'update'),
    ('RiskManager', 'risk_uncontrolled_second_line_result', 'any', 'delete'),

    ('RiskManager', 'control_test_second_line_result', 'any', 'read'),
    ('RiskManager', 'control_test_second_line_result', 'any', 'insert'),
    ('RiskManager', 'control_test_second_line_result', 'any', 'update'),
    ('RiskManager', 'control_test_second_line_result', 'any', 'delete'),

    ('RiskManager', 'impact_second_line_rating', 'any', 'read'),
    ('RiskManager', 'impact_second_line_rating', 'any', 'insert'),
    ('RiskManager', 'impact_second_line_rating', 'any', 'update'),
    ('RiskManager', 'impact_second_line_rating', 'any', 'delete'),

    -- ReadOnly: read access on all second line result types (any contributor)
    ('ReadOnly', 'document_second_line_result', 'any', 'read'),
    ('ReadOnly', 'obligation_second_line_result', 'any', 'read'),
    ('ReadOnly', 'risk_controlled_second_line_result', 'any', 'read'),
    ('ReadOnly', 'risk_uncontrolled_second_line_result', 'any', 'read'),
    ('ReadOnly', 'control_test_second_line_result', 'any', 'read'),
    ('ReadOnly', 'impact_second_line_rating', 'any', 'read')

ON CONFLICT ("ObjectType", "RoleKey", "ContributorType", "AccessType") DO NOTHING;
