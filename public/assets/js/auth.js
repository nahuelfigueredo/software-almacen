/* auth.js — JWT authentication service for frontend */
class AuthService {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

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

      this.accessToken = data.data.accessToken;
      this.refreshToken = data.data.refreshToken;
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      return data.data.user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
    }
  }

  async fetch(url, options = {}) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        options.headers['Authorization'] = `Bearer ${this.accessToken}`;
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
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      const data = await response.json();

      if (data.success) {
        this.accessToken = data.data.accessToken;
        localStorage.setItem('accessToken', this.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return false;
    }
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

const authService = new AuthService();
