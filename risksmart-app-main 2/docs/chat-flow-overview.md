# Complete Chat Flow Walkthrough

## 1. **App Startup & Socket Initialization**

**User logs in:**

- Auth0 authenticates the user
- `ProtectedLayout` component mounts
- `useChatSocketInitializer` hook is called with:
  - `isAuthenticated: true`
  - `isChatFeatureEnabled: true` (from feature flags)
  - `getAccessToken` function from Auth0

**Socket connection process:**

- Initializer calls `updateAuthState` in Zustand store
- Initializer calls `connect()` method
- Connection manager checks: not already connected? proceed
- Fetches JWT token from Auth0
- Creates Socket.IO instance with token in auth headers
- Configures transports (websocket, polling fallback)
- Sets `autoConnect: true`
- Registers event handlers for connect, disconnect, errors
- Socket.IO initiates connection to backend

**Backend authenticates:**

- Receives connection request with JWT
- Validates token
- Checks user has chat feature flag
- Accepts connection
- Socket.IO emits 'connect' event

**'connect' event handler fires:**

- Sets `isConnected = true` in Zustand
- Resets reconnection attempt counter
- Logs "Socket.IO connected to chat service"
- If there was a previous active session, attempts to rejoin it

---

## 2. **User Opens Chat Panel**

**User clicks chat icon:**

- `setIsOpen(true)` is called in `useChatStore`
- `Chat` component renders
- `ChatPanel` component mounts
- `useChatSession` hook starts running

**Session initialization check:**

- Hook checks conditions:
  - Is chat open? ✅
  - Already have a session? ❌
  - Is session initialized? ❌
  - Is socket connected? ✅
  - Already initializing? ❌
- All conditions met → proceed with initialization

**Session creation:**

- Sets `isInitialising = true` (shows loading spinner)
- Generates unique session ID (timestamp + random string)
- Gets user ID from authenticated user context
- Prepares conversation context (source: risksmart_web, etc)
- Emits 'join_conversation' event to backend with:
  - session_id
  - user_id
  - context object

**Backend processes join:**

- Receives 'join_conversation' event
- Creates conversation room for this session
- Joins socket to that room
- Emits 'conversation_joined' confirmation back
- Returns session metadata

**'conversation_joined' response:**

- Client receives confirmation
- Stores active session in Zustand socket store
- Marks session as joined
- Sets `sessionInitialized = true`
- Displays welcome message with example prompts
- Sets `isInitialising = false` (hides spinner)
- Chat UI is now ready

---

## 3. **User Sends First Message**

**User types message and hits send:**

- Input validation: not empty, not loading, have session ID
- Clears input field immediately
- Removes system welcome message from UI
- Clears example option buttons
- Adds user message to chat UI
- Sets `isLoading = true` (shows typing indicator)

**Message invocation:**

- Calls `invoke()` method from chat service
- Checks socket is connected
- Checks user is authenticated
- Prepares message object:
  - role: "user"
  - content: user's text
  - timestamp: ISO string
- Wraps in send data with session_id
- Emits 'send_message' event to backend

**Backend processing:**

- Receives message in conversation room
- Passes to LangGraph workflow
- AI agent starts processing
- May emit intermediate events:
  - 'workflow_started': AI begins thinking
  - 'agent_thinking': Shows reasoning
  - 'tool_call_start': AI is using a tool
  - 'state_update': Workflow state changed

**Streaming response:**

- Backend emits 'message_chunk' events with partial text
- Client accumulates chunks
- Updates UI incrementally (streaming effect)
- User sees response being "typed"

**Response completion:**

- Backend emits 'message_complete' event
- Client receives final message
- Adds complete AI response to chat UI
- Sets `isLoading = false`
- Input field enabled again
- User can send another message

---

## 4. **Conversation Continues**

**User sends follow-up messages:**

- Same flow as first message
- Same session ID used throughout
- Context is maintained on backend
- AI has conversation history
- Responses stay in same conversation

**Multiple messages:**

- Each message goes through:
  - Input → Validation → Emit
  - Backend processing
  - Streaming response
  - UI update
- All using the persistent socket connection
- No reconnections needed

---

## 5. **User Clicks "New Chat"**

**New chat button handler:**

