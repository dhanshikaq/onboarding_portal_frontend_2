# Chat Features Documentation

## Overview
The client onboarding portal now includes a comprehensive chat system with multiple chat management capabilities.

## Features

### 1. Multiple Chat Management
- **Create New Chats**: Click the "New chat" button to create a new chat session
- **Switch Between Chats**: Click on any chat in the left sidebar to switch to it
- **Delete Chats**: Hover over a chat and click the trash icon to delete it (minimum 1 chat required)

### 2. Chat Organization
- **Chat List**: All chats are displayed in the left sidebar with project names
- **Chat Counter**: Shows total number of active chats in the header
- **Chat Preview**: Displays the last message preview for each chat
- **Timestamps**: Shows relative time since last message (e.g., "2h ago", "Just now")

### 3. Interactive Features
- **Rename Chats**: Double-click on any chat name to rename it
- **Unread Indicators**: Red badges show unread message counts
- **Active Chat Highlighting**: Current active chat is highlighted with blue border
- **Hover Effects**: Smooth animations and visual feedback on interactions

### 4. Message Management
- **Real-time Updates**: Messages update in real-time across all chats
- **Typing Indicator**: Shows when the AI is responding
- **Message History**: Each chat maintains its own message history
- **Auto-scroll**: Chat automatically scrolls to show new messages

### 5. User Experience
- **Responsive Design**: Works on different screen sizes
- **Smooth Animations**: CSS transitions and hover effects
- **Visual Feedback**: Clear indicators for active states and interactions
- **Accessibility**: Proper titles and keyboard navigation support

## Usage Instructions

### Creating a New Chat
1. Click the "New chat" button in the sidebar menu
2. A new chat will be created and automatically selected
3. The chat will appear in the left sidebar with a unique avatar

### Switching Between Chats
1. Click on any chat in the left sidebar
2. The selected chat will become active (highlighted in blue)
3. The chat content will switch to show that chat's messages

### Managing Chats
1. **Rename**: Double-click on a chat name to edit it
2. **Delete**: Hover over a chat and click the trash icon
3. **Search**: Use the search bar to find specific chats

### Sending Messages
1. Type your message in the input field
2. Press Enter or click the send button
3. The AI will respond with a demo message
4. Other chats will show unread indicators

## Technical Details

### State Management
- Uses React useState hooks for chat management
- Each chat maintains its own message array and metadata
- Global state tracks current active chat and typing status

### Data Structure
```javascript
{
  id: number,
  name: string,
  preview: string,
  avatar: string,
  messages: Array<Message>,
  isActive: boolean,
  unreadCount: number
}
```

### Performance Features
- Efficient chat switching without re-rendering all messages
- Optimized message updates with proper state management
- Smooth animations using CSS transitions

## Future Enhancements
- Chat search and filtering
- Chat categories and tags
- Message threading and replies
- File attachments and media sharing
- Chat export and backup
- Real-time collaboration features

