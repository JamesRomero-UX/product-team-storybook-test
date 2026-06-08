UPDATE auth.role_type_resource_type SET "ResourceType" = 'document' WHERE "ResourceType" = 'policy';
UPDATE auth.role_type_resource_type SET "ResourceType" = 'obligation' WHERE "ResourceType" = 'compliance';

DELETE FROM auth.role_resource_type WHERE "ResourceType" IN ('policy', 'compliance');