import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the chat store
const mockUseChatStore = {
  isLoading: false,
  isInitialising: false,
  sessionId: 'test-session-123' as string | null,
  addMessage: vi.fn(),
  removeSystemMessages: vi.fn(),
  clearOptions: vi.fn(),
  setIsLoading: vi.fn(),
  setIsInitialising: vi.fn(),
  addThinkingStep: vi.fn(),
  setCurrentThinkingStep: vi.fn(),
  clearThinkingSteps: vi.fn(),
  startStreamingMessage: vi.fn(),
  appendToStreamingMessage: vi.fn(),
  finishStreamingMessage: vi.fn(),
  updateStreamingMetadata: vi.fn(),
  addThinkingToMetadata: vi.fn(),
  addToolCallToMetadata: vi.fn(),
  completeToolCallInMetadata: vi.fn(),
};

vi.mock('../useChatStore', () => ({
  useChatStore: vi.fn(() => mockUseChatStore),
}));

// Mock the chat service
const mockUseChatService = {
  invoke: vi.fn(),
};

vi.mock('../chatService', () => ({
  useChatService: vi.fn(() => mockUseChatService),
}));

// Mock console methods
vi.spyOn(console, 'error').mockImplementation(() => {
  // Silent mock for console.error in tests
});

import { useChatMessaging } from './useChatMessaging';

