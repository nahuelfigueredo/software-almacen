/* auth.js — JWT authentication service for frontend */
class AuthService {
<<<<<<< HEAD
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
=======
  constructor() {
    this.syncFromStorage();
  }

  syncFromStorage() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
>>>>>>> 468903c (Correcciones de auth JWT, dashboard y watermark)
  }

  async login(name, pin) {
    try {
      const response = await fetch('./api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error de autenticación');
      }

<<<<<<< HEAD
      localStorage.setItem('access_token', data.data.accessToken);
      localStorage.setItem('refresh_token', data.data.refreshToken);
      localStorage.setItem('current_user', JSON.stringify(data.data.user));
=======
      this.accessToken = data.data.accessToken;
      this.refreshToken = data.data.refreshToken;

      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
>>>>>>> 468903c (Correcciones de auth JWT, dashboard y watermark)

      return data.data.user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async logout() {
    try {
      this.syncFromStorage();

      await fetch('./api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.getRefreshToken() })
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
<<<<<<< HEAD
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
      window.location.href = '/login.html';
=======
      this.clearSession();
      window.location.href = './login.html';
>>>>>>> 468903c (Correcciones de auth JWT, dashboard y watermark)
    }
  }

  async fetch(url, options = {}) {
    this.syncFromStorage();

    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json'
    };

    let response = await window.fetch(url, options);

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
<<<<<<< HEAD
        options.headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
        response = await fetch(url, options);
=======
        options.headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await window.fetch(url, options);
>>>>>>> 468903c (Correcciones de auth JWT, dashboard y watermark)
      } else {
        await this.logout();
        return null;
      }
    }

    return response;
  }

  async refreshAccessToken() {
    try {
      this.syncFromStorage();

      if (!this.refreshToken) return false;

      const response = await fetch('./api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.getRefreshToken() })
      });

      const data = await response.json();

<<<<<<< HEAD
      if (data.success) {
        localStorage.setItem('access_token', data.data.accessToken);
=======
      if (data.success && data.data?.accessToken) {
        this.accessToken = data.data.accessToken;
        localStorage.setItem('accessToken', this.accessToken);
>>>>>>> 468903c (Correcciones de auth JWT, dashboard y watermark)
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return false;
    }
  }

  isAuthenticated() {
<<<<<<< HEAD
    return !!this.getAccessToken();
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
=======
    this.syncFromStorage();
    return !!this.accessToken;
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error leyendo usuario:', error);
      return null;
    }
>>>>>>> 468903c (Correcciones de auth JWT, dashboard y watermark)
  }
}

const authService = new AuthService();