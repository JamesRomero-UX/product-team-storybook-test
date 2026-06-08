import { KnockFeedProvider, KnockProvider } from '@knocklabs/react';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { getEnv } from '@risksmart-app/components/src/utils/environment';
import type { FC, ReactElement } from 'react';

export const MessagesProvider: FC<{ children: ReactElement }> = ({
  children,
}) => {
  const { user } = useRisksmartUser();

  return (
    <KnockProvider
      apiKey={getEnv('REACT_APP_KNOCK_PUBLIC_API_KEY')}
      userId={user!.userId}
    >
      <KnockFeedProvider
        feedId={getEnv('REACT_APP_KNOCK_FEED_CHANNEL_ID')}
        defaultFeedOptions={{ tenant: user?.orgKey }}
      >
        {children}
      </KnockFeedProvider>
    </KnockProvider>
  );
};
