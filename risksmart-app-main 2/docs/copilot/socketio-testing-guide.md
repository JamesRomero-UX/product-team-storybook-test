# Socket.IO Testing Guide for Insomnia

This guide provides comprehensive testing instructions for the RiskSmart Socket.IO Chat Agent implementation using Insomnia.

## 🚀 Quick Setup

### 1. Import the Collection

1. Open Insomnia
2. Go to `Application Menu` → `Import/Export` → `Import Data`
3. Select `From File` and choose `insomnia-socketio-tests.json`
4. The collection will be imported with all endpoints and WebSocket connections

### 2. Configure Environment Variables

Update these environment variables in Insomnia:

```json
{
  "BASE_URL": "http://localhost:8427",
  "SOCKETIO_URL": "ws://localhost:8427",
  "AUTH_TOKEN": "your_actual_jwt_token_here",
  "SESSION_ID": "test-session-123",
  "USER_ID": "test-user-456"
}
```

### 3. Get a Valid JWT Token

Your JWT token must include these claims:

- `x-hasura-features`: `["AIE_CHAT"]` (required for chat access)
- `sub`: Auth0 user ID (e.g., `"auth0|123456789"`)
- Standard JWT claims: `aud`, `iss`, `exp`, `iat`

## 🧪 Testing Workflow

### Phase 1: Service Health Check

1. **Health Check** - Verify service is running
2. **Detailed Health Check** - Check Socket.IO specific health
3. **OpenAPI Docs** - Verify API documentation is accessible

### Phase 2: Socket.IO Connection Testing

#### Test Successful Authentication

1. **Socket.IO Connection (Basic)** - Auth via query parameter (EIO v4)

   ```
   ws://localhost:8427/socket.io/?transport=websocket&token=your_jwt_token&EIO=4
   ```

2. **Socket.IO Connection (Polling First)** - Start with polling transport

   ```
   ws://localhost:8427/socket.io/?transport=polling&token=your_jwt_token&EIO=4
   ```

3. **Socket.IO Connection (Protocol v3)** - For older clients

   ```
   ws://localhost:8427/socket.io/?transport=websocket&token=your_jwt_token&EIO=3
   ```

4. **Socket.IO Connection (Header Auth)** - Auth via custom header

   ```
   Header: X-SocketIO-Auth: your_jwt_token
   URL: ws://localhost:8427/socket.io/?transport=websocket&EIO=4
   ```

5. **Socket.IO Connection (Bearer Auth)** - Auth via Authorization header
   ```
   Header: Authorization: Bearer your_jwt_token
   URL: ws://localhost:8427/socket.io/?transport=websocket&EIO=4
   ```

#### Test Authentication Failures

1. **No Auth Connection** - Should fail with auth error
2. **Invalid Token Connection** - Should fail with token validation error

### Phase 3: Socket.IO Event Testing

Once connected successfully, test these events in order:

#### 1. Join Conversation

**Send Event:** `join_conversation`

```json
{
  "session_id": "test-session-123",
  "user_id": "test-user-456",
  "context": {
    "source": "insomnia_test",
    "timestamp": "2025-07-31T13:45:00Z"
  }
}
```

**Expected Response:** `conversation_joined`

```json
{
  "session_id": "test-session-123",
  "user_id": "test-user-456",
  "room_id": "test-session-123",
  "participants": ["test-user-456"],
  "timestamp": "2025-07-31T13:45:00Z"
}
```

#### 2. Send Message

**Send Event:** `send_message`

```json
{
  "session_id": "test-session-123",
  "message": {
    "role": "user",
    "content": "Hello, can you help me with risk management?",
    "timestamp": "2025-07-31T13:45:00Z",
    "metadata": {
      "source": "insomnia_test"
    }
  },
  "context": {
    "conversation_history": [],
    "user_preferences": {}
  }
}
```

**Expected Responses:**

1. Multiple `message_chunk` events (streaming response)
2. Final `message_complete` event

#### 3. Typing Indicators

**Send Events:**

- `typing_start` - User starts typing
- `typing_stop` - User stops typing

