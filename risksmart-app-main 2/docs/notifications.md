# Notifications

<https://dashboard.knock.app/>

## Setup

The following environment variables need to be setup to receive in app notifications

REACT_APP_KNOCK_PUBLIC_API_KEY - This can be found on the following page for the dev environment - <https://dashboard.knock.app/risksmart/development/developers/api-keys>
REACT_APP_KNOCK_FEED_CHANNEL_ID - This should be set to the in app channel id found here - <https://dashboard.knock.app/risksmart/integrations/channels>

## Information

Notifications are sent either of the back of an postgres/hasura trigger e.g. an record is inserted, updated or deleted, or of the back of the result of a scheduled query.

<https://hasura.io/docs/latest/event-triggers/overview/>

Hasura triggers post database record changes to our rest api, which in turn pushes to event bridge.

<https://aws.amazon.com/eventbridge/>

### In App

In app notification messages are constructed on the client side.
This allows us to use our own taxonomy and translations, as well as not needing to send potentially sensitive information to a third party system.

### Knock Template Data Model Enhancements

Backend triggered (email, slack, etc.) Knock workflows now receive additional context to enable constructing deep links and performing per-recipient routing logic.

New data fields on `workflow.trigger` payload `data` object:

| Field | Type | Description |
|-------|------|-------------|
| `deepLinkBaseUrl` | string | Base URL for constructing RiskSmart deep links. Resolution order: (1) organisation meta `baseUrl`; else (2) `WEB_APP_BASE_URL` or `APP_BASE_URL` env; else (3) stage mapping (`prod`→`https://app.risksmart.link`, `staging`→`https://staging.risksmart.link`, `dev-cloud`→`https://dev-cloud.risksmart.link`); else (4) `http://localhost:3000`. |
| `deepLinkOrgId` | string | Organisation key (same as existing `org_id`). Provided explicitly for clarity in link helpers. |
| `recipientsMeta` | RecipientMeta[] | Full list of recipient objects (id, name, email, collection, optional connection) exposed for template-level iteration or lookup. Mirrors `recipients` but available under `data` for contexts where only `data` is accessible. |

Per-recipient field added on each recipient object:

| Field | Type | Description |
|-------|------|-------------|
| `connection` | string \| undefined | Auth provider connection identifier (e.g. Auth0 connection) for that specific user, if present. Useful when generating single sign-on links or conditional template content. |

#### Example Knock Workflow Payload (simplified)

```json
{
  "actor": { "id": "SYSTEM", "name": "System Message" },
  "recipients": [
    { "id": "orgA-user123", "email": "user@example.com", "connection": "risk-smart-auth0" }
  ],
  "tenant": "ORG_A",
  "data": {
    "org_id": "ORG_A",
    "orgName": "Acme Corp",
    "objectId": "risk-uuid",
    "objectTitle": "Risk: Third Party Outage",
    "deepLinkBaseUrl": "https://staging.risksmart.link",
    "deepLinkOrgId": "ORG_A",
    "recipientsMeta": [
      {
        "id": "orgA-user123",
        "email": "user@example.com",
        "name": "User Example",
        "connection": "risk-smart-auth0"
      }
    ]
  }
}
```

#### Template Usage Examples

Email / Slack body snippets can now safely build hyperlinks:

```handlebars
{{#if data.deepLinkBaseUrl}}
  <a href="{{data.deepLinkBaseUrl}}/org/{{data.deepLinkOrgId}}/risks/{{data.objectId}}?organization={{data.deepLinkOrgId}}{{#each data.recipientsMeta as |r|}}{{#if (eq r.id recipient.id)}}{{#if r.connection}}&connection={{r.connection}}{{/if}}{{/if}}{{/each}}">View in RiskSmart</a>
{{/if}}
```

Or conditional rendering based on a connection value:

```handlebars
{{#if (eq recipient.connection "risk-smart-auth0")}}
  Use your corporate SSO to sign in.
{{else}}
  Use email + password to sign in.
{{/if}}
```

Iterating over `recipientsMeta` or deriving connection for the current recipient:

```handlebars
{{#each data.recipientsMeta as |r|}}
  {{r.name}} ({{r.email}}){{#if r.connection}} - {{r.connection}}{{/if}}
{{/each}}

{{!-- Append connection param only for current recipient (if connection exists) inside a URL --}}
?organization={{data.deepLinkOrgId}}{{#each data.recipientsMeta as |r|}}{{#if (eq r.id recipient.id)}}{{#if r.connection}}&connection={{r.connection}}{{/if}}{{/if}}{{/each}}
```

#### Migration Notes

1. Existing templates can be incrementally updated; absence of `deepLinkBaseUrl` is no longer a concern because the backend always supplies a default.
2. Prefer `deepLinkBaseUrl` over hardcoding environment-specific hostnames inside templates.
3. Use `deepLinkOrgId` instead of repurposing `org_id` when the intent is clearly link construction (keeps future schema evolutions simpler).
4. Use `data.recipientsMeta` when the templating context does not expose the top-level `recipients` array, or when you need deterministic access within partials limited to `data`.

#### Future Enhancements (Potential)

* Provide prebuilt `deepLinks` object (e.g. `deepLinks.object`, `deepLinks.parent`) if multiple templates require consistent path patterns.
* Add signed link tokens if required for passwordless deep linking.
* Add signed link tokens if required for passwordless deep linking.


