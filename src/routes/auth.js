const express = require('express');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { getDb } = require('../database/init');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y PIN son requeridos'
      });
    }

    const db = getDb();
    const user = db.prepare(`
      SELECT id, name, pin_hash, role, active
      FROM users
      WHERE name = ? AND active = 1
    `).get(name);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o PIN incorrectos'
      });
    }

    // Verificar PIN (soporta tanto hasheado como sin hashear para migración)
    let isValidPin = false;

    if (user.pin_hash && /^\$2[aby]\$/.test(user.pin_hash)) {
      // PIN hasheado con bcrypt
      isValidPin = await bcrypt.compare(pin, user.pin_hash);
    } else {
      // PIN sin hashear (legacy) - hashear y actualizar
      isValidPin = String(pin) === String(user.pin_hash);
      if (isValidPin) {
        const hashedPin = await bcrypt.hash(pin, 10);
        db.prepare('UPDATE users SET pin_hash = ? WHERE id = ?').run(hashedPin, user.id);
      }
    }

    if (!isValidPin) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o PIN incorrectos'
      });
    }

    const payload = { id: user.id, name: user.name, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: user.id });

    db.prepare(`
      UPDATE users
      SET refresh_token = ?, last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(refreshToken, user.id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: { id: user.id, name: user.name, role: user.role },
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token es requerido'
      });
    }

    const decoded = verifyToken(refreshToken);
    const db = getDb();
    const user = db.prepare(`
      SELECT id, name, role, refresh_token
      FROM users
      WHERE id = ? AND active = 1
    `).get(decoded.id);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      name: user.name,
      role: user.role
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token inválido o expirado'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const db = getDb();
      db.prepare('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?').run(refreshToken);
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión'
    });
  }
});

module.exports = router;
