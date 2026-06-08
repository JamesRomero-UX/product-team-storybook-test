import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export const useCheckNavigationVisibility = (
  parentTypes: ParentType[],
  skip?: boolean
) => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpc = useTRPC();
  const { addNotification } = useNotifications();
  const {
    data: trpcData,
    isLoading: trpcLoading,
    refetch: trpcRefetch,
    error: trpcError,
  } = useQuery({
    ...trpc.frontend.permission.checkNavigationVisibility.queryOptions({
      parentTypes,
    }),
    enabled: trpcEnabled && !skip,
    gcTime: 30 * 60 * 1000, // 30 minutes
    staleTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  // Handle TRPC errors
  useEffect(() => {
    if (trpcEnabled && trpcError) {
      addNotification({
        type: 'error',
        content: <>{trpcError.message}</>,
      });
    }
  }, [trpcEnabled, trpcError, addNotification]);

  if (!trpcEnabled) {
    return {
      loading: false,
      data: parentTypes.map((parentType) => ({ parentType, visible: true })),
      refetch: () => Promise.resolve(),
    };
  }

  return {
    loading: trpcLoading,
    data: trpcData,
    refetch: () => trpcRefetch(),
  };
};
