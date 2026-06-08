import { useKnockFeed } from '@knocklabs/react';
import type { FC, ReactElement } from 'react';
import { useEffect } from 'react';

export const MessagesRequester: FC<{ children: ReactElement }> = ({
  children,
}) => {
  const { feedClient } = useKnockFeed();
  useEffect(() => {
    feedClient.fetch();
  }, [feedClient]);

  return children;
};
