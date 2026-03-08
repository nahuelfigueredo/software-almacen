const express = require('express');
const router = express.Router();
const db = require('../database/init');

// GET movimientos de stock (?product_id=N&type=IN|OUT|ADJ&limit=100)
router.get('/', (req, res) => {
  try {
    const { product_id, type, limit = 200 } = req.query;
    let query = `
      SELECT sm.*, p.name as product_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
    `;
    const params = [];
    const conditions = [];

    if (product_id) {
      conditions.push('sm.product_id = ?');
      params.push(product_id);
    }
    if (type) {
      conditions.push('sm.type = ?');
      params.push(type.toUpperCase());
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sm.created_at DESC LIMIT ?';
    params.push(Number(limit));

    const movements = db.prepare(query).all(...params);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST ajuste manual de stock
router.post('/adjust', (req, res) => {
  try {
    const { product_id, quantity, type, note, user_id } = req.body;

    if (!product_id || quantity === undefined || !type) {
      return res.status(400).json({ error: 'product_id, quantity y type son requeridos' });
    }

    const validTypes = ['IN', 'OUT', 'ADJ'];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ error: `type debe ser uno de: ${validTypes.join(', ')}` });
    }

    const adjust = db.transaction(() => {
      const product = db.prepare(`SELECT stock FROM products WHERE id = ? AND active = 1`).get(product_id);
      if (!product) throw new Error('Producto no encontrado');

      const before = Number(product.stock);
      const qty = Number(quantity);
      let after;

      if (type.toUpperCase() === 'ADJ') {
        after = qty; // Ajuste absoluto (inventario físico)
      } else if (type.toUpperCase() === 'IN') {
        after = before + qty;
      } else {
        // OUT — prevent negative stock
        if (before < qty) {
          throw new Error(`Stock insuficiente (disponible: ${before}, requerido: ${qty})`);
        }
        after = before - qty;
      }

      db.prepare(`
        UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(after, product_id);

      const result = db.prepare(`
        INSERT INTO stock_movements (product_id, type, quantity, before_stock, after_stock, note, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        product_id,
        type.toUpperCase(),
        qty,
        before,
        after,
        note || null,
        user_id || null
      );

      return { id: result.lastInsertRowid, product_id, type, quantity: qty, before_stock: before, after_stock: after };
    });

    const movement = adjust();
    res.status(201).json(movement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
