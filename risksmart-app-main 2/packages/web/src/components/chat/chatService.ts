import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useChatSocket } from '@risksmart-app/components/src/stores/chat-socket/useChatSocketStore';
import { useCallback } from 'react';

import type {
  AgentHandoffData,
  AgentReasoningData,
  AgentThinkingData,
  ChatMessage,
  ErrorData,
  JoinConversationData,
  MessageChunkData,
  MessageCompleteData,
  SendMessageData,
  StateUpdateData,
  StreamingCallbacks,
  ToolCallCompleteData,
  ToolCallStartData,
  WorkflowCompleteData,
  WorkflowStartedData,
  WorkflowStepData,
} from './types';

// Hook to use chat functionality with Socket.IO
export const useChatService = () => {
  const {
    socket,
    isConnected,
    setActiveSession,
    getActiveSession,
    markSessionJoined,
  } = useChatSocket();
  const { user } = useRisksmartUser();

  const initialise = useCallback(async () => {
    console.log('Chat service initialise called', {
      socketConnected: socket?.connected,
      isConnected,
      userId: user?.userId,
      socketId: socket?.id,
    });
    if (!socket || !isConnected) {
      throw new Error('Socket.IO not connected to chat service');
    }

    if (!user?.userId) {
      throw new Error('User not authenticated or userId not available');
    }

    // Check if there's already an active session
    const existingSession = getActiveSession();
    if (existingSession) {
      console.log('Reusing existing session:', existingSession.session_id);

      return {
        session_id: existingSession.session_id,
        created_at: new Date().toISOString(),
        status: 'connected',
      };
    }

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = user.userId;

    console.log('Creating new chat session:', sessionId);

    // Join conversation room using correct backend event
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('Join conversation timeout - no response from backend');
        reject(
          new Error('Join conversation timeout - backend may not be responding')
        );
      }, 10000); // Increased timeout to 10 seconds

      // Listen for conversation_joined confirmation
      socket.once('conversation_joined', (data: Record<string, unknown>) => {
        clearTimeout(timeout);
        console.log('Successfully joined conversation:', data);

        // Only store session AFTER successful join confirmation
        setActiveSession({
          session_id: sessionId,
          user_id: userId,
          context: joinData.context || {},
        });

        // Mark session as joined to prevent reconnection spam
        markSessionJoined();

        resolve();
      });

      // Also listen for any error events
      socket.once('error', (error: Error | Record<string, unknown>) => {
        clearTimeout(timeout);
        console.error('Socket error during join:', error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        reject(new Error(`Socket error: ${errorMessage}`));
      });

      socket.once('connect_error', (error: Error | Record<string, unknown>) => {
        clearTimeout(timeout);
        console.error('Connection error during join:', error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        reject(new Error(`Connection error: ${errorMessage}`));
      });

      // Send join_conversation event with proper typing
      const joinData: JoinConversationData = {
        session_id: sessionId,
        user_id: userId,
        context: {
          source: 'risksmart_web',
          timestamp: new Date().toISOString(),
          supervisor_reasoning: '', // Always provide empty string instead of null/undefined
          // Ensure no null/undefined values in context
          ...Object.fromEntries(
            Object.entries({}).filter(([_, value]) => value != null)
          ),
        },
      };

      console.log('Sending join_conversation event:', {
        event: 'join_conversation',
        sessionId,
        userId,
        socketConnected: socket.connected,
        socketId: socket.id,
      });

      socket.emit('join_conversation', joinData);
    });

    return {
      session_id: sessionId,
      created_at: new Date().toISOString(),
      status: 'connected',
    };
  }, [
    socket,
    isConnected,
    user?.userId,
    setActiveSession,
    getActiveSession,
    markSessionJoined,
  ]);

  const invoke = useCallback(
    async (
      sessionId: string,
      message: ChatMessage,
      callbacks: StreamingCallbacks = {}
    ) => {
      if (!socket || !isConnected) {
        throw new Error('Socket.IO not connected to chat service');
      }

      return new Promise<void>((resolve, reject) => {
        const handleChunk = (data: MessageChunkData) => {
          if (data.session_id === sessionId) {
            callbacks.onChunk?.(data);
          }
        };

        const handleComplete = (data: MessageCompleteData) => {
          if (data.session_id === sessionId) {
            callbacks.onComplete?.(data);
            cleanup();
            resolve();
          }
        };

        const handleError = (error: ErrorData) => {
          callbacks.onError?.(error);
          cleanup();
          reject(new Error(error.error));
        };

        // Additional event handlers for enhanced UX with proper types
        const handleWorkflowStarted = (data: WorkflowStartedData) =>
          callbacks.onWorkflowStarted?.(data);
        const handleAgentThinking = (data: AgentThinkingData) =>
          callbacks.onAgentThinking?.(data);
        const handleAgentReasoning = (data: AgentReasoningData) =>
          callbacks.onAgentReasoning?.(data);
        const handleStateUpdate = (data: StateUpdateData) =>
          callbacks.onStateUpdate?.(data);
        const handleWorkflowStep = (data: WorkflowStepData) =>
          callbacks.onWorkflowStep?.(data);
        const handleAgentHandoff = (data: AgentHandoffData) =>
          callbacks.onAgentHandoff?.(data);
        const handleWorkflowComplete = (data: WorkflowCompleteData) =>
          callbacks.onWorkflowComplete?.(data);
        const handleToolCallStart = (data: ToolCallStartData) =>
          callbacks.onToolCallStart?.(data);
        const handleToolCallComplete = (data: ToolCallCompleteData) =>
          callbacks.onToolCallComplete?.(data);

        const cleanup = () => {
          // Use correct backend event names
          socket.off('message_chunk', handleChunk);
          socket.off('message_complete', handleComplete);
          socket.off('error', handleError);
          // Clean up additional events
          socket.off('workflow_started', handleWorkflowStarted);
          socket.off('agent_thinking', handleAgentThinking);
          socket.off('agent_reasoning', handleAgentReasoning);
          socket.off('state_update', handleStateUpdate);
          socket.off('workflow_step', handleWorkflowStep);
          socket.off('agent_handoff', handleAgentHandoff);
          socket.off('workflow_complete', handleWorkflowComplete);
          socket.off('tool_call_start', handleToolCallStart);
          socket.off('tool_call_complete', handleToolCallComplete);
        };

        // Listen for backend events using correct names
        socket.on('message_chunk', handleChunk);
        socket.on('message_complete', handleComplete);
        socket.on('error', handleError);

        // Listen for additional workflow/agent events
        socket.on('workflow_started', handleWorkflowStarted);
        socket.on('agent_thinking', handleAgentThinking);
        socket.on('agent_reasoning', handleAgentReasoning);
        socket.on('state_update', handleStateUpdate);
        socket.on('workflow_step', handleWorkflowStep);
        socket.on('agent_handoff', handleAgentHandoff);
        socket.on('workflow_complete', handleWorkflowComplete);
        socket.on('tool_call_start', handleToolCallStart);
        socket.on('tool_call_complete', handleToolCallComplete);

        // Send message using correct backend event name with proper typing
        const sendData: SendMessageData = {
          session_id: sessionId,
          message: {
            ...message,
            timestamp: message.timestamp || new Date().toISOString(),
            // Ensure no null/undefined values in message metadata
            metadata: message.metadata
              ? Object.fromEntries(
                  Object.entries(message.metadata).filter(
                    ([_, value]) => value != null
                  )
                )
              : undefined,
          },
          context: {
            source: 'risksmart_web',
            supervisor_reasoning: '', // Always provide empty string instead of null/undefined
            // Ensure no null/undefined values in context
            ...Object.fromEntries(
              Object.entries({}).filter(([_, value]) => value != null)
            ),
          },
        };
        socket.emit('send_message', sendData);
      });
    },
    [socket, isConnected]
  );

  const clearSession = useCallback(() => {
    setActiveSession(null);
    console.log('Chat session cleared');
  }, [setActiveSession]);

  return {
    initialise,
    invoke,
    isConnected,
    clearSession,
    getActiveSession,
  };
};
