# Chatbot API Integration

This document describes the integration of the chatbot API into the React application.

## API Endpoint

- **URL**: `POST /api/chatbot/chat/`
- **Base URL**: `http://localhost:8000/api/chatbot/chat/`
- **Headers**: `{"Content-Type": "application/json"}`

## Request Format

```json
{
    "userId": 1,
    "role": "client",
    "message": "Hello, I need help creating a new project",
    "conversation_state": {}
}
```

## Response Format

```json
{
    "success": true,
    "response": "🎯 **Project Creation Mode Activated**\n\nI'll help you create a new project! I need the following information:\n\n**Required:**\n• Project name\n• Start date (YYYY-MM-DD format)\n• Company ID\n\n**Optional:**\n• Project description/domain\n• End date (YYYY-MM-DD format)\n\n**Available Companies:**\nID: 1 - Example Company\n\nPlease provide the project name first.",
    "conversation_state": {
        "creating_project": true,
        "collected_params": {},
        "missing_params": ["project_name", "start_date", "company_id"]
    },
    "user_projects_count": 3,
    "context_used": {
        "user_role": "client",
        "projects_accessed": 3
    }
}
```

## Implementation Details

### Files Modified

1. **`src/services/api.js`**
   - Added `sendChatMessage()` method to handle chatbot API calls
   - Method accepts `userId`, `role`, `message`, and `conversationState` parameters

2. **`src/App.js`**
   - Added `conversationStates` state to track conversation context for each chat
   - Modified `handleSendMessage()` to use real chatbot API instead of mock responses
   - Updated `createNewChat()` to initialize conversation states for new chats
   - Added error handling for API failures with fallback responses

### Key Features

1. **Conversation State Management**
   - Each chat maintains its own conversation state
   - State is preserved across messages within the same chat
   - New chats start with empty conversation state

2. **User Context**
   - Uses logged-in user's `user_id` and `tag` (role) from login response
   - Passes user context to chatbot for personalized responses

3. **Error Handling**
   - Graceful fallback when API is unavailable
   - User-friendly error messages
   - Continues chat functionality even during API issues

4. **Special Commands**
   - Preserved existing Quadra trigger functionality
   - Maintained approval flow for SOW documents
   - These special cases bypass the chatbot API

### Usage

1. **Normal Chat**: Users can send any message and receive AI-powered responses
2. **Project Creation**: Chatbot can guide users through project creation process
3. **Context Awareness**: Bot remembers conversation context within each chat session

### Security Considerations

- User authentication required before chat access
- User ID and role validated from login session
- API calls include proper error handling

### Future Enhancements

1. **Message History**: Persist conversation states across sessions
2. **File Uploads**: Support for document sharing in chat
3. **Real-time Updates**: WebSocket integration for live responses
4. **Multi-language Support**: Internationalization for chatbot responses
5. **Analytics**: Track chat usage and user interactions

## Testing

To test the chatbot integration:

1. Ensure backend server is running on `http://localhost:8000`
2. Login with valid credentials
3. Send messages in any chat
4. Verify responses come from the chatbot API
5. Test conversation state persistence across multiple messages

## Troubleshooting

- **API Connection Issues**: Check if backend server is running
- **Authentication Errors**: Ensure user is properly logged in
- **Response Format Issues**: Verify API response matches expected format
- **State Management**: Check browser console for conversation state errors
