import { useAxiosStore } from '@risksmart-app/components/src/hooks/useAxios';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { getEnv } from '@risksmart-app/components/src/utils/environment';

const scopes = ['chat:write'];
const redirectUri =
  window.location.hostname === 'localhost'
    ? 'https://redirectmeto.com/http://localhost:3000/slack-callback' // hacky workaround for slack redirect on localhost
    : window.location.origin + '/slack-callback';
const NONCE_STORAGE_KEY = 'slack-oauth-nonce';

// Generate a random nonce value for the OAuth state parameter.
function generateNonce() {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';
  const result: string[] = [];
  window.crypto
    .getRandomValues(new Uint8Array(32))
    .forEach((c) => result.push(charset[c % charset.length]));

  return result.join('');
}

/*
 * useSlack hook provides functions to connect/disconnect Slack from Knock.
 */
export const useSlack = () => {
  const { authorisedAxiosInstance } = useAxiosStore();
  const { addNotification } = useNotifications();

  /*
   * This function opens a new window to Slack's OAuth flow.
   */
  const loginWithSlack = () => {
    // Generate a random nonce value for the OAuth state parameter.
    const state = generateNonce();
    const slackClientId: string | undefined = getEnv(
      'REACT_APP_SLACK_CLIENT_ID',
      true
    );

    if (!slackClientId) {
      addNotification({
        content: 'Failed to launch slack login. Client ID not set',
        type: 'error',
      });

      return Promise.reject();
    }

    sessionStorage.setItem(NONCE_STORAGE_KEY, state);

    const openedWindow = window.open(
      `https://slack.com/oauth/v2/authorize?scope=${scopes.join(
        ','
      )}&client_id=${slackClientId}&redirect_uri=${redirectUri}&state=${state}`
    );

    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (openedWindow?.closed) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });
  };

  /*
   * This function exchanges the code provided by Slack and connects Slack to Knock.
   */
  const exchangeSlackCode = async (code: string, state: string) => {
    const storedState = sessionStorage.getItem(NONCE_STORAGE_KEY);
    sessionStorage.removeItem(NONCE_STORAGE_KEY);
    if (state !== storedState) {
      throw new Error('Invalid state');
    }

    try {
      await authorisedAxiosInstance.post('/slack/callback', { code, state });

      return true;
    } catch {
      return false;
    }
  };

  return { loginWithSlack, exchangeSlackCode };
};
