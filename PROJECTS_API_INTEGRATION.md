# Projects API Integration

This document describes the integration of the PostgreSQL projects API with the client onboarding portal.

## API Endpoint

**GET** `/projects/user/<user_id>/`

**Example:** `GET /projects/user/123/`

## Response Format

```json
{
    "success": true,
    "user": {
        "user_id": 123,
        "name": "John Doe",
        "email": "john@example.com",
        "tag": "CSA"
    },
    "projects": [
        {
            "project_id": 1,
            "project_name": "Project Alpha",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "domain": "Technology",
            "company_name": "Tech Corp",
            "user_role": "CSA",
            "company_id": 1
        }
    ],
    "count": 1
}
```

## Implementation Details

### 1. API Service Method

Added `getUserProjects(userId)` method to `src/services/api.js`:

```javascript
static async getUserProjects(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/user/${userId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user projects');
    }

    return data;
  } catch (error) {
    throw error;
  }
}
```

### 2. Data Transformation

The API response is transformed to match the existing project format:

```javascript
const transformedProjects = response.projects.map(project => ({
  id: project.project_id,
  title: project.project_name,
  description: `${project.domain} project for ${project.company_name}`,
  status: 'In Progress', // Default status
  projectId: `PROJ-${project.project_id.toString().padStart(3, '0')}`,
  startDate: project.start_date,
  endDate: project.end_date,
  domain: project.domain,
  company: project.company_name,
  userRole: project.user_role,
  companyId: project.company_id,
  // Default team members and timeline structure
  csaMembers: [],
  quadrantTeam: [],
  clientMembers: [],
  timeline: [...]
}));
```

### 3. Loading States

- **Loading State**: Shows spinner while fetching projects
- **Error State**: Shows error message with retry button
- **Empty State**: Shows message when no projects found
- **Success State**: Displays projects list

### 4. User Experience Features

- **Automatic Loading**: Projects load when portal is opened
- **Manual Refresh**: Refresh button in projects pane header
- **Error Handling**: Graceful fallback to sample projects if API fails
- **Loading Indicators**: Visual feedback during API calls

### 5. Integration Points

- **Portal Opening**: `handleOpenPortal()` function loads projects
- **Refresh Button**: Manual refresh capability
- **Error Retry**: Retry button for failed API calls

## Usage

1. User clicks "Take me to portal" or "View All Projects"
2. Portal opens and automatically loads projects from PostgreSQL
3. Projects are displayed in the left pane
4. User can click refresh button to reload projects
5. If API fails, error message is shown with retry option

## Error Handling

- Network errors are caught and displayed to user
- Fallback to sample projects if API is unavailable
- Retry functionality for failed requests
- Loading states prevent multiple simultaneous requests

## Future Enhancements

- Add project status from API response
- Include team members data from API
- Add project filtering and search
- Implement real-time project updates
- Add project creation integration

