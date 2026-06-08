# SCIM Discovery Endpoints Implementation

This document provides a comprehensive overview of the SCIM 2.0 discovery endpoints implementation in the RiskSmart SCIM API.

## Overview

The SCIM 2.0 specification defines three discovery endpoints that enable SCIM clients to discover the service provider's capabilities, schemas, and resource types. These endpoints are essential for SCIM compliance and proper integration with identity providers like Okta, Microsoft Entra ID, and others.

## Implemented Discovery Endpoints

### 1. Schemas Endpoint (`/scim/Schemas`)

**Purpose**: Returns SCIM schema definitions that describe the structure and characteristics of SCIM resources.

**Endpoint**: `GET /scim/Schemas`

**Implementation**: `/packages/scim-api/src/handlers/http/schemas/get.ts`

**Response Structure**:

```json
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
  "totalResults": 2,
  "resources": [
    {
      "id": "urn:ietf:params:scim:schemas:core:2.0:User",
      "name": "User",
      "description": "User Account",
      "attributes": [...]
    },
    {
      "id": "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
      "name": "EnterpriseUser",
      "description": "Enterprise User",
      "attributes": [...]
    }
  ]
}
```

**Key Features**:

- Provides User schema with accurate field definitions
- Includes Enterprise User extension schema
- Email field configured as required and unique identifier
- Removed Group support as per business requirements

### 2. ServiceProviderConfig Endpoint (`/scim/ServiceProviderConfig`)

**Purpose**: Describes the SCIM service provider's capabilities and configuration.

**Endpoint**: `GET /scim/ServiceProviderConfig`

**Implementation**: `/packages/scim-api/src/handlers/http/serviceProviderConfig/get.ts`

**Response Structure**:

```json
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
  "documentationUri": "https://docs.risksmart.com/scim",
  "patch": { "supported": true },
  "bulk": {
    "supported": true,
    "maxOperations": 1000,
    "maxPayloadSize": 1048576
  },
  "filter": {
    "supported": true,
    "maxResults": 200
  },
  "changePassword": { "supported": false },
  "sort": { "supported": true },
  "etag": { "supported": false },
  "authenticationSchemes": [...]
}
```

**Key Features**:

- Supports PATCH operations for partial updates
- Bulk operations enabled with reasonable limits
- Filter support with pagination
- Multiple authentication schemes (OAuth Bearer Token, HTTP Basic)
- Accurate capability reporting for client configuration

### 3. ResourceTypes Endpoint (`/scim/ResourceTypes`)

**Purpose**: Defines the resource types supported by the SCIM service provider.

**Endpoint**: `GET /scim/ResourceTypes`

**Implementation**: `/packages/scim-api/src/handlers/http/resource-types/get.ts`

**Response Structure**:

```json
[
  {
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ResourceType"],
    "id": "User",
    "name": "User",
    "endpoint": "/Users",
    "description": "User Account",
    "schema": "urn:ietf:params:scim:schemas:core:2.0:User",
    "schemaExtensions": [
      {
        "schema": "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
        "required": false
      }
    ],
    "meta": {
      "location": "/v2/ResourceTypes/User",
      "resourceType": "ResourceType"
    }
  }
]
```

**Key Features**:

- Defines User resource type with proper schema references
- Enterprise User extension marked as optional
- Follows SCIM 2.0 ResourceType schema format
- Excludes Group resource type as per requirements

## Infrastructure Configuration

All discovery endpoints are configured in `/stacks/ScimApiStack.ts`:

```typescript
routes: {
  'GET /scim/Schemas': {
    function: {
      handler: `${handlersDir}/http/schemas/get.handler`,
      functionName: `${stack.stage}-scim-getSchemas`,
      bind: [HASURA_ADMIN_SECRET],
      environment,
    },
  },
  'GET /scim/ServiceProviderConfig': {
    function: {
      handler: `${handlersDir}/http/service-provider-config/get.handler`,
      functionName: `${stack.stage}-scim-getServiceProviderConfig`,
      bind: [HASURA_ADMIN_SECRET],
      environment,
    },
  },
  'GET /scim/ResourceTypes': {
    function: {
      handler: `${handlersDir}/http/resource-types/get.handler`,
      functionName: `${stack.stage}-scim-getResourceTypes`,
      bind: [HASURA_ADMIN_SECRET],
      environment,
    },
  },
}
```

## SCIM 2.0 Compliance

The implementation follows RFC 7643 and RFC 7644 specifications:

### Schema Endpoint Compliance

- ✅ Returns proper SCIM schema URIs
- ✅ Includes all required attributes with correct types
- ✅ Proper mutability and returnability settings
- ✅ Accurate field requirements and constraints

### ServiceProviderConfig Compliance

- ✅ All required configuration attributes present
- ✅ Accurate capability reporting
- ✅ Authentication schemes properly defined
- ✅ Operation limits within reasonable bounds

### ResourceTypes Compliance

- ✅ Follows ResourceType schema structure
- ✅ Proper schema references and extensions
- ✅ Accurate endpoint and description information
- ✅ Meta attributes correctly populated

## Integration with Identity Providers

These discovery endpoints enable seamless integration with:

- **Okta**: Auto-discovery of supported schemas and capabilities
- **Microsoft Entra ID**: Schema validation and configuration
- **Other SCIM 2.0 Clients**: Standards-compliant discovery

## Error Handling

All endpoints include proper error handling:

```typescript
catch (error) {
  console.error('Endpoint error:', error);
  return {
    statusCode: 500,
    headers: { 'Content-Type': 'application/scim+json' },
    body: JSON.stringify({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status: '500',
      detail: 'Internal server error',
    }),
  };
}
```

## Testing

Each endpoint can be tested using:

```bash
# Test Schemas endpoint
curl -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/scim+json" \
     https://scim-api.example.com/scim/Schemas

# Test ServiceProviderConfig endpoint
curl -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/scim+json" \
     https://scim-api.example.com/scim/ServiceProviderConfig

# Test ResourceTypes endpoint
curl -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/scim+json" \
     https://scim-api.example.com/scim/ResourceTypes
```

## Maintenance Notes

- **Schema Updates**: When modifying User schema, update both the main SCIM User endpoints and the Schemas discovery endpoint
- **Capability Changes**: Update ServiceProviderConfig when adding/removing SCIM features
- **Resource Types**: Add new ResourceType entries when supporting additional SCIM resource types
- **Version Compatibility**: Maintain SCIM 2.0 compliance when making changes

## Future Enhancements

Potential improvements for the discovery endpoints:

1. **Dynamic Schema Generation**: Generate schemas from actual database models
2. **Configuration Management**: Make ServiceProviderConfig values configurable per environment
3. **Additional Resource Types**: Support for Group resources if business requirements change
4. **Enhanced Validation**: Add schema validation for SCIM operations using discovery endpoint data

## References

- [RFC 7643 - SCIM Core Schema](https://datatracker.ietf.org/doc/html/rfc7643)
- [RFC 7644 - SCIM Protocol](https://datatracker.ietf.org/doc/html/rfc7644)
- [SCIM 2.0 Specification](http://www.simplecloud.info/)

---

**Implementation Completed**: All three SCIM 2.0 discovery endpoints are now fully implemented and configured according to the SCIM specification and RiskSmart business requirements.
