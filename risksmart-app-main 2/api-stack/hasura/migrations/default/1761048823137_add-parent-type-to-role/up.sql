INSERT INTO auth.role_resource_type
    ("ResourceType", "IsTopLevel")
VALUES 
    ('scim_configuration', FALSE),
    ('settings', FALSE),
    ('custom_datasource', TRUE);

UPDATE auth.role_type_resource_type
SET "ResourceType" = 'custom_datasource'
WHERE "ResourceType" = 'custom_data_source';

DELETE FROM auth.role_resource_type
WHERE "ResourceType" = 'custom_data_source';

INSERT INTO auth.role_type_resource_type 
    ("RoleKey", "ResourceType")
VALUES 
    ('TechnicalSupport', 'scim_configuration'),
    ('SettingsManager', 'settings');

ALTER TABLE auth.role_resource_type ADD CONSTRAINT role_resource_type_node_type_fkey
    FOREIGN KEY ("ResourceType")
    REFERENCES risksmart.node_type ("Value")
    ON DELETE RESTRICT;

-- Add a column to role_type to categorize roles between manager and viewer roles types.
ALTER TABLE auth.role_type ADD COLUMN "Category" TEXT;

-- Update existing roles to set their category.
UPDATE auth.role_type
SET "Category" = CASE
    WHEN "RoleKey" LIKE ('%Viewer') THEN 'Viewer'
    ELSE 'Manager'
END;

ALTER TABLE auth.role_type
ADD CONSTRAINT role_type_category_check CHECK ("Category" IN ('Manager', 'Viewer'));
-- Make the Category column NOT NULL now that existing rows have been updated.
ALTER TABLE auth.role_type
ALTER COLUMN "Category" SET NOT NULL;