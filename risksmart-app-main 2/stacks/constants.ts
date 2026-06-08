export const RISKSMART_REGION_PREFIX = process.env.RESOURCE_PREFIX ?? ''
export const DOMAIN_NAME_PREFIX = process.env.DOMAIN_NAME_PREFIX ?? ''
export const TABLE_NAME_IDEMPOTENCY = `${RISKSMART_REGION_PREFIX}IdempotencyNotificationCheck`;
export const TABLE_NAME_SCIM_API_KEYS_V2 = `${RISKSMART_REGION_PREFIX}ScimApiKeys`; // This is the newer version of Scim.
export const TABLE_NAME_SCIM_API_AUTH_V1 = `${RISKSMART_REGION_PREFIX}ScimApiAuth`; // This is the older version of Scim, some customers still use it.