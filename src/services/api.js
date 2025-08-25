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

  static async sendChatMessage(userId, role, message, conversationState = {}) {
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
          conversation_state: conversationState
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
}

export default ApiService;
