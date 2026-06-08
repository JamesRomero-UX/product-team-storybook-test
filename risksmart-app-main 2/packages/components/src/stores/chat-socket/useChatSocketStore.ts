import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { createConnectionManager } from './services/connectionManager';
import { createSessionManagement } from './services/sessionManagement';
import { createSocketConnection } from './services/socketConnection';
import type {
  ConnectionManagerService,
  SessionManagementService,
  SocketConnectionService,
} from './types';

/**
 * ChatSocket Zustand Store
 *
 * Composed from multiple focused services for maintainability.
 * Manages Socket.IO connection state for the AI chat service.
 *
 * Architecture:
 * - SocketConnectionService: Core socket state
 * - SessionManagementService: Chat session handling
 * - ConnectionManagerService: Connection lifecycle & auth
 *
 * Usage:
 * - useChatSocket() - Get full store
 * - useChatSocketOnly() - Get just the socket (minimizes re-renders)
 * - useChatSocketConnected() - Get just connection status
 * - useChatSocketSession() - Get session management functions
 */

export type ChatSocketStore = SocketConnectionService &
  SessionManagementService &
  ConnectionManagerService;

export const useChatSocketStore = create<ChatSocketStore>()((...args) => ({
  ...createSocketConnection(...args),
  ...createSessionManagement(...args),
  ...createConnectionManager(...args),
}));

// Main hook - use this for all socket functionality
export const useChatSocket = () => useChatSocketStore();

// Convenience hooks for specific state slices to minimize re-renders
export const useChatSocketOnly = () =>
  useChatSocketStore((state) => state.socket);

export const useChatSocketConnected = () =>
  useChatSocketStore((state) => ({
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
  }));

export const useChatSocketSession = () =>
  useChatSocketStore((state) => ({
    activeSession: state.activeSession,
    hasJoined: state.hasJoined,
    setActiveSession: state.setActiveSession,
    getActiveSession: state.getActiveSession,
    markSessionJoined: state.markSessionJoined,
  }));

export const useChatSocketConnection = () =>
  useChatSocketStore((state) => ({
    connect: state.connect,
    disconnect: state.disconnect,
    updateAuthState: state.updateAuthState,
    reset: state.reset,
    isAuthenticated: state.isAuthenticated,
    isChatFeatureEnabled: state.isChatFeatureEnabled,
  }));

// Stable selector for methods only (won't cause re-renders)
// Uses shallow equality to prevent unnecessary re-renders
export const useChatSocketActions = () =>
  useChatSocketStore(
    useShallow((state) => ({
      connect: state.connect,
      disconnect: state.disconnect,
      updateAuthState: state.updateAuthState,
      reset: state.reset,
      setActiveSession: state.setActiveSession,
      markSessionJoined: state.markSessionJoined,
    }))
  );
