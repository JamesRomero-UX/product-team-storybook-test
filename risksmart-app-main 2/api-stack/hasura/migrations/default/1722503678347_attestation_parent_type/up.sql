INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('attestation_record', 'Attestation Record');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES
  ('CustomerSupport', 'attestation_record', 'any', 'read'),
  ('RiskManager', 'attestation_record', 'any', 'read');
