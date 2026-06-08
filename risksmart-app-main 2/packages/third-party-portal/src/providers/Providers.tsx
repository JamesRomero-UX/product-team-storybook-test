import '@cloudscape-design/global-styles/index.css';

import { NotificationProvider } from '@risksmart-app/components/src/notifications/NotificationProvider';
import { AxiosRequestHandler } from '@risksmart-app/components/src/providers/AxiosRequestHandler';
import type { FC } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Outlet } from 'react-router';
import ApolloGraphqlProvider from 'src/data/ApolloGraphqlProvider';

import { AuthProvider } from './AuthProvider';
import { ThirdPartyAuth0Context } from './ThirdPartyAuth0Context';

const Providers: FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <NotificationProvider>
          <ApolloGraphqlProvider>
            <AxiosRequestHandler authContext={ThirdPartyAuth0Context} />
            <Outlet />
          </ApolloGraphqlProvider>
        </NotificationProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default Providers;
