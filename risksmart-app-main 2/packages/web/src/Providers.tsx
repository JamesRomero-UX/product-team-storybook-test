import '@cloudscape-design/global-styles/index.css';

import { NotificationProvider } from '@risksmart-app/components/src/notifications/NotificationProvider';
import { AxiosRequestHandler } from '@risksmart-app/components/src/providers/AxiosRequestHandler';
import {
  AnalyticsProvider,
  AnalyticsUserProvider,
} from '@risksmart-app/components/src/segment';
import { getEnv } from '@risksmart-app/components/src/utils/environment';
import type { FC } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Outlet } from 'react-router';

import { AuthProvider } from './AuthProvider';
import IdleSessionTimeout from './components/idle-timer/IdleSessionTimeout';
import UpdatePrompt from './components/update-prompt';
import ApolloGraphqlProvider from './data/ApolloGraphqlProvider';
import { TrpcProvider } from './providers/TrpcProvider';

function GetSegmentId() {
  return getEnv('REACT_APP_SEGMENT_KEY');
}

function GetAmplitudeId() {
  return getEnv('REACT_APP_AMPLITUDE_API_KEY');
}

const Providers: FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AnalyticsProvider
          writeKey={GetSegmentId()}
          amplitudeKey={GetAmplitudeId()}
        >
          <TrpcProvider>
            <AnalyticsUserProvider>
              <NotificationProvider>
                <ApolloGraphqlProvider>
                  <AxiosRequestHandler />
                  <Outlet />
                  <UpdatePrompt />
                  <IdleSessionTimeout />
                </ApolloGraphqlProvider>
              </NotificationProvider>
            </AnalyticsUserProvider>
          </TrpcProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default Providers;
