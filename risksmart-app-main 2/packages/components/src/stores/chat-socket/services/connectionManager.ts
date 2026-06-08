import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { StateCreator } from 'zustand';

import { getEnv } from '../../../utils/environment';
import type {
  ConnectionManagerService,
  SessionManagementService,
  SocketConnectionService,
} from '../types';

export const createConnectionManager: StateCreator<
  ConnectionManagerService & SocketConnectionService & SessionManagementService,
  [],
  [],
  ConnectionManagerService
> = (set, get) => ({
  // State
  isAuthenticated: false,
  isChatFeatureEnabled: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  _getAccessToken: null,

  // Public API
  updateAuthState: (isAuthenticated, isChatFeatureEnabled) => {
    set({ isAuthenticated, isChatFeatureEnabled });

    // Auto-disconnect if not authenticated
    if (!isAuthenticated || !isChatFeatureEnabled) {
      get().disconnect();
    }
  },

  connect: async (getAccessToken) => {
    const state = get();

    // Store the getAccessToken function for reconnections
    set({ _getAccessToken: getAccessToken });

    if (!state.isAuthenticated || !state.isChatFeatureEnabled) {
      console.log('Cannot connect - not authenticated or feature disabled');

      return;
    }

    if (state.socket?.connected || state.isConnecting) {
      console.log('Already connected or connecting');

      return;
    }

    state._setIsConnecting(true);

    try {
      const chatApiUrl = getEnv('REACT_APP_AI_CHAT_API_URL');
      if (!chatApiUrl) {
        console.warn('REACT_APP_AI_CHAT_API_URL not configured');
        state._setIsConnecting(false);

        return;
      }

      const token = await getAccessToken();
      if (!token) {
        console.error('No authentication token available');
        state._setIsConnecting(false);

        return;
      }

      console.log('Creating socket connection');

      // Disconnect existing socket
      if (state.socket) {
        state.socket.disconnect();
      }

      // Create new socket
      const newSocket = io(chatApiUrl, {
        path: '/ai-engine/chat-api/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      // Set up event handlers
      setupSocketEventHandlers(newSocket, get, set);

      state._setSocket(newSocket);
      state._setIsConnecting(false);
    } catch (error) {
      console.error('Failed to connect socket:', error);
      state._setIsConnecting(false);

      // Auto-retry with exponential backoff
      scheduleReconnection(get);
    }
  },

  disconnect: () => {
    const state = get();
    if (state.socket) {
      console.log('Disconnecting socket');
      state.socket.disconnect();
      state._setSocket(null);
      state._setIsConnected(false);
      state._setIsConnecting(false);
      state._resetSession();
    }
  },

  reset: () => {
    get().disconnect();
    set({
      isAuthenticated: false,
      isChatFeatureEnabled: false,
      reconnectAttempts: 0,
    });
  },

  // Internal
  _incrementReconnectAttempts: () =>
    set((state) => ({
      reconnectAttempts: state.reconnectAttempts + 1,
    })),

  _resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
});

/**
 * Set up socket event handlers
 */
function setupSocketEventHandlers(
  socket: Socket,
  get: () => ConnectionManagerService &
    SocketConnectionService &
    SessionManagementService,
  set: (
    partial:
      | Partial<
          ConnectionManagerService &
            SocketConnectionService &
            SessionManagementService
        >
      | ((
          state: ConnectionManagerService &
            SocketConnectionService &
            SessionManagementService
        ) => Partial<
          ConnectionManagerService &
            SocketConnectionService &
            SessionManagementService
        >)
  ) => void
) {
  socket.on('connect', () => {
    console.log('Socket.IO connected to chat service');
    const state = get();

    state._setIsConnected(true);
    state._resetReconnectAttempts();

    // Rejoin active session if exists
    if (state.activeSession && !state.hasJoined) {
      console.log('Rejoining active session:', state.activeSession.session_id);

      socket.emit('join_conversation', {
        session_id: state.activeSession.session_id,
        user_id: state.activeSession.user_id,
        context: state.activeSession.context,
      });

      socket.once('conversation_joined', (data: Record<string, unknown>) => {
        console.log('Successfully rejoined conversation:', data);
        state.markSessionJoined();
      });
    }
  });

  socket.on('disconnect', (reason: string) => {
    console.log('Socket.IO disconnected:', reason);
    const state = get();

    state._setIsConnected(false);
    set({ hasJoined: false });

    // Auto-reconnect on unexpected disconnection
    if (
      reason !== 'io client disconnect' &&
      state.isAuthenticated &&
      state.isChatFeatureEnabled
    ) {
      scheduleReconnection(get);
    }
  });

  socket.on('connect_error', (error: Error) => {
    console.error('Socket.IO connection error:', error);
    get()._setIsConnected(false);
    scheduleReconnection(get);
  });

  socket.on('auth_error', (error: unknown) => {
    console.error('Socket.IO authentication error:', error);
    scheduleReconnection(get);
  });

  socket.on('error', (error: Error | Record<string, unknown>) => {
    console.error('Socket.IO server error:', error);
  });
}

/**
 * Schedule reconnection with exponential backoff
 */
function scheduleReconnection(
  get: () => ConnectionManagerService &
    SocketConnectionService &
    SessionManagementService
) {
  const state = get();

  if (state.reconnectAttempts >= state.maxReconnectAttempts) {
    console.error('Max reconnection attempts reached');

    return;
  }

  const delay = 1000 * Math.pow(2, state.reconnectAttempts);
  console.log(
    `Scheduling reconnection in ${delay}ms (attempt ${state.reconnectAttempts + 1})`
  );

  setTimeout(async () => {
    state._incrementReconnectAttempts();

    // Attempt to reconnect using stored getAccessToken
    if (state._getAccessToken) {
      await state.connect(state._getAccessToken);
    } else {
      console.error('No getAccessToken function available for reconnection');
    }
  }, delay);
}
