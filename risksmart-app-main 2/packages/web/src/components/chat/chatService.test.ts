import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock a user that can be null/undefined for testing
const createMockUser = (userId?: string) => ({
  orgKey: 'test-org',
  orgRole: 'user' as const,
  allowedRoles: ['user'],
  userId: userId || 'test-user-123',
  isCustomerSupport: false,
});

// Mock socket object
const mockSocket = {
  connected: true,
  id: 'socket-123',
  emit: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  off: vi.fn(),
};

// Mock chat socket provider
const mockChatSocket = {
  // SocketConnectionService
  socket: mockSocket,
  isConnected: true,
  isConnecting: false,
  _setSocket: vi.fn(),
  _setIsConnected: vi.fn(),
  _setIsConnecting: vi.fn(),

  // SessionManagementService
  activeSession: null,
  hasJoined: false,
  setActiveSession: vi.fn(),
  getActiveSession: vi.fn(),
  markSessionJoined: vi.fn(),
  _resetSession: vi.fn(),

  // ConnectionManagerService
  isAuthenticated: true,
  isChatFeatureEnabled: true,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  _getAccessToken: null,
  connect: vi.fn(),
  disconnect: vi.fn(),
  updateAuthState: vi.fn(),
  reset: vi.fn(),
  _incrementReconnectAttempts: vi.fn(),
  _resetReconnectAttempts: vi.fn(),
};

// Mock user
const mockUser = createMockUser();

// Mock the modules
vi.mock(
  '@risksmart-app/components/src/stores/chat-socket/useChatSocketStore',
  () => ({
    useChatSocket: vi.fn(() => mockChatSocket),
  })
);

vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser', () => ({
  default: vi.fn(() => ({ user: mockUser })),
}));

import { useChatService } from './chatService';

describe('useChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock properties
    mockSocket.connected = true;
    mockSocket.id = 'socket-123';
    mockChatSocket.isConnected = true;
    mockChatSocket.socket = mockSocket;
    mockUser.userId = 'test-user-123';
  });

  describe('initialise', () => {
    it('should return existing session if one exists', async () => {
      const existingSession = {
        session_id: 'existing-session-123',
        user_id: 'test-user-123',
        context: {},
      };

      mockChatSocket.getActiveSession.mockReturnValue(existingSession);

      const { result } = renderHook(() => useChatService());
      const response = await result.current.initialise();

      expect(response).toEqual({
        session_id: 'existing-session-123',
        created_at: expect.any(String),
        status: 'connected',
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should create new session when none exists', async () => {
      mockChatSocket.getActiveSession.mockReturnValue(null);

      // Mock successful conversation join
      mockSocket.once.mockImplementation((event, callback) => {
        if (event === 'conversation_joined') {
          // Simulate async response
          setTimeout(() => {
            callback({ session_id: 'new-session-123' });
          }, 10);
        }
      });

      const { result } = renderHook(() => useChatService());
      const response = await result.current.initialise();

      expect(response).toEqual({
        session_id: expect.stringMatching(/^session-\d+-[a-z0-9]+$/),
        created_at: expect.any(String),
        status: 'connected',
      });

      // Wait for emit to be called
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'join_conversation',
          expect.objectContaining({
            session_id: expect.stringMatching(/^session-\d+-[a-z0-9]+$/),
            user_id: 'test-user-123',
            context: expect.objectContaining({
              source: 'risksmart_web',
              supervisor_reasoning: '',
            }),
          })
        );
      });

      expect(mockChatSocket.setActiveSession).toHaveBeenCalled();
      expect(mockChatSocket.markSessionJoined).toHaveBeenCalled();
    });

    it('should throw error when socket is not connected', async () => {
      mockChatSocket.isConnected = false;

      const { result } = renderHook(() => useChatService());

      await expect(result.current.initialise()).rejects.toThrow(
        'Socket.IO not connected to chat service'
      );
    });

    it('should throw error when no socket exists', async () => {
      // Temporarily override the mock to return null socket
      const useChatSocketMock =
        await import('@risksmart-app/components/src/stores/chat-socket/useChatSocketStore');
      vi.mocked(useChatSocketMock.useChatSocket).mockReturnValueOnce({
        ...mockChatSocket,
        socket: null,
      });

      const { result } = renderHook(() => useChatService());

      await expect(result.current.initialise()).rejects.toThrow(
        'Socket.IO not connected to chat service'
      );
    });

    it('should throw error when user is not authenticated', async () => {
      // Temporarily set userId to undefined to test authentication failure
      const originalUserId = mockUser.userId;
      (mockUser as { userId: string | undefined }).userId = undefined;

      const { result } = renderHook(() => useChatService());

      await expect(result.current.initialise()).rejects.toThrow(
        'User not authenticated or userId not available'
      );

      // Restore original userId for other tests
      mockUser.userId = originalUserId;
    });
  });

  describe('invoke', () => {
    it('should throw error when socket is not connected', async () => {
      mockChatSocket.isConnected = false;

      const { result } = renderHook(() => useChatService());

      await expect(
        result.current.invoke('session-123', {
          role: 'user',
          content: 'test',
          timestamp: new Date().toISOString(),
        })
      ).rejects.toThrow('Socket.IO not connected to chat service');
    });

    it('should send message and handle completion', async () => {
      // Mock the socket.on method to simulate message_complete event
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'message_complete') {
          // Simulate completion after a short delay
          setTimeout(() => {
            callback({ session_id: 'session-123', message_id: 'msg-123' });
          }, 10);
        }
      });

      const { result } = renderHook(() => useChatService());

      const invokePromise = result.current.invoke('session-123', {
        role: 'user',
        content: 'test message',
        timestamp: new Date().toISOString(),
      });

      // Wait for the invoke to complete
      await invokePromise;

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'send_message',
        expect.objectContaining({
          session_id: 'session-123',
          message: expect.objectContaining({
            role: 'user',
            content: 'test message',
          }),
        })
      );
    });
  });

  describe('clearSession', () => {
    it('should clear the active session', () => {
      const { result } = renderHook(() => useChatService());

      result.current.clearSession();

      expect(mockChatSocket.setActiveSession).toHaveBeenCalledWith(null);
    });
  });

  describe('isConnected', () => {
    it('should return connection status', () => {
      const { result } = renderHook(() => useChatService());

      expect(result.current.isConnected).toBe(true);

      // Test when disconnected
      mockChatSocket.isConnected = false;
      const { result: result2 } = renderHook(() => useChatService());
      expect(result2.current.isConnected).toBe(false);
    });
  });

  describe('getActiveSession', () => {
    it('should return the active session', () => {
      const mockSession = { session_id: 'test-123' };
      mockChatSocket.getActiveSession.mockReturnValue(mockSession);

      const { result } = renderHook(() => useChatService());

      expect(result.current.getActiveSession()).toBe(mockSession);
    });
  });
});
