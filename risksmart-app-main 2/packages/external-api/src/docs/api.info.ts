const appVersioning = `
The API uses versions for each major release, such as \`2025-10-10\`, which includes changes that aren't backward-compatible with previous releases. Upgrading to a new major release can require updates to existing code.
We automatically pin API accounts to the most recent version available from setup. At any time you can override this version using the \`Risksmart-Version\` header in your requests, or upgrade your account's pinned version from Risksmart app.
For information on all API version changes, view our changelog.
`;

const appRateLimiting = `
The RiskSmart API uses a **tier-based** rate limiting system. Each endpoint is assigned a tier based on its operational sensitivity and expected usage pattern.

All limits operate on a **fixed 1-minute window**.

---

### Tier Classification

| Tier | Restriction Level | Endpoint Types |
|------|-------------------|----------------|
| **Tier 1** | Highly restrictive | Authentication, token issuance, security-sensitive endpoints |
| **Tier 2** | Semi-restrictive | Destructive operations (DELETE), administrative actions |
| **Tier 3** | Moderately restrictive | Most write operations (POST, PUT, PATCH) |
| **Tier 4** | Least restrictive | Read-heavy endpoints (GET, list, search) |

> Tiers are **automatically assigned per endpoint** and cannot be changed by consumers.

---

### Rate Enforcement

* Rate limits reset **every minute**
* Exceeding a tier limit returns **\`429 Too Many Requests\`**
* Clients should treat this as a **temporary busy state**
* Implement **retry logic with backoff**

---

### Rate Limit Values

Limits are defined by the **active rate profile** assigned to your account.

#### Example tier profile

| Tier | Requests / Minute |
|------|------------------|
| Tier 1 | 10 |
| Tier 2 | 60 |
| Tier 3 | 300 |
| Tier 4 | 1500 |

---

### Updating Your Limits

Consumers **cannot modify** rate limits directly.

To request changes:

* Contact RiskSmart support
* Share expected traffic patterns
* Provide any use case insights

Requests are reviewed and actioned by the RiskSmart team.

---

### Rate Limit Headers

The API returns rate limit metadata in **response headers** to help clients track usage.

### Successful Requests

When a request is allowed, the following headers are returned:

| Header | Description |
|--------|-------------|
| \`X-RateLimit-Consumed\` | Number of points consumed by the current request |
| \`X-RateLimit-Remaining\` | Remaining points available in the current 1-minute window |

#### Example
\`\`\`http
X-RateLimit-Consumed: 1
X-RateLimit-Remaining: 299
\`\`\`

---

### Rate Limit Exceeded (429)

When a limit is exceeded, these headers are returned:

| Header | Description |
|--------|-------------|
| \`X-RateLimit-Profile\` | Active profile applied to the request |
| \`X-RateLimit-Remaining\` | Remaining points (usually 0) |
| \`Retry-After\` | Seconds to wait before retrying |

#### Example
\`\`\`http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Profile: cruise
X-RateLimit-Remaining: 0
Retry-After: 12
\`\`\`

Clients **must respect \`Retry-After\`** before retrying.

---

### Best Practices

* Track remaining points using headers
* Implement exponential backoff
* Avoid aggressive retries
* Log 429 responses for monitoring

Persistent abuse may result in blocking.
`;

export const appDescription = `
Comprehensive REST API for RiskSmart risk management and compliance platform.

This API provides endpoints for managing risks, controls, actions, issues, policies, and other governance 
activities in an enterprise risk management system.

## Authentication
All endpoints require JWT token authentication obtained from the \`/v1/auth/token\` endpoint.

## Versioning
${appVersioning}

## Rate Limiting
${appRateLimiting}

## Pagination
List endpoints use cursor-based pagination for optimal performance and consistency.
- \`page_size\`: Maximum number of items to return (default: 250, max: 250)
- \`start_after\`: Cursor for next page - use the after cursor found in the response \`/pageInfo/\`.
- \`ending_before\`: Cursor for previous page - use the before cursor found in the response \`/pageInfo/\`.
`;

export const appTitle = 'RiskSmart API';
