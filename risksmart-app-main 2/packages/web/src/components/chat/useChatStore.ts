import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import type { ChatOption } from './types';

// Define proper types instead of using 'any'
type StateValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[];
type ToolArguments = Record<
  string,
  string | number | boolean | null | Record<string, unknown> | unknown[]
>;

export interface AgentMetadata {
  workflowId?: string;
  workflowType?: string;
  thinkingSteps?: Array<{
    timestamp: string;
    agentName: string;
    thinking: string;
  }>;
  reasoningSteps?: Array<{
    timestamp: string;
    agentName: string;
    reasoningType: 'analysis' | 'decision' | 'planning' | 'evaluation';
    reasoningContent: string;
    inputAnalysis?: string;
    decisionFactors?: string[];
    confidenceLevel: 'high' | 'medium' | 'low';
    alternativesConsidered?: string[];
    nextSteps?: string[];
  }>;
  stateUpdates?: Array<{
    timestamp: string;
    stateName: string;
    oldValue: StateValue;
    newValue: StateValue;
    changedByAgent: string;
  }>;
  toolCalls?: Array<{
    toolName: string;
    toolArgs?: ToolArguments;
    startTime: string;
    endTime?: string;
    success?: boolean;
    executionTimeMs?: number;
    calledByAgent?: string;
    error?: string;
  }>;
  responseId?: string;
  totalChunks?: number;
  processingTime?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isSystem?: boolean;
  metadata?: AgentMetadata;
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  options: ChatOption[];
  isLoading: boolean;
  isInitialising: boolean;
  sessionId: string | null;
  sessionInitialized: boolean;
  thinkingSteps: string[];
  currentThinkingStep: string | null;
  streamingMessageId: string | null;
  isStreaming: boolean;
  setIsOpen: (open: boolean) => void;
  addMessage: (content: string, isUser: boolean, isSystem?: boolean) => void;
  removeSystemMessages: () => void;
  setOptions: (options: ChatOption[]) => void;
  clearOptions: () => void;
  setIsLoading: (loading: boolean) => void;
  setIsInitialising: (initialising: boolean) => void;
  clearMessages: () => void;
  setSessionId: (sessionId: string | null) => void;
  setSessionInitialized: (initialized: boolean) => void;
  initializeSession: () => void;
  addThinkingStep: (step: string) => void;
  setCurrentThinkingStep: (step: string | null) => void;
  clearThinkingSteps: () => void;
  startStreamingMessage: (messageId: string) => void;
  appendToStreamingMessage: (content: string) => void;
  finishStreamingMessage: (finalContent?: string) => void;
  updateStreamingMetadata: (metadata: Partial<AgentMetadata>) => void;
  addThinkingToMetadata: (
    agentName: string,
    thinking: string,
    timestamp: string
  ) => void;
  addToolCallToMetadata: (toolName: string, startTime: string) => void;
  completeToolCallInMetadata: (
    toolName: string,
    endTime: string,
    success?: boolean
  ) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],
  options: [],
  isLoading: false,
  isInitialising: false,
  sessionId: null,
  sessionInitialized: false,
  thinkingSteps: [],
  currentThinkingStep: null,
  streamingMessageId: null,
  isStreaming: false,
  setIsOpen: (open) => set({ isOpen: open }),
  addMessage: (content, isUser, isSystem = false) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: uuidv4(),
          content,
          timestamp: new Date(),
          isUser,
          isSystem,
        },
      ],
    })),
  removeSystemMessages: () =>
    set((state) => ({
      messages: state.messages.filter((message) => !message.isSystem),
    })),
  setOptions: (options) => set({ options }),
  clearOptions: () => set({ options: [] }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsInitialising: (initialising) => set({ isInitialising: initialising }),
  clearMessages: () =>
    set({ messages: [], sessionId: null, sessionInitialized: false }),
  setSessionId: (sessionId) => set({ sessionId }),
  setSessionInitialized: (initialized) =>
    set({ sessionInitialized: initialized }),
  initializeSession: () =>
    set({ sessionId: null, sessionInitialized: false, messages: [] }),
  addThinkingStep: (step) =>
    set((state) => ({
      thinkingSteps: [...state.thinkingSteps, step],
    })),
  setCurrentThinkingStep: (step) => set({ currentThinkingStep: step }),
  clearThinkingSteps: () =>
    set({ thinkingSteps: [], currentThinkingStep: null }),
  startStreamingMessage: (messageId) =>
    set((state) => {
      const newMessage: ChatMessage = {
        id: messageId,
        content: '',
        timestamp: new Date(),
        isUser: false,
        isSystem: false,
        metadata: {
          thinkingSteps: [],
          reasoningSteps: [],
          stateUpdates: [],
          toolCalls: [],
        },
      };

      return {
        streamingMessageId: messageId,
        isStreaming: true,
        messages: [...state.messages, newMessage],
      };
    }),
  appendToStreamingMessage: (content) =>
    set((state) => {
      if (!state.streamingMessageId) {
        return state;
      }

      const currentMessage = state.messages.find(
        (msg) => msg.id === state.streamingMessageId
      );
      const newContent = (currentMessage?.content || '') + content;

      // Always append exactly as received, preserving all whitespace
      return {
        messages: state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? { ...msg, content: newContent }
            : msg
        ),
      };
    }),
  finishStreamingMessage: (finalContent?: string) =>
    set((state) => {
      if (finalContent && state.streamingMessageId) {
        // Replace the streaming message content with the properly formatted final content
        // IMPORTANT: Keep all existing message properties including metadata!
        return {
          streamingMessageId: null,
          isStreaming: false,
          messages: state.messages.map((msg) =>
            msg.id === state.streamingMessageId
              ? { ...msg, content: finalContent } // This preserves metadata automatically
              : msg
          ),
        };
      }

      return {
        streamingMessageId: null,
        isStreaming: false,
      };
    }),

  updateStreamingMetadata: (metadata) =>
    set((state) => {
      if (!state.streamingMessageId) {
        return state;
      }

      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  ...metadata,
                },
              }
            : msg
        ),
      };
    }),

  addThinkingToMetadata: (agentName, thinking, timestamp) =>
    set((state) => {
      if (!state.streamingMessageId) {
        return state;
      }

      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  thinkingSteps: [
                    ...(msg.metadata?.thinkingSteps || []),
                    {
                      timestamp,
                      agentName,
                      thinking,
                    },
                  ],
                },
              }
            : msg
        ),
      };
    }),

  addToolCallToMetadata: (toolName, startTime) =>
    set((state) => {
      if (!state.streamingMessageId) {
        return state;
      }

      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  toolCalls: [
                    ...(msg.metadata?.toolCalls || []),
                    { toolName, startTime },
                  ],
                },
              }
            : msg
        ),
      };
    }),

  completeToolCallInMetadata: (toolName, endTime, success) =>
    set((state) => {
      if (!state.streamingMessageId) {
        return state;
      }

      return {
        messages: state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  toolCalls: (msg.metadata?.toolCalls || []).map((tool) =>
                    tool.toolName === toolName && !tool.endTime
                      ? { ...tool, endTime, success }
                      : tool
                  ),
                },
              }
            : msg
        ),
      };
    }),
}));
