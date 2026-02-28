const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshTokenVal = localStorage.getItem('refreshToken');
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.baseURL = API_BASE_URL;
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
        ...(options.headers?.['Content-Type'] !== 'undefined' && { 'Content-Type': 'application/json' }),
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Remove Content-Type if it was set to 'undefined' to allow browser to set boundary
    if (config.headers['Content-Type'] === 'undefined') {
      delete config.headers['Content-Type'];
    }

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
  async register(username, email, password, role = 'user', phone = '', address = '', city = '', lawyer_id_proof = '', lawyer_proof_file = null, consultation_fee = 0.0, specialization = '', years_of_experience = 0) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('lawyer_id_proof', lawyer_id_proof);
    if (lawyer_proof_file) {
      formData.append('lawyer_proof_file', lawyer_proof_file);
    }
    formData.append('consultation_fee', consultation_fee);
    formData.append('specialization', specialization);
    formData.append('years_of_experience', years_of_experience);

    return this.request('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'undefined' }, // Let fetch set the boundary
      body: formData,
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
  async sendMessage(message, lang = 'en') {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, lang }),
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
  async getLawyers(city = '', minRating = 0, specialization = '', sort = '', name = '') {
    let url = `/lawyers?city=${city}&min_rating=${minRating}`;
    if (specialization) url += `&specialization=${specialization}`;
    if (sort) url += `&sort=${sort}`;
    if (name) url += `&name=${name}`;
    return this.request(url);
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

  // Review endpoints
  async submitReview(lawyerId, rating, comment) {
    const formData = new FormData();
    formData.append('rating', rating);
    if (comment) formData.append('comment', comment);

    return this.request(`/lawyer/${lawyerId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'undefined' },
      body: formData,
    });
  }

  async getLawyerReviews(lawyerId) {
    return this.request(`/lawyer/${lawyerId}/reviews`);
  }

  // Person-to-Person Messaging
  async sendMessageToOther(receiverId, message = '', file = null) {
    const formData = new FormData();
    formData.append('receiver_id', receiverId);
    formData.append('message', message);
    if (file) {
      formData.append('file', file);
    }

    return this.request('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'undefined' },
      body: formData,
    });
  }

  async getMessages(otherId) {
    return this.request(`/messages/${otherId}`);
  }

  async getChatInbox() {
    return this.request('/chat-inbox');
  }

  async updateLawyerProfile(data) {
    return this.request('/profile/lawyer', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // Appointment endpoints
  async bookAppointment(lawyerId, date, timeSlot, notes = '') {
    return this.request('/appointments/book', {
      method: 'POST',
      body: JSON.stringify({ lawyer_id: lawyerId, date, time_slot: timeSlot, notes }),
    });
  }

  async getUserAppointments() {
    return this.request('/appointments/user');
  }

  async getLawyerAppointments() {
    return this.request('/appointments/lawyer');
  }

  async updateAppointmentStatus(appointmentId, status) {
    return this.request(`/appointments/${appointmentId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }
}

export default new ApiService();
