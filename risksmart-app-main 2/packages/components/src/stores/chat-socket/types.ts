import type { Socket } from 'socket.io-client';

/**
 * Active chat session data
 */
export interface ActiveSession {
  session_id: string;
  user_id: string;
  context: Record<string, unknown>;
}

/**
 * Socket Connection Service
 * Handles the core socket connection state
 */
export interface SocketConnectionService {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;

  // Internal actions (used by other services)
  _setSocket: (socket: Socket | null) => void;
  _setIsConnected: (connected: boolean) => void;
  _setIsConnecting: (connecting: boolean) => void;
}

/**
 * Session Management Service
 * Handles active chat sessions and rejoining logic
 */
export interface SessionManagementService {
  activeSession: ActiveSession | null;
  hasJoined: boolean;

  // Public API
  setActiveSession: (session: ActiveSession | null) => void;
  getActiveSession: () => ActiveSession | null;
  markSessionJoined: () => void;

  // Internal actions
  _resetSession: () => void;
}

/**
 * Connection Manager Service
 * Handles socket connection lifecycle, authentication, and reconnection
 */
export interface ConnectionManagerService {
  // Config state
  isAuthenticated: boolean;
  isChatFeatureEnabled: boolean;

  // Reconnection state
  reconnectAttempts: number;
  maxReconnectAttempts: number;

  // Public API
  connect: (getAccessToken: () => Promise<string>) => Promise<void>;
  disconnect: () => void;
  updateAuthState: (
    isAuthenticated: boolean,
    isChatFeatureEnabled: boolean
  ) => void;
  reset: () => void;

  // Internal
  _getAccessToken: (() => Promise<string>) | null;
  _incrementReconnectAttempts: () => void;
  _resetReconnectAttempts: () => void;
}
