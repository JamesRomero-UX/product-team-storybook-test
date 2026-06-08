import { useCallback } from 'react';

import { useChatService } from '../chatService';
import type {
  AgentHandoffData,
  AgentReasoningData,
  AgentThinkingData,
  ErrorData,
  MessageChunkData,
  MessageCompleteData,
  StateUpdateData,
  ToolCallCompleteData,
  ToolCallStartData,
  WorkflowCompleteData,
  WorkflowStartedData,
  WorkflowStepData,
} from '../types';
import { useChatStore } from '../useChatStore';

export const useChatMessaging = () => {
  const {
    isLoading,
    isInitialising,
    sessionId,
    addMessage,
    removeSystemMessages,
    clearOptions,
    setIsLoading,
    setIsInitialising,
    addThinkingStep,
    setCurrentThinkingStep,
    clearThinkingSteps,
    startStreamingMessage,
    appendToStreamingMessage,
    finishStreamingMessage,
    updateStreamingMetadata,
    addThinkingToMetadata,
    addToolCallToMetadata,
    completeToolCallInMetadata,
  } = useChatStore();

  const { invoke } = useChatService();

  const createStreamingCallbacks = useCallback(() => {
    const stepQueue: string[] = [];
    let isProcessingSteps = false;
    let streamingMessageCreated = false;
    const chunkQueue: string[] = [];
    let isProcessingChunks = false;

    const processNextStep = () => {
      if (stepQueue.length === 0 || isProcessingSteps) {
        return;
      }

      isProcessingSteps = true;
      const nextStep = stepQueue.shift()!;
      setCurrentThinkingStep(nextStep);

      // Show each step for 1.5 seconds before moving to the next
      setTimeout(() => {
        isProcessingSteps = false;
        processNextStep();
      }, 1500);
    };

    const processNextChunk = () => {
      if (chunkQueue.length === 0 || isProcessingChunks) {
        return;
      }

      isProcessingChunks = true;
      const nextChunk = chunkQueue.shift()!;

      // Type out character by character for smooth effect
      let charIndex = 0;
      const typeNextChar = () => {
        if (charIndex < nextChunk.length) {
          const currentChar = nextChunk[charIndex];
          appendToStreamingMessage(currentChar);
          charIndex++;

          // Claude Desktop speed - very fast with minimal delays
          let baseDelay = 3; // Much faster base speed to match Claude Desktop

          // Tiny pauses for punctuation - barely perceptible but maintains rhythm
          if (
            currentChar === '.' ||
            currentChar === '!' ||
            currentChar === '?'
          ) {
            baseDelay = 12; // Very brief pause at sentence endings
          } else if (
            currentChar === ',' ||
            currentChar === ':' ||
            currentChar === ';'
          ) {
            baseDelay = 8; // Minimal pause at commas/colons
          } else if (currentChar === ' ') {
            baseDelay = 2; // Almost instant for spaces
          } else if (currentChar === '\n') {
            baseDelay = 15; // Short pause at line breaks
          }

          // Minimal randomness to avoid mechanical feel
          const randomVariation = Math.random() * 2 - 1; // -1 to +1ms variation
          const delay = Math.max(1, baseDelay + randomVariation); // 1ms minimum delay

          setTimeout(typeNextChar, delay);
        } else {
          // Finished typing this chunk, move to next
          isProcessingChunks = false;
          processNextChunk();
        }
      };

      typeNextChar();
    };

    const addStepWithDelay = (step: string) => {
      addThinkingStep(step);
      stepQueue.push(step);
      processNextStep();
    };

    return {
      onChunk: (data: MessageChunkData) => {
        // Start streaming message on first chunk only
        if (
          (data.chunk_index === 0 || data.chunk_index === 1) &&
          !streamingMessageCreated
        ) {
          const messageId = `streaming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          startStreamingMessage(messageId);
          streamingMessageCreated = true;

          // Clear initialising state when actual message starts streaming
          setIsInitialising(false);
        }

        // Queue chunk content for delayed processing
        if (data.content) {
          chunkQueue.push(data.content);

          // Start processing immediately if not already processing
          if (!isProcessingChunks) {
            processNextChunk();
          }
        }
      },
      onComplete: (
        data: MessageCompleteData & {
          processing_time?: number;
          response?: string;
        }
      ) => {
        // Capture completion metadata
        updateStreamingMetadata({
          totalChunks: data.total_chunks,
          processingTime: data.processing_time?.toString(),
        });

        // Wait for any remaining chunks to process, then complete
        const waitForChunksAndComplete = () => {
          if (chunkQueue.length > 0 || isProcessingChunks) {
            setTimeout(waitForChunksAndComplete, 100);

            return;
          }

          // Check if the complete event has the properly formatted message
          if (data.message?.content || data.response) {
            const fullContent = data.message?.content || data.response;

            // Replace the streaming message with the properly formatted complete message
            finishStreamingMessage(fullContent);
          } else {
            // Finish streaming (this keeps the existing streaming message)
            finishStreamingMessage();
          }

          // Clear thinking steps when response is complete
          setTimeout(() => {
            clearThinkingSteps();
          }, 500);

          setIsLoading(false);
        };

        waitForChunksAndComplete();

        // DON'T call addMessage here as we already have the streaming message
      },
      onError: (error: ErrorData) => {
        clearThinkingSteps();
        finishStreamingMessage(); // Clean up any ongoing streaming
        addMessage(
          `Error: ${error.error}. Please try again in a moment.`,
          false
        );
        setIsLoading(false);
      },
      onWorkflowStarted: (
        data: WorkflowStartedData & { response_id?: string }
      ) => {
        clearThinkingSteps();
        addStepWithDelay('🚀 Starting to process your request...');

        // Capture workflow metadata
        updateStreamingMetadata({
          workflowId: data.workflow_id,
          workflowType: data.workflow_type,
          responseId: data.response_id,
        });
      },
      onAgentThinking: (data: AgentThinkingData) => {
        // Try to extract meaningful text from various possible fields
        const thinkingText = data.thinking_about || 'Analyzing your request...';

        const displayText = thinkingText || 'Analyzing your request...';
        addStepWithDelay(`🤔 ${displayText}`);

        // Store thinking metadata
        addThinkingToMetadata(
          data.agent_name || 'AI Assistant',
          thinkingText || displayText,
          data.timestamp || new Date().toISOString()
        );
      },
      onAgentReasoning: (data: AgentReasoningData) => {
        // Enhanced reasoning data from the backend
        const reasoningText =
          data.reasoning_content || 'Processing reasoning...';
        const reasoningType = data.reasoning_type || 'analysis';

        // Show a more specific thinking step based on reasoning type
        const typeEmojis: Record<string, string> = {
          analysis: '🔍',
          decision: '⚖️',
          planning: '📋',
          evaluation: '✅',
        };
        const typeEmoji = typeEmojis[reasoningType] || '🧠';

        addStepWithDelay(
          `${typeEmoji} ${reasoningType}: ${reasoningText.substring(0, 50)}...`
        );

        // TODO: Add reasoning to metadata store when we implement the new store methods
      },
      onStateUpdate: (data: StateUpdateData) => {
        // Workflow state changes - improved display
        const stateName = data.state_key || 'state';
        const oldVal =
          data.old_value === null ? 'null' : String(data.old_value);
        const newVal = String(data.new_value);

        // Truncate long values
        const displayOld =
          oldVal.length > 20 ? `${oldVal.substring(0, 20)}...` : oldVal;
        const displayNew =
          newVal.length > 20 ? `${newVal.substring(0, 20)}...` : newVal;

        addStepWithDelay(
          `📊 Updated ${stateName}: ${displayOld} → ${displayNew}`
        );
      },
      onWorkflowStep: (data: WorkflowStepData) => {
        // Workflow step tracking
        const stepName = data.step_name || 'step';
        const status = data.step_status || 'unknown';

        if (status === 'started') {
          addStepWithDelay(`🏃 Starting ${stepName}`);
        } else if (status === 'completed') {
          addStepWithDelay(`✅ Completed ${stepName}`);
        } else if (status === 'failed') {
          addStepWithDelay(`❌ Failed ${stepName}`);
        }
      },
      onAgentHandoff: (data: AgentHandoffData) => {
        // Agent handoffs
        const fromAgent = data.from_agent || 'unknown';
        const toAgent = data.to_agent || 'unknown';
        addStepWithDelay(`🔄 Handoff: ${fromAgent} → ${toAgent}`);
      },
      onWorkflowComplete: (data: WorkflowCompleteData) => {
        // Workflow completion
        const success = data.success ? '✅' : '❌';
        const timeMs = data.execution_time_ms || 0;
        const steps = data.steps_completed || 0;

        addStepWithDelay(
          `${success} Workflow complete (${timeMs}ms, ${steps} steps)`
        );
      },
      onToolCallStart: (data: ToolCallStartData) => {
        const toolName = data.tool_name || 'external tool';
        const calledBy = data.called_by_agent || 'AI';
        const argsCount = data.tool_args
          ? Object.keys(data.tool_args).length
          : 0;

        addStepWithDelay(
          `🔧 ${calledBy} using ${toolName}${argsCount > 0 ? ` (${argsCount} params)` : ''}...`
        );

        // Capture tool call start in metadata
        addToolCallToMetadata(
          toolName,
          data.timestamp || new Date().toISOString()
        );
      },
      onToolCallComplete: (data: ToolCallCompleteData) => {
        const toolName = data.tool_name || 'tool';
        const executionTime = data.execution_time_ms
          ? `${data.execution_time_ms}ms`
          : '';

        if (data.success !== false) {
          addStepWithDelay(
            `✅ Completed ${toolName}${executionTime ? ` (${executionTime})` : ''}`
          );
        } else {
          const errorMsg = data.error
            ? `: ${data.error.substring(0, 30)}...`
            : '';
          addStepWithDelay(`⚠️ ${toolName} failed${errorMsg}`);
        }

        // Capture tool call completion in metadata
        completeToolCallInMetadata(
          toolName,
          data.timestamp || new Date().toISOString(),
          data.success
        );
      },
    };
  }, [
    startStreamingMessage,
    appendToStreamingMessage,
    updateStreamingMetadata,
    finishStreamingMessage,
    clearThinkingSteps,
    addThinkingStep,
    setCurrentThinkingStep,
    addThinkingToMetadata,
    addToolCallToMetadata,
    completeToolCallInMetadata,
    setIsLoading,
    setIsInitialising,
    addMessage,
  ]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (isLoading || isInitialising || !sessionId) {
        return;
      }

      removeSystemMessages();
      clearOptions();
      clearThinkingSteps();
      finishStreamingMessage(); // Clean up any previous streaming
      addMessage(message, true);
      setIsLoading(true);

      try {
        await invoke(
          sessionId,
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          },
          createStreamingCallbacks()
        );
      } catch (error) {
        console.error('Chat service error:', error);
        addMessage(
          "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.",
          false
        );
        setIsLoading(false);
      }
    },
    [
      invoke,
      isLoading,
      isInitialising,
      sessionId,
      removeSystemMessages,
      clearOptions,
      clearThinkingSteps,
      finishStreamingMessage,
      createStreamingCallbacks,
      addMessage,
      setIsLoading,
    ]
  );

  return { sendMessage };
};
