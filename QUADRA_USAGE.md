# Main Chat SOW Flow - Usage Guide

## Overview
The main chat now includes a hardcoded flow for project creation and SOW (Statement of Work) management, triggered by a specific prompt. When triggered, it automatically creates a project in the project portal with all the extracted details.

## Features
- **Exact Prompt Recognition**: Responds only to the specific trigger prompt
- **Automatic Project Creation**: Creates project in portal with extracted details
- **Thinking Process**: Step-by-step processing with visual indicators
- **SOW File Generation**: Provides the actual attached PDF file (generated_sow.pdf)
- **Approval Workflow**: Handles user approval and confirmation

## How to Use

### 1. Access the Flow
- Log into the application
- The flow is available directly in the main chat interface

### 2. Trigger the SOW Generation
Enter this exact prompt (copy-paste recommended) in the main chat area:
```
Create a project Agentic AI Platform with quadrant email id as sahil.d@quadranttechnologies.com , dhanshika.v@quadranttechnologies.com CSA as abc@microsft.com and client with xyz@email.com and qwerty@email.com (POC)
```

**Note**: This will automatically trigger the SOW creation flow in the main chat.

### 3. Wait for Processing
- **Step 1**: "Agentic AI Platform is getting created" appears in grey scale for 4 seconds
- **Step 2**: "Creating the SOW" appears in grey scale for 5-6 seconds
- **Project Creation**: Automatically creates project in portal with extracted details
- Input is disabled during processing

### 4. Review SOW
- After processing, Quadra will display the SOW file
- **Click on the file info** (paperclip icon, filename, size) to open document previewer
- **Click "Download SOW"** to download the actual PDF document
- The message "Please review and approve this SOW" will appear

### 5. Approve the SOW
- Type exactly: `approve`
- Quadra will respond: "SOW is sent to client@email.com"

## Technical Details

### Integration
- **Main Chat Integration**: The trigger prompt is entered directly in the main chat area
- **Automatic Flow**: Entering the exact prompt automatically triggers the SOW creation flow
- **Seamless Experience**: Users can interact with the flow without leaving the main chat interface

### Hardcoded Behavior
- **No AI Processing**: All responses are predetermined
- **Exact Match Required**: The trigger prompt must match exactly
- **Fixed Timers**: Step 1 (4 seconds), Step 2 (5-6 seconds)
- **File Generation**: Provides the actual attached PDF file from assets folder

### Implementation
- **Main Chat Logic**: All flow logic is implemented directly in App.js
- **Project Creation**: Automatic project creation with email parsing and team member generation
- **File Handling**: SOW file preview and download functionality integrated into main chat
- **Document Previewer**: Clean, modal-based PDF viewer with download option
- **Styling**: File message, processing message, and previewer styles added to App.css

### State Management
- Message history persistence
- Processing state management
- Input validation and handling

## Testing

### Valid Test Cases
1. **Exact Trigger Prompt**: Should work every time
2. **Approval Response**: Should confirm SOW delivery
3. **New Sessions**: Functionality resets for fresh conversations

### Invalid Test Cases
1. **Similar Prompts**: Won't trigger (e.g., missing commas, different spacing)
2. **Partial Matches**: Won't work
3. **Other Messages**: Will get default response

## File Structure
```
src/
├── components/
│   └── DocumentPreviewer.js  # Document previewer component
├── assets/
│   └── generated_sow.pdf     # Source SOW PDF file
├── App.js                    # Main app with integrated SOW flow
└── App.css                  # Main app styling with file message support
public/
└── generated_sow.pdf         # SOW PDF file for browser access
```

## Notes
- The word "demo" is never mentioned in the component
- All functionality is hardcoded as specified
- The component maintains chat history within each session
- Responsive design for mobile and desktop use