describe('useChatMessaging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset default mock values
    mockUseChatStore.isLoading = false;
    mockUseChatStore.isInitialising = false;
    mockUseChatStore.sessionId = 'test-session-123';
    mockUseChatService.invoke = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const { result } = renderHook(() => useChatMessaging());

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      expect(mockUseChatStore.removeSystemMessages).toHaveBeenCalled();
      expect(mockUseChatStore.clearOptions).toHaveBeenCalled();
      expect(mockUseChatStore.clearThinkingSteps).toHaveBeenCalled();
      expect(mockUseChatStore.finishStreamingMessage).toHaveBeenCalledWith();
      expect(mockUseChatStore.addMessage).toHaveBeenCalledWith(
        'Hello, AI!',
        true
      );
      expect(mockUseChatStore.setIsLoading).toHaveBeenCalledWith(true);

      expect(mockUseChatService.invoke).toHaveBeenCalledWith(
        'test-session-123',
        {
          role: 'user',
          content: 'Hello, AI!',
          timestamp: expect.any(String),
        },
        expect.any(Object) // streaming callbacks
      );
    });

    it('should not send message when loading', async () => {
      mockUseChatStore.isLoading = true;

      const { result } = renderHook(() => useChatMessaging());

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      expect(mockUseChatService.invoke).not.toHaveBeenCalled();
      expect(mockUseChatStore.addMessage).not.toHaveBeenCalled();
    });

    it('should not send message when initialising', async () => {
      mockUseChatStore.isInitialising = true;

      const { result } = renderHook(() => useChatMessaging());

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      expect(mockUseChatService.invoke).not.toHaveBeenCalled();
      expect(mockUseChatStore.addMessage).not.toHaveBeenCalled();
    });

    it('should not send message when no session ID', async () => {
      mockUseChatStore.sessionId = null;

      const { result } = renderHook(() => useChatMessaging());

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      expect(mockUseChatService.invoke).not.toHaveBeenCalled();
      expect(mockUseChatStore.addMessage).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Service unavailable');
      mockUseChatService.invoke = vi.fn().mockRejectedValue(serviceError);

      // Mock console.error to prevent test setup failure
      const originalConsoleError = console.error;
      console.error = vi.fn();

      const { result } = renderHook(() => useChatMessaging());

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      expect(console.error).toHaveBeenCalledWith(
        'Chat service error:',
        serviceError
      );

      // Restore console.error
      console.error = originalConsoleError;
      expect(mockUseChatStore.addMessage).toHaveBeenCalledWith(
        "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        false
      );
      expect(mockUseChatStore.setIsLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('streaming callbacks', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let callbacks: any;

    beforeEach(async () => {
      // Reset callbacks
      callbacks = undefined;

      // Capture the callbacks passed to invoke
      mockUseChatService.invoke = vi.fn().mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sessionId: string, message: any, cb: any) => {
          callbacks = cb;

          return Promise.resolve();
        }
      );

      const { result } = renderHook(() => useChatMessaging());

      await act(async () => {
        await result.current.sendMessage('Test message');
      });
    });

    describe('onChunk', () => {
      it('should start streaming message on first chunk', () => {
        act(() => {
          callbacks.onChunk({ chunk_index: 0, content: 'Hello' });
        });

        expect(mockUseChatStore.startStreamingMessage).toHaveBeenCalledWith(
          expect.stringMatching(/streaming-\d+-[a-z0-9]+/)
        );
        expect(mockUseChatStore.setIsInitialising).toHaveBeenCalledWith(false);
      });

      it('should queue chunk content for delayed processing', () => {
        act(() => {
          callbacks.onChunk({ chunk_index: 0, content: 'Hello' });
        });

        // The content should be queued for character-by-character processing
        // We can't easily test the internal queue, but we can verify the stream started
        expect(mockUseChatStore.startStreamingMessage).toHaveBeenCalled();
      });

      it('should handle multiple chunks', () => {
        act(() => {
          callbacks.onChunk({ chunk_index: 0, content: 'Hello ' });
        });

        act(() => {
          callbacks.onChunk({ chunk_index: 1, content: 'world!' });
        });

        expect(mockUseChatStore.startStreamingMessage).toHaveBeenCalledTimes(1);
      });

      it('should not start streaming if already created', () => {
        // First chunk
        act(() => {
          callbacks.onChunk({ chunk_index: 0, content: 'First' });
        });

        mockUseChatStore.startStreamingMessage.mockClear();

        // Second chunk
        act(() => {
          callbacks.onChunk({ chunk_index: 1, content: 'Second' });
        });

        expect(mockUseChatStore.startStreamingMessage).not.toHaveBeenCalled();
      });
    });

    describe('onComplete', () => {
      it('should update metadata and finish streaming', async () => {
        const completeData = {
          total_chunks: 5,
          processing_time: '200ms',
          message: { content: 'Complete response' },
        };

        await act(async () => {
          callbacks.onComplete(completeData);
        });

        expect(mockUseChatStore.updateStreamingMetadata).toHaveBeenCalledWith({
          totalChunks: 5,
          processingTime: '200ms',
        });

        expect(mockUseChatStore.finishStreamingMessage).toHaveBeenCalledWith(
          'Complete response'
        );
        expect(mockUseChatStore.setIsLoading).toHaveBeenCalledWith(false);
      });

      it('should clear thinking steps after completion', async () => {
        await act(async () => {
          callbacks.onComplete({ message: { content: 'Done' } });
        });

        // Fast-forward the timeout for clearing thinking steps
        await act(async () => {
          vi.advanceTimersByTime(500);
        });

        expect(mockUseChatStore.clearThinkingSteps).toHaveBeenCalled();
      });

      it('should handle completion without message content', async () => {
        await act(async () => {
          callbacks.onComplete({ total_chunks: 1 });
        });

        expect(mockUseChatStore.finishStreamingMessage).toHaveBeenCalledWith();
      });
    });

    describe('onError', () => {
      it('should handle errors and clean up', () => {
        const errorData = { error: 'Service error' };

        act(() => {
          callbacks.onError(errorData);
        });

        expect(mockUseChatStore.clearThinkingSteps).toHaveBeenCalled();
        expect(mockUseChatStore.finishStreamingMessage).toHaveBeenCalledWith();
        expect(mockUseChatStore.addMessage).toHaveBeenCalledWith(
          'Error: Service error. Please try again in a moment.',
          false
        );
        expect(mockUseChatStore.setIsLoading).toHaveBeenCalledWith(false);
      });
    });

    describe('workflow events', () => {
      it('should handle workflow started', () => {
        const workflowData = {
          workflow_id: 'wf-123',
          workflow_type: 'question_answering',
          response_id: 'resp-123',
        };

        act(() => {
          callbacks.onWorkflowStarted(workflowData);
        });

        expect(mockUseChatStore.clearThinkingSteps).toHaveBeenCalled();
        expect(mockUseChatStore.addThinkingStep).toHaveBeenCalledWith(
          '🚀 Starting to process your request...'
        );
        expect(mockUseChatStore.updateStreamingMetadata).toHaveBeenCalledWith({
          workflowId: 'wf-123',
          workflowType: 'question_answering',
          responseId: 'resp-123',
        });
      });

      it('should handle agent thinking with various message formats', () => {
        const thinkingData = {
          thinking_about: 'Analyzing the user query...',
          agent_name: 'AI Assistant',
          timestamp: '2023-01-01T10:00:00Z',
        };

        act(() => {
          callbacks.onAgentThinking(thinkingData);
        });

        expect(mockUseChatStore.addThinkingStep).toHaveBeenCalledWith(
          '🤔 Analyzing the user query...'
        );
        expect(mockUseChatStore.addThinkingToMetadata).toHaveBeenCalledWith(
          'AI Assistant',
          'Analyzing the user query...',
          '2023-01-01T10:00:00Z'
        );
      });

      it('should handle agent thinking with fallback text', () => {
        const thinkingData = {
          agent_name: 'AI Assistant',
          timestamp: '2023-01-01T10:00:00Z',
        };

        act(() => {
          callbacks.onAgentThinking(thinkingData);
        });

        expect(mockUseChatStore.addThinkingStep).toHaveBeenCalledWith(
          '🤔 Analyzing your request...'
        );
        expect(mockUseChatStore.addThinkingToMetadata).toHaveBeenCalledWith(
          'AI Assistant',
          'Analyzing your request...',
          '2023-01-01T10:00:00Z'
        );
      });

      it('should handle state updates', () => {
        const stateData = {
          state_key: 'processing_stage',
          old_value: 'initial',
          new_value: 'analyzing',
        };

        act(() => {
          callbacks.onStateUpdate(stateData);
        });

        expect(mockUseChatStore.addThinkingStep).toHaveBeenCalledWith(
          '📊 Updated processing_stage: initial → analyzing'
        );
      });

      it('should handle workflow steps', () => {
        const stepData = {
          step_name: 'analyze_query',
          step_status: 'started',
        };

        act(() => {
          callbacks.onWorkflowStep(stepData);
        });

        expect(mockUseChatStore.addThinkingStep).toHaveBeenCalledWith(
          '🏃 Starting analyze_query'
        );
      });

      it('should handle tool call start', () => {
        const toolData = {
          tool_name: 'search_database',
          called_by_agent: 'AI Assistant',
          tool_args: { query: 'test' },
          timestamp: '2023-01-01T10:00:00Z',
        };

        act(() => {
          callbacks.onToolCallStart(toolData);
        });

        expect(mockUseChatStore.addThinkingStep).toHaveBeenCalledWith(
          '🔧 AI Assistant using search_database (1 params)...'
        );
        expect(mockUseChatStore.addToolCallToMetadata).toHaveBeenCalledWith(
          'search_database',
          '2023-01-01T10:00:00Z'
        );
      });

      it('should handle tool call completion', () => {
        const toolData = {
          tool_name: 'search_database',
          execution_time_ms: 150,
          success: true,
          timestamp: '2023-01-01T10:00:05Z',
        };

        act(() => {
          callbacks.onToolCallComplete(toolData);
        });

        expect(mockUseChatStore.addThinkingStep).toHaveBeenCalledWith(
          '✅ Completed search_database (150ms)'
        );
        expect(
          mockUseChatStore.completeToolCallInMetadata
        ).toHaveBeenCalledWith('search_database', '2023-01-01T10:00:05Z', true);
      });

      it('should handle agent handoff', () => {
        const handoffData = {
          from_agent: 'Query Agent',
          to_agent: 'Response Agent',
        };

        act(() => {
          callbacks.onAgentHandoff(handoffData);
        });

        expect(mockUseChatStore.addThinkingStep).toHaveBeenCalledWith(
          '🔄 Handoff: Query Agent → Response Agent'
        );
      });

      it('should handle workflow complete', () => {
        const completeData = {
          success: true,
          execution_time_ms: 2500,
          steps_completed: 5,
        };

        act(() => {
          callbacks.onWorkflowComplete(completeData);
        });

        expect(mockUseChatStore.addThinkingStep).toHaveBeenCalledWith(
          '✅ Workflow complete (2500ms, 5 steps)'
        );
      });
    });
  });

  describe('character-by-character typing simulation', () => {
    it('should handle punctuation delays', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let callbacks: any;

      mockUseChatService.invoke = vi.fn().mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sessionId: string, message: any, cb: any) => {
          callbacks = cb;

          return Promise.resolve();
        }
      );

      const { result } = renderHook(() => useChatMessaging());

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      // Ensure callbacks are set before using them
      expect(callbacks).toBeDefined();

      // Simulate chunk with punctuation
      act(() => {
        callbacks.onChunk({ chunk_index: 0, content: 'Hello. World!' });
      });

      // The implementation should handle character delays internally
      // We can verify that streaming started
      expect(mockUseChatStore.startStreamingMessage).toHaveBeenCalled();
    });
  });
});
