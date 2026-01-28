const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("VITE_API_BASE_URL is not defined");
}

const ApiService = {
  async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || "API request failed");
    }

    return data;
  },

  login(username, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  register(payload) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getTopics() {
    return this.request("/topics");
  },

  askQuestion(question) {
    return this.request("/ask", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  },

  getHistory() {
    return this.request("/history");
  },
};

export default ApiService;
