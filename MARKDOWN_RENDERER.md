# MarkdownRenderer Component

A React component that renders Markdown content from chatbot responses with proper formatting.

## Features

- ✅ **Bold Text**: Renders `**text**` as **bold text**
- ✅ **Bullet Points**: Renders `•` and `-` as proper bullet lists
- ✅ **Line Breaks**: Preserves line breaks and paragraph spacing
- ✅ **Headings**: Supports `# ## ###` heading levels
- ✅ **Code Blocks**: Renders inline `code` and code blocks
- ✅ **Emojis**: Supports emoji rendering
- ✅ **Responsive**: Works on mobile and desktop

## Usage

### Basic Usage

```jsx
import MarkdownRenderer from './components/MarkdownRenderer';

function ChatMessage({ message }) {
  return (
    <div className="message">
      {message.isBot ? (
        <MarkdownRenderer text={message.text} />
      ) : (
        <span>{message.text}</span>
      )}
    </div>
  );
}
```

### With Custom Styling

```jsx
<MarkdownRenderer 
  text={botResponse} 
  className="custom-markdown-style" 
/>
```

## Supported Markdown Features

### Text Formatting
- `**bold text**` → **bold text**
- `*italic text*` → *italic text*
- `~~strikethrough~~` → ~~strikethrough~~

### Lists
- `• Item 1` → • Item 1
- `- Item 2` → - Item 2
- `1. Numbered item` → 1. Numbered item

### Headings
- `# Heading 1` → # Heading 1
- `## Heading 2` → ## Heading 2
- `### Heading 3` → ### Heading 3

### Code
- `` `inline code` `` → `inline code`
- ```code blocks``` → Code blocks

### Blockquotes
- `> Quote text` → > Quote text

## Integration with Chatbot

The component is already integrated into your chat application. Bot messages will automatically render with Markdown formatting, while user messages remain as plain text.

## Example Chatbot Response

```json
{
  "response": "🎯 **Project Creation Mode Activated**\n\nI'll help you create a new project! I need the following information:\n\n**Required:**\n• Project name\n• Start date (YYYY-MM-DD format)\n• Company ID\n\n**Optional:**\n• Project description/domain\n• End date (YYYY-MM-DD format)\n\n**Available Companies:**\nID: 1 - Example Company\n\nPlease provide the project name first."
}
```

This will render as:

🎯 **Project Creation Mode Activated**

I'll help you create a new project! I need the following information:

**Required:**
• Project name
• Start date (YYYY-MM-DD format)
• Company ID

**Optional:**
• Project description/domain
• End date (YYYY-MM-DD format)

**Available Companies:**
ID: 1 - Example Company

Please provide the project name first.

## Customization

You can customize the styling by modifying `src/components/MarkdownRenderer.css`. The component uses semantic class names for easy styling:

- `.markdown-content` - Main container
- `.markdown-bold` - Bold text
- `.markdown-list` - Unordered lists
- `.markdown-ordered-list` - Ordered lists
- `.markdown-heading` - All headings
- `.markdown-code` - Inline code
- `.markdown-pre` - Code blocks

## Dependencies

- `react-markdown` - For Markdown parsing and rendering
