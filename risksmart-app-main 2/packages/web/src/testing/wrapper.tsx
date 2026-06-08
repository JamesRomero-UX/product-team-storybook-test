import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { NotificationProvider } from '@risksmart-app/components/src/notifications/NotificationProvider';
import { AnalyticsProvider } from '@risksmart-app/components/src/segment';
import i18n from '@risksmart-app/i18n/src/i18n';
import type { AppRouter } from '@risksmart-app/trpc/routers/router';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient } from '@trpc/client';
import type { FC, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';
import { FeaturesProvider } from 'src/rbac/FeatureProvider';
import { PermissionsProvider } from 'src/rbac/PermissionProvider';
import { getQueryClient, TRPCProvider } from 'src/utils/trpc';

export type Providers =
  | 'analytics'
  | 'dashboardFilter'
  | 'features'
  | 'graphql'
  | 'help'
  | 'i18n'
  | 'notification'
  | 'permission'
  | 'router'
  | 'trpc'
  | 'customisableFormData';

export const defaultFormProviders: Providers[] = [
  'trpc',
  'graphql',
  'permission',
  'notification',
  'router',
  'i18n',
];
export const defaultFormProvidersWithFeatures: Providers[] = [
  ...defaultFormProviders,
  'features',
];

export const getWrapper = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mocks: readonly MockedResponse<Record<string, any>, Record<string, any>>[],
  ...providers: Providers[]
) => {
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
    let content = children;

    if (providers.includes('features')) {
      content = <FeaturesProvider>{content}</FeaturesProvider>;
    }

    if (providers.includes('trpc')) {
      const trpcClient = createTRPCClient<AppRouter>({
        links: [],
      });
      const queryClient = getQueryClient();
      content = (
        <QueryClientProvider client={queryClient}>
          <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
            {content}
          </TRPCProvider>
        </QueryClientProvider>
      );
    }

    if (providers.includes('permission')) {
      content = <PermissionsProvider>{content}</PermissionsProvider>;
    }

    if (providers.includes('notification')) {
      content = <NotificationProvider>{content}</NotificationProvider>;
    }

    if (providers.includes('graphql')) {
      content = <MockedProvider mocks={mocks}>{content}</MockedProvider>;
    }

    if (providers.includes('i18n')) {
      content = (
        <I18nextProvider i18n={i18n} defaultNS={'common'}>
          {content}
        </I18nextProvider>
      );
    }

    if (providers.includes('router')) {
      content = <MemoryRouter>{content}</MemoryRouter>;
    }

    if (providers.includes('analytics')) {
      content = (
        <AnalyticsProvider writeKey={''} amplitudeKey={''}>
          {content}
        </AnalyticsProvider>
      );
    }

    return content;
  };

  return Wrapper;
};
