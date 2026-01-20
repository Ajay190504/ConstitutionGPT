const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(username, email, password, role = 'user', phone = '', address = '', city = '') {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role, phone, address, city }),
    });
  }

  async login(username, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async verifyToken() {
    return this.request('/verify-token');
  }

  // Chat endpoints
  async sendMessage(message) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getHistory() {
    return this.request('/history');
  }

  async getChat(chatId) {
    return this.request(`/chat/${chatId}`);
  }

  async deleteChat(chatId) {
    return this.request(`/chat/${chatId}`, {
      method: 'DELETE',
    });
  }

  // Topics endpoints
  async getTopics() {
    return this.request('/topics');
  }

  async getTopic(topicId) {
    return this.request(`/topics/${topicId}`);
  }

  async searchTopics(query) {
    return this.request(`/topics/search/${query}`);
  }

  // Lawyer & Admin endpoints
  async getLawyers(city = '') {
    const endpoint = city ? `/lawyers?city=${city}` : '/lawyers';
    return this.request(endpoint);
  }

  async adminGetLawyers() {
    return this.request('/admin/lawyers');
  }

  async verifyLawyer(lawyerId, isVerified) {
    return this.request('/admin/verify', {
      method: 'POST',
      body: JSON.stringify({ lawyer_id: lawyerId, is_verified: isVerified }),
    });
  }

  // Person-to-Person Messaging
  async sendMessageToOther(receiverId, message) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, message }),
    });
  }

  async getMessages(otherId) {
    return this.request(`/messages/${otherId}`);
  }

  async getChatInbox() {
    return this.request('/chat-inbox');
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }
}

export default new ApiService();