- Clears all messages from UI state
- Clears option buttons
- Calls `clearSession()` → sets `activeSession = null` in socket store
- Sets `sessionId = null` in chat store
- Sets `sessionInitialized = false`
- **Socket stays connected** (important!)

**UI resets:**

- Empty message list
- No welcome message yet
- Input is disabled (no session)
- Chat panel still open

**Next message creates new session:**

- When user types and sends
- `useChatSession` sees: no session, not initialized
- Creates brand new session ID
- Emits new 'join_conversation'
- Gets new 'conversation_joined' confirmation
- Shows welcome message again
- Fresh conversation starts

---

## 6. **User Navigates Around App**

**Moving between protected routes:**

- User goes from Dashboard → Risks → Controls
- All use `ProtectedLayout`
- Layout component stays mounted
- `useChatSocketInitializer` stays mounted
- Socket connection persists
- If chat was open, active session persists
- Can continue conversation after navigation

**Layout doesn't unmount:**

- Only the `Outlet` content changes
- Socket initializer never triggers cleanup
- Connection remains stable
- Chat state preserved

---

## 7. **Connection Issues & Recovery**

**Network drops temporarily:**

- Socket.IO detects disconnection
- 'disconnect' event fires
- Sets `isConnected = false`
- Chat UI shows "not connected" state
- Connection manager schedules reconnection

**Reconnection with exponential backoff:**

- First attempt: 1 second delay
- Second attempt: 2 seconds delay
- Third attempt: 4 seconds delay
- Fourth attempt: 8 seconds delay
- Fifth attempt: 16 seconds delay
- Max 5 attempts

**Successful reconnection:**

- Gets fresh JWT token from Auth0
- Creates new socket instance
- Socket.IO reconnects
- 'connect' event fires again
- Sets `isConnected = true`
- If had active session, rejoins conversation room
- Emits 'join_conversation' with stored session ID
- Backend confirms, chat continues where it left off

**Authentication error:**

- If token expired or invalid
- 'auth_error' event fires
- Triggers reconnection with fresh token
- Uses stored `getAccessToken` function
- Gets new token, tries again

---

## 8. **User Logs Out**

**Logout initiated:**

- Auth state becomes `isAuthenticated = false`
- `useChatSocketInitializer` effect re-runs
- Calls `updateAuthState(false, false)`
- Connection manager auto-disconnects
- Socket.IO closes connection
- `ProtectedLayout` unmounts
- Cleanup effect runs
- Ensures socket is fully closed

**State reset:**

- Zustand store calls `reset()` method
- Clears socket instance
- Resets all flags
- Clears active session
- Reconnection attempts reset

**User redirected:**

- Navigates to login page
- Different layout (not `ProtectedLayout`)
- No socket initialization
- Clean slate

---

## 9. **Error Scenarios**

**Backend not running:**

- Socket.IO can't connect
- 'connect_error' event fires
- Connection manager schedules reconnection
- Retries with exponential backoff
- UI shows "connecting..." or "disconnected"

**Chat feature disabled:**

- Feature flag becomes false
- `updateAuthState(true, false)` called
- Auto-disconnects socket
- Chat UI hidden or disabled

**Join conversation timeout:**

- Emit 'join_conversation' but no response
- Promise rejects after 10 seconds
- Shows error message to user
- Can try again or create new session

**Server error during message:**

- 'error' event from backend
- Logged to console
- UI shows error message
- Chat remains functional for retry

---

## Key Principles Throughout

**Single Persistent Connection:**

- One socket for entire authenticated session
- Never disconnect/reconnect unnecessarily
- Sessions are lightweight on top of connection

**Deduplication:**

- Check before connecting (already connected?)
- Check before initializing session (already have one?)
- Ref flags prevent race conditions

**State Separation:**

- Socket state: in Zustand (global, persistent)
- Chat UI state: in chat store (messages, options)
- Session state: in socket store (active conversation)
- Auth state: from Auth0 context

**Resilience:**

- Auto-reconnection on failures
- Rejoins active sessions after reconnect
- Exponential backoff prevents spam
- Clean error handling

**Performance:**

- Imperative store access (no unnecessary re-renders)
- Streaming responses (chunks, not waiting for full response)
- Minimal dependencies in effects
- Singleton socket instance
