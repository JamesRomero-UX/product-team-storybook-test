import { useEffect, useRef } from 'react';

import { useChatSocketStore } from './useChatSocketStore';

export interface ChatSocketInitializerOptions {
  isAuthenticated: boolean;
  isChatFeatureEnabled: boolean;
  getAccessToken: () => Promise<string>;
}

/**
 * Hook to initialize and manage the chat socket connection lifecycle.
 * Should be called once at the app/layout level.
 *
 * This hook triggers connection/disconnection based on external auth state.
 * The Zustand store internally manages all socket state and prevents duplicate connections.
 */
export function useChatSocketInitializer({
  isAuthenticated,
  isChatFeatureEnabled,
  getAccessToken,
}: ChatSocketInitializerOptions) {
  const getAccessTokenRef = useRef(getAccessToken);

  // Keep getAccessToken ref updated
  useEffect(() => {
    getAccessTokenRef.current = getAccessToken;
  }, [getAccessToken]);

  // Trigger connection/disconnection when auth state changes
  useEffect(() => {
    const shouldConnect = isAuthenticated && isChatFeatureEnabled;
    const store = useChatSocketStore.getState();

    console.log('[ChatSocketInitializer] Auth state changed:', {
      isAuthenticated,
      isChatFeatureEnabled,
      shouldConnect,
    });

    // Update auth state in store (this will auto-disconnect if not shouldConnect)
    store.updateAuthState(isAuthenticated, isChatFeatureEnabled);

    // Connect if conditions are met
    if (shouldConnect) {
      console.log('[ChatSocketInitializer] Initiating connection...');
      store.connect(getAccessTokenRef.current);
    }
  }, [isAuthenticated, isChatFeatureEnabled]);

  // Cleanup only on component unmount (empty deps = run once on mount, cleanup on unmount)
  useEffect(() => {
    return () => {
      console.log(
        '[ChatSocketInitializer] Component unmounting, disconnecting...'
      );
      useChatSocketStore.getState().disconnect();
    };
  }, []); // Empty deps - only runs on mount/unmount
}
