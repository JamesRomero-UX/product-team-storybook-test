import { act, renderHook } from '@testing-library/react';
import type { Socket } from 'socket.io-client';
import { vi } from 'vitest';

// Mock socket.io-client - define everything inside factory to avoid hoisting issues
vi.mock('socket.io-client', () => {
  const createMockSocket = (): Socket => {
    const mockSocket = {
      connected: false,
      id: 'mock-socket-id',
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
      connect: vi.fn(),
    } as unknown as Socket;

    return mockSocket;
  };

  return {
    io: vi.fn(() => createMockSocket()),
  };
});

// Mock environment
vi.mock('../../utils/environment', () => ({
  getEnv: vi.fn((key: string) => {
    if (key === 'REACT_APP_AI_CHAT_API_URL') {
      return 'http://localhost:8427';
    }

    return undefined;
  }),
}));

import { io } from 'socket.io-client';

import { useChatSocketStore } from './useChatSocketStore';

// Get mocked io for assertions
const mockIo = vi.mocked(io);

// Helper to create mock sockets in tests
const createMockSocket = (): Socket => {
  return {
    connected: false,
    id: 'mock-socket-id',
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
  } as unknown as Socket;
};

describe('useChatSocketStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store to initial state
    act(() => {
      useChatSocketStore.getState().reset();
    });
  });

  describe('Socket Connection Service', () => {
    it('should initialize with default socket state', () => {
      const { result } = renderHook(() => useChatSocketStore());

      expect(result.current.socket).toBe(null);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
    });

    it('should update socket state', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockSocket = createMockSocket();

      act(() => {
        result.current._setSocket(mockSocket);
        result.current._setIsConnected(true);
        result.current._setIsConnecting(false);
      });

      expect(result.current.socket).toBe(mockSocket);
      expect(result.current.isConnected).toBe(true);
      expect(result.current.isConnecting).toBe(false);
    });
  });

  describe('Session Management Service', () => {
    it('should initialize with no active session', () => {
      const { result } = renderHook(() => useChatSocketStore());

      expect(result.current.activeSession).toBe(null);
      expect(result.current.hasJoined).toBe(false);
    });

    it('should set and get active session', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const testSession = {
        session_id: 'test-session-123',
        user_id: 'user-456',
        context: { source: 'test' },
      };

      act(() => {
        result.current.setActiveSession(testSession);
      });

      expect(result.current.activeSession).toEqual(testSession);
      expect(result.current.getActiveSession()).toEqual(testSession);
      expect(result.current.hasJoined).toBe(false);
    });

    it('should mark session as joined', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const testSession = {
        session_id: 'test-session-123',
        user_id: 'user-456',
        context: { source: 'test' },
      };

      act(() => {
        result.current.setActiveSession(testSession);
        result.current.markSessionJoined();
      });

      expect(result.current.hasJoined).toBe(true);
    });

    it('should reset session', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const testSession = {
        session_id: 'test-session-123',
        user_id: 'user-456',
        context: { source: 'test' },
      };

      act(() => {
        result.current.setActiveSession(testSession);
        result.current.markSessionJoined();
      });

      expect(result.current.activeSession).toEqual(testSession);
      expect(result.current.hasJoined).toBe(true);

      act(() => {
        result.current._resetSession();
      });

      expect(result.current.activeSession).toBe(null);
      expect(result.current.hasJoined).toBe(false);
    });

    it('should clear session by setting to null', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const testSession = {
        session_id: 'test-session-123',
        user_id: 'user-456',
        context: { source: 'test' },
      };

      act(() => {
        result.current.setActiveSession(testSession);
      });

      expect(result.current.activeSession).toEqual(testSession);

      act(() => {
        result.current.setActiveSession(null);
      });

      expect(result.current.activeSession).toBe(null);
      expect(result.current.getActiveSession()).toBe(null);
    });
  });

  describe('Connection Manager Service', () => {
    it('should initialize with default auth state', () => {
      const { result } = renderHook(() => useChatSocketStore());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isChatFeatureEnabled).toBe(false);
      expect(result.current.reconnectAttempts).toBe(0);
      expect(result.current.maxReconnectAttempts).toBe(5);
    });

    it('should update auth state', () => {
      const { result } = renderHook(() => useChatSocketStore());

      act(() => {
        result.current.updateAuthState(true, true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isChatFeatureEnabled).toBe(true);
    });

    it('should not connect when not authenticated', async () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockGetToken = vi.fn().mockResolvedValue('test-token');

      act(() => {
        result.current.updateAuthState(false, true);
      });

      await act(async () => {
        await result.current.connect(mockGetToken);
      });

      expect(mockIo).not.toHaveBeenCalled();
      expect(result.current.isConnecting).toBe(false);
    });

    it('should not connect when feature is disabled', async () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockGetToken = vi.fn().mockResolvedValue('test-token');

      act(() => {
        result.current.updateAuthState(true, false);
      });

      await act(async () => {
        await result.current.connect(mockGetToken);
      });

      expect(mockIo).not.toHaveBeenCalled();
      expect(result.current.isConnecting).toBe(false);
    });

    it('should create socket connection', async () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockGetToken = vi.fn().mockResolvedValue('test-token');
      const mockSocket = createMockSocket();

      // Mock io to return our specific socket instance
      mockIo.mockReturnValueOnce(mockSocket);

      act(() => {
        result.current.updateAuthState(true, true);
      });

      await act(async () => {
        await result.current.connect(mockGetToken);
      });

      expect(mockGetToken).toHaveBeenCalled();
      expect(mockIo).toHaveBeenCalledWith('http://localhost:8427', {
        path: '/ai-engine/chat-api/socket.io',
        auth: { token: 'test-token' },
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });
      expect(result.current.socket).toBe(mockSocket);
    });

    it('should not connect if already connected', async () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockGetToken = vi.fn().mockResolvedValue('test-token');
      const mockSocket = createMockSocket();

      act(() => {
        result.current.updateAuthState(true, true);
        result.current._setSocket({ ...mockSocket, connected: true } as Socket);
      });

      await act(async () => {
        await result.current.connect(mockGetToken);
      });

      expect(mockGetToken).not.toHaveBeenCalled();
      expect(mockIo).not.toHaveBeenCalled();
    });

    it('should not connect if already connecting', async () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockGetToken = vi.fn().mockResolvedValue('test-token');

      act(() => {
        result.current.updateAuthState(true, true);
        result.current._setIsConnecting(true);
      });

      await act(async () => {
        await result.current.connect(mockGetToken);
      });

      expect(mockGetToken).not.toHaveBeenCalled();
      expect(mockIo).not.toHaveBeenCalled();
    });

    it('should disconnect socket', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockSocket = createMockSocket();
      const testSession = {
        session_id: 'test-session-123',
        user_id: 'user-456',
        context: { source: 'test' },
      };

      act(() => {
        result.current._setSocket(mockSocket);
        result.current._setIsConnected(true);
        result.current.setActiveSession(testSession);
      });

      expect(result.current.socket).toBe(mockSocket);
      expect(result.current.isConnected).toBe(true);
      expect(result.current.activeSession).toEqual(testSession);

      act(() => {
        result.current.disconnect();
      });

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(result.current.socket).toBe(null);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.activeSession).toBe(null);
    });

    it('should handle disconnect when no socket exists', () => {
      const { result } = renderHook(() => useChatSocketStore());

      // Should not throw error
      act(() => {
        result.current.disconnect();
      });

      expect(result.current.socket).toBe(null);
    });

    it('should reset all state', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockSocket = createMockSocket();
      const testSession = {
        session_id: 'test-session-123',
        user_id: 'user-456',
        context: { source: 'test' },
      };

      act(() => {
        result.current._setSocket(mockSocket);
        result.current._setIsConnected(true);
        result.current.updateAuthState(true, true);
        result.current.setActiveSession(testSession);
        result.current._incrementReconnectAttempts();
        result.current._incrementReconnectAttempts();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.reconnectAttempts).toBe(2);

      act(() => {
        result.current.reset();
      });

      expect(result.current.socket).toBe(null);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isChatFeatureEnabled).toBe(false);
      expect(result.current.reconnectAttempts).toBe(0);
      expect(result.current.activeSession).toBe(null);
    });

    it('should increment reconnect attempts', () => {
      const { result } = renderHook(() => useChatSocketStore());

      expect(result.current.reconnectAttempts).toBe(0);

      act(() => {
        result.current._incrementReconnectAttempts();
      });

      expect(result.current.reconnectAttempts).toBe(1);

      act(() => {
        result.current._incrementReconnectAttempts();
        result.current._incrementReconnectAttempts();
      });

      expect(result.current.reconnectAttempts).toBe(3);
    });

    it('should reset reconnect attempts', () => {
      const { result } = renderHook(() => useChatSocketStore());

      act(() => {
        result.current._incrementReconnectAttempts();
        result.current._incrementReconnectAttempts();
        result.current._incrementReconnectAttempts();
      });

      expect(result.current.reconnectAttempts).toBe(3);

      act(() => {
        result.current._resetReconnectAttempts();
      });

      expect(result.current.reconnectAttempts).toBe(0);
    });

    it('should auto-disconnect when auth state becomes false', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockSocket = createMockSocket();

      act(() => {
        result.current._setSocket(mockSocket);
        result.current._setIsConnected(true);
        result.current.updateAuthState(true, true);
      });

      expect(result.current.socket).toBe(mockSocket);

      act(() => {
        result.current.updateAuthState(false, true);
      });

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(result.current.socket).toBe(null);
    });

    it('should auto-disconnect when feature becomes disabled', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockSocket = createMockSocket();

      act(() => {
        result.current._setSocket(mockSocket);
        result.current._setIsConnected(true);
        result.current.updateAuthState(true, true);
      });

      expect(result.current.socket).toBe(mockSocket);

      act(() => {
        result.current.updateAuthState(true, false);
      });

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(result.current.socket).toBe(null);
    });

    it('should handle connection error gracefully', async () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockGetToken = vi
        .fn()
        .mockRejectedValue(new Error('Token fetch failed'));

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty - suppressing error output in test
      });

      act(() => {
        result.current.updateAuthState(true, true);
      });

      await act(async () => {
        await result.current.connect(mockGetToken);
      });

      expect(result.current.isConnecting).toBe(false);
      expect(result.current.socket).toBe(null);

      consoleSpy.mockRestore();
    });

    it('should handle missing auth token', async () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockGetToken = vi.fn().mockResolvedValue(null);

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty - suppressing error output in test
      });

      act(() => {
        result.current.updateAuthState(true, true);
      });

      await act(async () => {
        await result.current.connect(mockGetToken);
      });

      // Need to wait for async state update
      await vi.waitFor(() => {
        expect(result.current.isConnecting).toBe(false);
      });

      expect(mockIo).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Convenience Selectors', () => {
    it('should select only socket', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockSocket = createMockSocket();

      act(() => {
        result.current._setSocket(mockSocket);
      });

      const socketOnly = useChatSocketStore.getState();
      expect(socketOnly.socket).toBe(mockSocket);
    });

    it('should select connection state', () => {
      const { result } = renderHook(() => useChatSocketStore());

      act(() => {
        result.current._setIsConnected(true);
      });

      expect(useChatSocketStore.getState().isConnected).toBe(true);
    });

    it('should select session state', () => {
      const { result } = renderHook(() => useChatSocketStore());
      const testSession = {
        session_id: 'test-session-123',
        user_id: 'user-456',
        context: { source: 'test' },
      };

      act(() => {
        result.current.setActiveSession(testSession);
      });

      const state = useChatSocketStore.getState();
      expect(state.activeSession).toEqual(testSession);
    });
  });

  describe('Integration - Full Connection Flow', () => {
    it('should handle complete connection lifecycle', async () => {
      const { result } = renderHook(() => useChatSocketStore());
      const mockGetToken = vi.fn().mockResolvedValue('test-token');
      const mockSocket = createMockSocket();

      // Mock io to return our specific socket instance
      mockIo.mockReturnValueOnce(mockSocket);

      // Initial state
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.socket).toBe(null);

      // Update auth
      act(() => {
        result.current.updateAuthState(true, true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isChatFeatureEnabled).toBe(true);

      // Connect
      await act(async () => {
        await result.current.connect(mockGetToken);
      });

      expect(result.current.socket).toBe(mockSocket);
      expect(mockIo).toHaveBeenCalledWith('http://localhost:8427', {
        path: '/ai-engine/chat-api/socket.io',
        auth: { token: 'test-token' },
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      // Set active session
      const testSession = {
        session_id: 'test-session-123',
        user_id: 'user-456',
        context: { source: 'test' },
      };

      act(() => {
        result.current.setActiveSession(testSession);
        result.current.markSessionJoined();
      });

      expect(result.current.activeSession).toEqual(testSession);
      expect(result.current.hasJoined).toBe(true);

      // Disconnect
      act(() => {
        result.current.disconnect();
      });

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(result.current.socket).toBe(null);
      expect(result.current.activeSession).toBe(null);
      expect(result.current.hasJoined).toBe(false);
    });
  });
});
