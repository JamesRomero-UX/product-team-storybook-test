/**
 * Chat Service Types
 *
 * TypeScript interfaces for Socket.IO chat events and data structures.
 * These types ensure type safety when communicating with the AI chat backend.
 */

// Backend event data structures for Socket.IO communication
export interface JoinConversationData {
  session_id: string;
  user_id?: string;
  context?: Record<string, unknown> & {
    supervisor_reasoning?: string; // Always string, never null/undefined
  };
}

export interface SendMessageData {
  session_id: string;
  message: {
    role: string;
    content: string;
    timestamp?: string;
    metadata?: Record<string, unknown>;
  };
  context?: Record<string, unknown> & {
    supervisor_reasoning?: string; // Always string, never null/undefined
  };
}

// Streaming response events
export interface MessageChunkData {
  session_id: string;
  chunk_id: string;
  content: string;
  chunk_index: number;
  is_final: boolean;
  metadata?: Record<string, unknown>;
}

export interface MessageCompleteData {
  session_id: string;
  message: {
    role: string;
    content: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  };
  response_id: string;
  total_chunks: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Workflow and agent events for enhanced UX
export interface WorkflowStartedData {
  workflow_id: string;
  workflow_type: string;
  user_query: string;
  timestamp: string;
}

export interface AgentThinkingData {
  agent_name: string;
  thinking_about: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface AgentReasoningData {
  agent_name: string;
  reasoning_type: 'analysis' | 'decision' | 'planning' | 'evaluation';
  reasoning_content: string;
  input_analysis?: string;
  decision_factors?: string[];
  confidence_level: 'high' | 'medium' | 'low';
  alternatives_considered?: string[];
  next_steps?: string[];
  timestamp: string;
}

export interface StateUpdateData {
  state_key: string;
  old_value: unknown;
  new_value: unknown;
  updated_by_agent: string;
  timestamp: string;
}

export interface WorkflowStepData {
  step_name: string;
  step_description: string;
  step_status: 'started' | 'completed' | 'failed';
  step_data?: Record<string, unknown>;
  timestamp: string;
}

export interface AgentHandoffData {
  from_agent: string;
  to_agent: string;
  reason: string;
  handoff_data?: Record<string, unknown>;
  timestamp: string;
}

export interface WorkflowCompleteData {
  workflow_id: string;
  success: boolean;
  final_result: string;
  execution_time_ms: number;
  steps_completed: number;
  timestamp: string;
}

export interface ToolCallStartData {
  tool_name: string;
  tool_args: Record<string, unknown>;
  called_by_agent: string;
  timestamp: string;
}

export interface ToolCallCompleteData {
  tool_name: string;
  tool_result: unknown;
  success: boolean;
  execution_time_ms: number;
  called_by_agent: string;
  error?: string;
  timestamp: string;
}

// Error handling
export interface ErrorData {
  error: string;
  error_code?: string;
  session_id?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Chat message structure
export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

// Streaming callbacks for real-time chat functionality
export interface StreamingCallbacks {
  onChunk?: (data: MessageChunkData) => void;
  onComplete?: (data: MessageCompleteData) => void;
  onError?: (error: ErrorData) => void;
  // Enhanced UX events with proper types
  onWorkflowStarted?: (data: WorkflowStartedData) => void;
  onAgentThinking?: (data: AgentThinkingData) => void;
  onAgentReasoning?: (data: AgentReasoningData) => void;
  onStateUpdate?: (data: StateUpdateData) => void;
  onWorkflowStep?: (data: WorkflowStepData) => void;
  onAgentHandoff?: (data: AgentHandoffData) => void;
  onWorkflowComplete?: (data: WorkflowCompleteData) => void;
  onToolCallStart?: (data: ToolCallStartData) => void;
  onToolCallComplete?: (data: ToolCallCompleteData) => void;
}

// Chat UI components
export interface ChatOption {
  id: string;
  label: string;
  action: () => void;
}
