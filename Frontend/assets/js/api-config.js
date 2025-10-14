/**
 * Frontend API Configuration
 * Central configuration for all API endpoints
 */

// Detect current environment and set API base URL accordingly
function getApiBaseUrl() {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  // For local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check if using XAMPP (typically on port 80 or no port specified)
    if (!port || port === '80') {
      return `${protocol}//${hostname}/blogging-app/Backend/api`;
    }
    // Check if using PHP built-in server (typically on port 8000)
    if (port === '8000') {
      return `${protocol}//${hostname}:${port}/api`;
    }
    // Default to XAMPP setup
    return `http://localhost/blogging-app/Backend/api`;
  }

  // For production (adjust as needed)
  return `${protocol}//${hostname}/api`;
}

// API Base URL - automatically detected
const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),

  // Alternative configurations for manual override:
  // For PHP built-in server: 'http://localhost:8000/api'
  // For XAMPP/Apache: 'http://localhost/blogging-app/Backend/api'
  // For production: 'https://yourdomain.com/api'
};

// API Endpoints
const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    CSRF_TOKEN: `${API_CONFIG.BASE_URL}/auth/csrf-token.php`,
    LOGIN: `${API_CONFIG.BASE_URL}/auth/login.php`,
    REGISTER: `${API_CONFIG.BASE_URL}/auth/register.php`,
    LOGOUT: `${API_CONFIG.BASE_URL}/auth/logout.php`,
    STATUS: `${API_CONFIG.BASE_URL}/auth/status.php`,
    VERIFY_EMAIL: `${API_CONFIG.BASE_URL}/auth/verify-email.php`,
    FORGOT_PASSWORD: `${API_CONFIG.BASE_URL}/auth/forgot-password.php`,
    CHECK_USERNAME: `${API_CONFIG.BASE_URL}/auth/check-username.php`,
  },

  // Posts
  POSTS: {
    LIST: `${API_CONFIG.BASE_URL}/posts/list.php`,
    GET: `${API_CONFIG.BASE_URL}/posts/get.php`,
    CREATE: `${API_CONFIG.BASE_URL}/posts/create.php`,
    UPDATE: `${API_CONFIG.BASE_URL}/posts/update.php`,
    DELETE: `${API_CONFIG.BASE_URL}/posts/delete.php`,
    CATEGORIES: `${API_CONFIG.BASE_URL}/posts/categories.php`,
  },

  // Comments
  COMMENTS: {
    LIST: `${API_CONFIG.BASE_URL}/comments/list.php`,
    CREATE: `${API_CONFIG.BASE_URL}/comments/create.php`,
    UPDATE: `${API_CONFIG.BASE_URL}/comments/update.php`,
    DELETE: `${API_CONFIG.BASE_URL}/comments/delete.php`,
    MODERATE: `${API_CONFIG.BASE_URL}/comments/moderate.php`,
  },

  // Test endpoint
  TEST: `${API_CONFIG.BASE_URL}/test.php`,
};

// HTTP Helper Functions
const API = {
  /**
   * Make a GET request
   */
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  /**
   * Make a POST request
   */
  async post(url, data = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  async put(url, data = {}) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   */
  async delete(url, data = {}) {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, API_ENDPOINTS, API };
}
