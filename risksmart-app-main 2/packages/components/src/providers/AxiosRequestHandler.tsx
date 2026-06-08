import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { Context, FC } from 'react';
import { useEffect } from 'react';

import {
  useAxiosStore,
  useInterceptAxiosResponsesWithSentry,
} from '../hooks/useAxios';
import useRisksmartUser from '../hooks/useRisksmartUser';

interface Props {
  authContext?: Context<Auth0ContextInterface>;
}

export const AxiosRequestHandler: FC<Props> = ({ authContext }) => {
  useInterceptAxiosResponsesWithSentry();
  const { authorisedAxiosInstance } = useAxiosStore();

  const { getAccessTokenSilently } = useRisksmartUser(authContext);

  useEffect(() => {
    const interceptorId = authorisedAxiosInstance.interceptors.request.use(
      async function (config) {
        const token = await getAccessTokenSilently();
        config.headers['Authorization'] = `Bearer ${token}`;

        return config;
      }
    );

    return () => {
      authorisedAxiosInstance.interceptors.request.eject(interceptorId);
    };
  }, [getAccessTokenSilently, authorisedAxiosInstance]);

  return <></>;
};
