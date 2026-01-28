const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("VITE_API_BASE_URL is not defined");
}

export default API_BASE_URL;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshTokenVal = localStorage.getItem('refreshToken');
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshTokenVal = refreshToken;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.token = null;
    this.refreshTokenVal = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  async refreshToken() {
    if (!this.refreshTokenVal) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshTokenVal }),
      });

      const data = await response.json();
      if (!response.ok) {
        this.clearTokens();
        throw new Error(data.detail || 'Refresh failed');
      }

      this.setTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    let url = `${API_BASE_URL}${endpoint}`;
    let config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      let response = await fetch(url, config);

      // If 401, try to refresh token
      if (response.status === 401 && this.refreshTokenVal && !options._retry) {
        if (this.isRefreshing) {
          // Wait for refresh to complete and retry
          return new Promise(resolve => {
            this.refreshSubscribers.push((newToken) => {
              config.headers.Authorization = `Bearer ${newToken}`;
              resolve(this.request(endpoint, { ...options, _retry: true }));
            });
          });
        }

        this.isRefreshing = true;
        try {
          const newToken = await this.refreshToken();
          this.isRefreshing = false;

          // Notify subscribers
          this.onRefreshed(newToken);

          // Retry original request
          config.headers.Authorization = `Bearer ${newToken}`;
          return this.request(endpoint, { ...options, _retry: true });
        } catch (refreshError) {
          this.isRefreshing = false;
          this.clearTokens();
          // Optional: redirect to login
          window.dispatchEvent(new CustomEvent('auth:expired'));
          throw refreshError;
        }
      }

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { detail: await response.text() };
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  onRefreshed(token) {
    this.refreshSubscribers.map(cb => cb(token));
    this.refreshSubscribers = [];
  }

  // Authentication endpoints
  async register(username, email, password, role = 'user', phone = '', address = '', city = '') {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role, phone, address, city }),
    });
  }

  async login(username, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.success) {
      this.setTokens(data.access_token, data.refresh_token);
    }
    return data;
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
