interface ExchangeEvent {
  client: { client_id: string; metadata: { org_id: string; tenant: string } };
}

interface CredentialsExchangeAPI {
  accessToken: {
    setCustomClaim: (claimKey: string, claimValue: unknown) => void;
  };
}

exports.onExecuteCredentialsExchange = async (
  event: ExchangeEvent,
  api: CredentialsExchangeAPI
) => {
  setClaims(event, api);
};

function setClaims(event: ExchangeEvent, api: CredentialsExchangeAPI) {
  console.log('Setting M2M claims');

  if (!event.client.metadata.org_id) {
    console.log(
      'No client metadata available, skipping claims as presuming this is not a customer M2M client'
    );

    return;
  }

  const namespace = 'claims';
  const namespaceHasura = 'https://hasura.io/jwt/claims';

  const tenant = (event.client.metadata || {}).tenant || 'MultiTenant';

  //TODO: Create new role for the API
  const role = 'RiskManager';

  const hasuraClaims = {
    'x-hasura-default-role': role,
    'x-hasura-allowed-roles': [role],
    'x-hasura-user-id': event.client.client_id,
    'x-hasura-org-id': event.client.metadata.org_id,
    'x-hasura-tenant-name': tenant,
  };

  api.accessToken.setCustomClaim(namespaceHasura, hasuraClaims);
  api.accessToken.setCustomClaim(`${namespace}_roles`, [role]);
}
