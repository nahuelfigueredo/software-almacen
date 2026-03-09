const express = require('express');
const router = express.Router();
const db = require('../database/init');

// GET todos los usuarios activos
router.get('/', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, role, active, created_at FROM users WHERE active = 1 ORDER BY name
    `).all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET usuario por ID
router.get('/:id', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, role, active, created_at FROM users WHERE id = ? AND active = 1
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear usuario
router.post('/', (req, res) => {
  try {
    const { name, pin, role } = req.body;

    if (!name || !pin || !role) {
      return res.status(400).json({ error: 'name, pin y role son requeridos' });
    }

    const validRoles = ['owner', 'admin', 'seller'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `role debe ser uno de: ${validRoles.join(', ')}` });
    }

    const result = db.prepare(`
      INSERT INTO users (name, pin, role) VALUES (?, ?, ?)
    `).run(name, pin, role);

    res.status(201).json({ id: result.lastInsertRowid, name, role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT actualizar usuario
router.put('/:id', (req, res) => {
  try {
    const { name, pin, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'name y role son requeridos' });
    }

    const validRoles = ['owner', 'admin', 'seller'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `role debe ser uno de: ${validRoles.join(', ')}` });
    }

    let query;
    let params;
    if (pin) {
      query = `UPDATE users SET name = ?, pin = ?, role = ? WHERE id = ? AND active = 1`;
      params = [name, pin, role, req.params.id];
    } else {
      query = `UPDATE users SET name = ?, role = ? WHERE id = ? AND active = 1`;
      params = [name, role, req.params.id];
    }

    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ id: Number(req.params.id), name, role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE usuario (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare(`UPDATE users SET active = 0 WHERE id = ?`).run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
