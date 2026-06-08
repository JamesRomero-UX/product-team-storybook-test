import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { getEnv } from '@risksmart-app/components/src/utils/environment';

function getWorkflowApiUrl(): string {
  let aiWorkflowApiUrl = getEnv('REACT_APP_AI_WORKFLOW_API_URL');

  if (!aiWorkflowApiUrl) {
    throw new Error('Unable to find the URL for the workflow API');
  }

  // Add a trailing slash if it is not included
  if (!/\/$/.test(aiWorkflowApiUrl)) {
    aiWorkflowApiUrl += '/';
  }

  return aiWorkflowApiUrl;
}

/**
 * Wraps the browser fetch API and injects the AI API base URL into the url and
 * adds the authorization header for the logged in user.
 */
export const useAIWorkflowFetch = () => {
  const { getAccessTokenSilently, isAuthenticated } = useRisksmartUser();

  async function getAccessToken(): Promise<string> {
    if (!isAuthenticated) {
      throw new Error(
        'Attempting to run the workflow, but the user is not authenticated'
      );
    }

    return await getAccessTokenSilently();
  }

  // no-dd-sa
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async function authedAIWorkflowFetch(url: string | URL, options: any = {}) {
    const aiWorkflowApiBaseUrl = getWorkflowApiUrl();
    const token = await getAccessToken();
    let uri: URL | null = null;
    // let urlPath: string = url.toString();

    if (url instanceof URL) {
      uri = new URL(url.pathname, aiWorkflowApiBaseUrl);
      uri.search = url.search;
    } else {
      uri = new URL(url, aiWorkflowApiBaseUrl);
    }

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'X-Response-Case': 'camel',
    };

    return await fetch(uri, options);
  }

  return {
    authedAIWorkflowFetch,
  };
};