**Expected Response:** `user_typing` (if other users are in room)

#### 4. Leave Conversation

**Send Event:** `leave_conversation`

```json
{
  "session_id": "test-session-123",
  "user_id": "test-user-456"
}
```

**Expected Response:** `conversation_left`

## 📊 Expected Server Events

### Connection Established

Received immediately after successful connection:

```json
{
  "connection_id": "socket_abc123",
  "user_id": "test-user-456",
  "server_timestamp": "2025-07-31T13:45:00Z",
  "server_info": {
    "version": "1.0.0",
    "features": ["real_time_chat", "streaming_responses"],
    "node_type": "single_node"
  }
}
```

### Message Streaming

Multiple chunks followed by completion:

**Message Chunk:**

```json
{
  "session_id": "test-session-123",
  "chunk_id": "chunk_001",
  "content": "Hello! I'd be happy to help",
  "chunk_index": 0,
  "is_final": false,
  "metadata": {
    "model": "gpt-4",
    "processing_time_ms": 150
  }
}
```

**Message Complete:**

```json
{
  "session_id": "test-session-123",
  "message": {
    "role": "assistant",
    "content": "Complete AI response here...",
    "timestamp": "2025-07-31T13:45:00Z"
  },
  "response_id": "resp_123",
  "total_chunks": 5,
  "metadata": {
    "processing_time_ms": 2000,
    "model": "gpt-4"
  }
}
```

### Error Events

Authentication or validation failures:

```json
{
  "error": "Authentication required",
  "error_code": "AUTH_REQUIRED",
  "session_id": null,
  "details": {
    "required_permission": "AIE_CHAT"
  },
  "timestamp": "2025-07-31T13:45:00Z"
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**

   - Verify chat agent is running: `uv run uvicorn app.main:app --host 0.0.0.0 --port 8427`
   - Check port 8427 is available

2. **Protocol Version Error**

   - Error: "The client is using an unsupported version of the Socket.IO or Engine.IO protocols"
   - Solution: Add `&EIO=4` or `&EIO=3` to connection URL
   - Test different Engine.IO versions (4 for modern, 3 for legacy clients)

3. **Authentication Failed**

   - Verify JWT token is valid and not expired
   - Ensure `x-hasura-features` includes `"AIE_CHAT"`
   - Check Auth0 configuration

4. **Events Not Working**

   - Ensure connection is established first
   - Join conversation before sending messages
   - Check event names match exactly (case-sensitive)

5. **No Streaming Response**
   - Verify LangGraph workflow is configured
   - Check server logs for workflow errors
   - Ensure proper message format

### Debug Commands

Check service status:

```bash
# Health check
curl http://localhost:8427/ai-engine/chat-agent/health

# Check if service is running
lsof -i :8427
```

View server logs:

```bash
cd /path/to/chat-agent
uv run uvicorn app.main:app --host 0.0.0.0 --port 8427 --log-level debug
```

## 🎯 Advanced Testing Scenarios

### Multi-User Chat

1. Open multiple WebSocket connections with different user IDs
2. Join same session from both connections
3. Send messages and observe cross-user events

### Error Handling

1. Send malformed JSON
2. Use invalid session IDs
3. Send events without joining conversation first
4. Test with expired JWT tokens

### Performance Testing

1. Send rapid typing events
2. Send long messages to test chunking
3. Join/leave conversations repeatedly
4. Test connection recovery

## 📝 Test Results Template

Document your test results:

```
✅ Health Check: PASS
✅ Socket.IO Connection (Query Auth): PASS
✅ Socket.IO Connection (Header Auth): PASS
✅ Socket.IO Connection (Bearer Auth): PASS
❌ No Auth Connection: FAIL (Expected - should reject)
❌ Invalid Token Connection: FAIL (Expected - should reject)
✅ Join Conversation: PASS
✅ Send Message: PASS
✅ Message Streaming: PASS
✅ Typing Indicators: PASS
✅ Leave Conversation: PASS
```

This comprehensive testing setup will validate all aspects of your Socket.IO implementation including authentication, real-time messaging, streaming responses, and error handling.
