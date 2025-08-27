const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_id: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user data');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send a chat message to the chatbot API
   * @param {string} userId - User ID
   * @param {string} role - User role (e.g., 'client', 'admin')
   * @param {string} message - User message
   * @param {Object} conversationState - Current conversation state
   * @param {number} sessionId - Optional session ID for continuing existing session
   * @param {number} projectId - Optional project ID to link conversation to specific project
   * @returns {Promise<Object>} Response with format:
   * {
   *   success: boolean,
   *   response: string,
   *   conversation_state: Object,
   *   session_id: number,  // NEW: Session ID for tracking
   *   user_projects_count: number,
   *   context_used: Object
   * }
   */
  static async sendChatMessage(userId, role, message, conversationState = {}, sessionId = null, projectId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          role: role,
          message: message,
          conversation_state: {
            ...conversationState,
            ...(sessionId && { session_id: sessionId })
          },
          ...(projectId && { project_id: projectId })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Chat request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

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

  /**
   * Get user sessions from the chatbot API
   * @param {number} userId - User ID to get sessions for
   * @param {Object} options - Optional parameters
   * @param {number} options.limit - Number of sessions to return (default: 10)
   * @param {number} options.projectId - Filter sessions by specific project ID
   * @returns {Promise<Object>} Response with format:
   * {
   *   success: boolean,
   *   user_id: number,
   *   sessions: Array<{
   *     session_id: number,
   *     project_id: number,
   *     project_name: string,
   *     started_at: string,
   *     last_activity: string,
   *     message_count: number,
   *     is_active: boolean
   *   }>,
   *   total_sessions: number
   * }
   */
  static async getUserSessions(userId, options = {}) {
    try {
      const { limit, projectId } = options;
      let url = `${API_BASE_URL}/chatbot/sessions/${userId}/`;
      
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (projectId) params.append('project_id', projectId.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user sessions');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get conversation history for a specific session
   * @param {number} sessionId - Session ID to get conversation for
   * @returns {Promise<Object>} Response with format:
   * {
   *   success: boolean,
   *   session: {
   *     session_id: number,
   *     user_id: number,
   *     project_id: number,
   *     project_name: string,
   *     started_at: string,
   *     context: string
   *   }
   * }
   */
  static async getSessionConversation(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/session/${sessionId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get session conversation');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default ApiService;
