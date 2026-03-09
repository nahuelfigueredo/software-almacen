/* auth.js — JWT authentication service for frontend */
class AuthService {
  async login(name, pin) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      localStorage.setItem('access_token', data.data.accessToken);
      localStorage.setItem('refresh_token', data.data.refreshToken);
      localStorage.setItem('current_user', JSON.stringify(data.data.user));

      return data.data.user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.getRefreshToken() })
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
      window.location.href = '/login.html';
    }
  }

  async fetch(url, options = {}) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        options.headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
        response = await fetch(url, options);
      } else {
        this.logout();
        return null;
      }
    }

    return response;
  }

  async refreshAccessToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.getRefreshToken() })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('access_token', data.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return false;
    }
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

const authService = new AuthService();
