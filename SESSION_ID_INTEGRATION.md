# Session ID Integration

## Overview
The chat API has been updated to support session tracking using a `session_id` field. This allows for better conversation continuity and session management.

## API Request/Response Format Changes

### Old Request Format
```json
{
  "userId": 1,
  "role": "Admin",
  "message": "Hello",
  "conversation_state": {...}
}
```

### New Request Format (after first message)
```json
{
  "userId": 1,
  "role": "Admin", 
  "message": "Hello",
  "conversation_state": {
    "session_id": 123  // ← Include this for conversation continuity
  },
  "project_id": 5  // ← Optional: Link conversation to specific project
}
```

### Old Response Format
```json
{
  "success": true,
  "response": "Bot response message",
  "conversation_state": {...},
  "user_projects_count": 5,
  "context_used": {...}
}
```

### New Response Format
```json
{
  "success": true,
  "response": "Bot response message",
  "conversation_state": {...},
  "session_id": 123,  // NEW: Session ID for tracking
  "user_projects_count": 5,
  "context_used": {...}
}
```

## Frontend Implementation

### State Management
- Added `sessionIds` state to track session IDs for each chat
- Added `projectIds` state to track project IDs for each chat
- Session IDs and Project IDs are stored per chat ID for multi-chat support

### API Integration
- Updated `ApiService.sendChatMessage()` to accept optional `sessionId` and `projectId` parameters
- Session ID is included in conversation_state when available
- Project ID is included as a separate field when available
- Session ID is stored from API responses

### Chat Lifecycle
1. **New Chat Creation**: Session ID and Project ID are initialized as `null`
2. **First Message**: API returns a new session ID which is stored
3. **Subsequent Messages**: Stored session ID is sent in conversation_state, project ID is sent separately
4. **Project Linking**: Chats can be linked to specific projects using `linkChatToProject()`
5. **Chat Deletion**: Session ID and Project ID are cleaned up from state

### Code Changes
- `src/services/api.js`: Updated `sendChatMessage()` method to include session_id in conversation_state and project_id as separate field
- `src/App.js`: Added session ID and project ID state management and handling

## Benefits
- **Conversation Continuity**: Maintains context across multiple messages
- **Session Tracking**: Better analytics and debugging capabilities
- **Project Linking**: Conversations can be linked to specific projects
- **Multi-Chat Support**: Each chat maintains its own session and project association
- **Backward Compatibility**: Works with existing API responses

## Usage
The session ID integration is automatic and transparent to users. No additional configuration is required.

## Session Navigation
Users can click on any session in the "Recent Sessions" sidebar to navigate to that specific conversation:

1. **Existing Chat**: If a chat already exists for the selected session, the app switches to that chat
2. **New Chat**: If no chat exists for the session, a new chat is created with:
   - Session ID pre-populated for conversation continuity
   - Project ID linked (if available)
   - Chat name set to the project name from the session
   - **Conversation history loaded from API** - The actual messages from the session are fetched and displayed
   - Message count updated based on actual conversation length

This allows users to quickly resume previous conversations with full context and history.

## Sessions API

### Get User Sessions
**Endpoint:** `GET /api/chatbot/sessions/{user_id}/`

**URL Parameters:**
- `user_id` (required): Integer - The user ID to get sessions for

**Query Parameters:**
- `limit` (optional): Integer - Number of sessions to return (default: 10)
- `project_id` (optional): Integer - Filter sessions by specific project ID

**Example URLs:**
```
GET /api/chatbot/sessions/1/
GET /api/chatbot/sessions/1/?limit=5
GET /api/chatbot/sessions/1/?project_id=123
GET /api/chatbot/sessions/1/?limit=5&project_id=123
```

**Response Format:**
```json
{
  "success": true,
  "user_id": 1,
  "sessions": [
    {
      "session_id": 8,
      "project_id": 1,
      "project_name": "General Chat - John",
      "started_at": "2025-08-26T15:19:17.123456",
      "last_activity": "2025-08-26T15:24:08.654321",
      "message_count": 4,
      "is_active": true
    }
  ],
  "total_sessions": 1
}
```

### Get Session Conversation
**Endpoint:** `GET /api/chatbot/session/{session_id}/`

**URL Parameters:**
- `session_id` (required): Integer - The session ID to get conversation for

**Example URL:**
```
GET /api/chatbot/session/8/
```

**Response Format:**
```json
{
  "success": true,
  "session": {
    "session_id": 8,
    "user_id": 1,
    "project_id": 1,
    "project_name": "General Chat - John",
    "started_at": "2025-08-26T15:19:17.123456",
    "context": "user: Hello, this is a test message\nbot: Hi! How can I help you today?\nuser: This is my second message\nbot: I understand you're testing the system..."
  }
}
```

### Frontend Integration
- Added `getUserSessions()` method to `ApiService`
- Added `getSessionConversation()` method to `ApiService` for fetching conversation history
- Sessions are automatically loaded when user logs in
- Sessions are refreshed after each chat message
- Sessions are displayed in the right sidebar with project names, status, and activity info
- Supports filtering by project ID and limiting results
- **Session Navigation**: Clicking on a session in the "Recent Sessions" sidebar navigates to that specific chat
  - If a chat already exists for that session, it switches to that chat
  - If no chat exists, it creates a new chat with the session ID and project ID pre-populated
  - **Conversation history is automatically loaded** from the API and displayed in the chat
