import axios from 'axios';

interface Event {
  user: {
    user_id: string;
    email: string;
  };
  connection: { id: string; name: string; strategy: string };
  tenant: { id: string };
  secrets: {
    HASURA_TENANT_API_ENDPOINT: string;
    HASURA_ADMIN_SECRET: string;
    DEV_TENANT_ID?: string;
    AUTH0_DOMAIN: string;
    AUTH0_MANAGEMENT_CLIENT_ID: string;
    AUTH0_MANAGEMENT_CLIENT_SECRET: string;
  };
}

interface Auth0TokenResponse {
  access_token: string;
  token_type: string;
}

interface Auth0UserResponse {
  app_metadata?: Record<string, unknown>;
}

const getManagementApiToken = async (event: Event): Promise<string> => {
  const response = await axios.post<Auth0TokenResponse>(
    `https://${event.secrets.AUTH0_DOMAIN}/oauth/token`,
    {
      grant_type: 'client_credentials',
      client_id: event.secrets.AUTH0_MANAGEMENT_CLIENT_ID,
      client_secret: event.secrets.AUTH0_MANAGEMENT_CLIENT_SECRET,
      audience: `https://${event.secrets.AUTH0_DOMAIN}/api/v2/`,
    }
  );

  return response.data.access_token;
};

const getUserAppMetadata = async (
  event: Event,
  accessToken: string
): Promise<Record<string, unknown> | undefined> => {
  const response = await axios.get<Auth0UserResponse>(
    `https://${event.secrets.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(event.user.user_id)}`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      params: {
        fields: 'app_metadata',
        include_fields: 'true',
      },
    }
  );

  return response.data.app_metadata;
};

/**
 * Handler that will be called during the execution of a PostChangePassword flow.
 *
 * Updates the PasswordSetAtTimestamp field on the third_party_contact record so the
 * contact transitions from "pending" to "active" without needing a full login.
 */
export const onExecutePostChangePassword = async (event: Event) => {
  console.log(
    `PostChangePassword triggered for user ${event.user.user_id} (${event.user.email})`
  );

  // Only relevant for third-party contacts setting their initial password
  if (event.connection.name !== 'Username-Password-ThirdParty') {
    console.log(
      `Skipping: connection "${event.connection.name}" is not Username-Password-ThirdParty`
    );

    return;
  }

  // app_metadata is not available on the PostChangePassword event, so we
  // fetch it via the Auth0 Management API.
  const accessToken = await getManagementApiToken(event);
  const appMetadata = await getUserAppMetadata(event, accessToken);

  const rawTenants = appMetadata?.third_party_tenants;
  const tenants = Array.isArray(rawTenants)
    ? rawTenants.filter((t): t is string => typeof t === 'string')
    : [];

  if (tenants.length === 0) {
    console.log('No third_party_tenants found in app_metadata, skipping.');

    return;
  }

  const endpoint = event.secrets.HASURA_TENANT_API_ENDPOINT + '/v1/graphql';

  const mutation = `
    mutation UpdateContactPasswordSetAtTimestamp($Email: String!) {
      update_third_party_contact(
        where: { Email: { _eq: $Email } }
        _set: { PasswordSetAtTimestamp: "now()", ModifiedAtTimestamp: "now()" }
      ) { affected_rows }
    }
  `;

  for (const tenant of tenants) {
    console.log(
      `Updating PasswordSetAtTimestamp for user ${event.user.user_id} in tenant ${tenant}`
    );

    try {
      const response = await axios.post(
        endpoint,
        { query: mutation, variables: { Email: event.user.email } },
        {
          headers: {
            'content-type': 'application/json',
            'x-hasura-admin-secret': event.secrets.HASURA_ADMIN_SECRET,
            'x-tenant-name': tenant,
          },
        }
      );
      console.log(
        `Successfully updated PasswordSetAtTimestamp in ${tenant}, affected rows: ${response.data?.data?.update_third_party_contact?.affected_rows}`
      );
    } catch (error) {
      console.error(
        `Failed to update PasswordSetAtTimestamp for user ${event.user.user_id} in tenant ${tenant}:`,
        error
      );
      throw error;
    }
  }
};
