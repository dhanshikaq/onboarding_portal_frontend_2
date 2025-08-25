# Login API Integration

This document describes the login API integration implemented in the React application.

## API Endpoint

- **URL**: `http://localhost:8000/api/users/login/`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Request Format

```json
{
  "email_id": "user@example.com",
  "password": "userpassword"
}
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email_id": "user@example.com",
    "phone_number": "1234567890",
    "tag": "client"
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Features Implemented

### 1. Login Form
- Email and password input fields
- Form validation
- Loading state during API calls
- Error message display
- Disabled form during submission

### 2. User Session Management
- Automatic login check on app startup
- User data persistence in localStorage
- Session restoration after page refresh
- Secure logout functionality

### 3. User Interface Updates
- Dynamic user name display (first_name + last_name)
- User role/tag display
- User avatar with initials
- Logout button in user profile

### 4. API Service Layer
- Centralized API calls in `src/services/api.js`
- Error handling and response parsing
- Reusable service methods

## File Structure

```
src/
├── App.js                 # Main application component with login logic
├── App.css               # Styles for login form and user interface
├── services/
│   └── api.js           # API service layer
└── components/
    └── DocumentPreviewer.js
```

## Usage

### Testing the Login

1. Start your backend server on `http://localhost:8000`
2. Start the React development server: `npm start`
3. Navigate to the login page
4. Enter valid credentials:
   - Email: `user@example.com`
   - Password: `userpassword`

### Expected Behavior

- **Successful Login**: User is redirected to the chat interface with their name displayed
- **Failed Login**: Error message is shown below the form
- **Network Error**: Generic error message for connection issues
- **Session Persistence**: User remains logged in after page refresh

## Security Considerations

- User credentials are sent over HTTPS (in production)
- No sensitive data is stored in localStorage (only user profile info)
- Logout clears all session data
- API errors are handled gracefully

## Future Enhancements

- JWT token authentication
- Refresh token mechanism
- Password reset functionality
- Remember me feature
- Multi-factor authentication
- Session timeout handling
