/* auth.js — JWT authentication service for frontend */
class AuthService {
  constructor() {
    this.TOKEN_KEY = 'access_token';
    this.REFRESH_KEY = 'refresh_token';
    this.USER_KEY = 'current_user';
  }

  // Login with PIN → get JWT tokens
  async login(name, pin) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          ok: false,
          message: data.message || 'Login failed'
        };
      }

      // Store tokens and user info
      localStorage.setItem(this.TOKEN_KEY, data.data.accessToken);
      localStorage.setItem(this.REFRESH_KEY, data.data.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.data.user));

      return {
        ok: true,
        user: data.data.user
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        ok: false,
        message: 'Error de conexión'
      };
    }
  }

  // Logout — clears tokens; calling code is responsible for redirecting
  async logout() {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);

    if (refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`
          },
          body: JSON.stringify({ refreshToken })
        });
      } catch (e) {
        console.warn('Logout request failed:', e);
      }
    }

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Get current user
  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Alias for backward compatibility
  getCurrentUser() {
    return this.getUser();
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Check if logged in (always reads fresh from localStorage)
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Refresh access token
  async refreshAccessToken() {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    if (!refreshToken) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem(this.TOKEN_KEY, data.data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Authenticated fetch wrapper
  async fetch(url, options = {}) {
    const token = this.getAccessToken();

    if (!token) {
      throw new Error('No access token available');
    }

    // Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    let response = await fetch(url, { ...options, headers });

    // If 401, try refreshing token once
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
        // Retry with new token
        headers.Authorization = `Bearer ${this.getAccessToken()}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed, logout and redirect
        await this.logout();
        window.location.href = '/login.html';
        throw new Error('Session expired');
      }
    }

    return response;
  }
}

// Global instance
window.AuthService = new AuthService();

// Backward-compatibility alias used throughout the codebase
const authService = window.AuthService;
