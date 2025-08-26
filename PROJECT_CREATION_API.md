# Project Creation API Integration

This document explains how the project creation API has been integrated into the frontend application.

## API Endpoint

**POST** `/api/projects/create/`

## Request Format

The API expects a JSON payload with the following structure:

```json
{
  "company": {
    "company_id": "optional_existing_company_id",
    "company_name": "required_if_new_company",
    "ceo_name": "optional",
    "ceo_email": "optional", 
    "sector": "optional"
  },
  "project": {
    "project_name": "required",
    "start_date": "required_YYYY-MM-DD",
    "end_date": "optional_YYYY-MM-DD",
    "domain": "optional"
  },
  "user_assignments": [
    {
      "user_id": "required",
      "role": "optional"
    }
  ]
}
```

## Response Format

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project_id": 123,
    "company_id": "COMP001",
    "user_assignments": [...]
  }
}
```

## Integration Points

### 1. API Service (`src/services/api.js`)

Added a new method `createProject(projectData)` that handles the API call:

```javascript
static async createProject(projectData) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Project creation failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}
```

### 2. Client Onboarding Form

The onboarding form in the portal now calls the API when submitting:

- **Location**: `src/App.js` - `handleOnboardingSubmit` function
- **Data Mapping**: Form data is mapped to the API format
- **Error Handling**: Displays success/error messages to the user
- **Loading State**: Shows loading indicator during API call

### 3. Quadra Chat Integration

The Quadra prompt also creates projects via API:

- **Trigger**: Specific chat message format
- **Email Extraction**: Parses emails from the prompt
- **User Assignment**: Maps emails to different roles (CSA, Quadrant, Client)
- **Fallback**: Creates project locally if API fails

## Usage Examples

### 1. Manual Project Creation

1. Navigate to the portal
2. Click "Client Onboarding" button
3. Fill out the 3-step form:
   - Step 1: Select company
   - Step 2: Enter project details
   - Step 3: Assign users (optional)
4. Click "Complete Onboarding"

### 2. Quadra Chat Creation

Send this exact message in the chat:
```
Create a project Agentic AI Platform with quadrant email id as sahil.d@quadranttechnologies.com , dhanshika.v@quadranttechnologies.com CSA as abc@microsft.com and client with xyz@email.com and qwerty@email.com (POC)
```

## Error Handling

- **API Errors**: Displayed as alerts to the user
- **Network Errors**: Graceful fallback with local project creation
- **Validation Errors**: Form validation prevents invalid submissions
- **Loading States**: UI shows loading indicators during API calls

## Configuration

The API base URL is configured in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

Update this URL to match your backend server configuration.

## Testing

1. Start your backend server
2. Ensure the API endpoint is accessible
3. Test both manual creation and Quadra chat creation
4. Verify projects appear in the portal after creation
5. Check console logs for API responses

## Future Enhancements

- Add user search/selection in the onboarding form
- Implement company search functionality
- Add project templates
- Support for bulk user assignments
- Real-time project status updates
