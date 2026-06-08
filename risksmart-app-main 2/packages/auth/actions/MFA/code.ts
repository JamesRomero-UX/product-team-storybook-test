import type { API, Event } from '../../types/post-login';

exports.onExecutePostLogin = async (event: Event, api: API) => {
  const isDev = event.tenant.id === event.secrets?.DEV_TENANT_ID;
  const isDevCloud = event.tenant.id === event.secrets?.DEV_CLOUD_TENANT_ID;
  const isStaging = event.tenant.id === event.secrets?.STAGING_TENANT_ID; // Remove this when MFA is re-enabled in staging

  // Disable MFA for e2e testing pipeline in dev
  if (isDev || isDevCloud || isStaging) {
    api.multifactor.enable('none');

    return;
  }

  // Prevent MFA challenge for refresh tokens
  if (event?.transaction?.protocol === 'oauth2-refresh-token') {
    return;
  }

  // Enforce email MFA for third-party portal client and web client
  if (
    event.connection.name === 'Username-Password-ThirdParty' ||
    event.connection.name === 'Username-Password-Authentication'
  ) {
    api.multifactor.enable('any', { allowRememberBrowser: false });
    api.authentication.challengeWith({ type: 'email' });

    return;
  }

  // Disable MFA for all other clients
  api.multifactor.enable('none');
};
