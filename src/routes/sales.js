const express = require('express');
const router = express.Router();
const db = require('../database/init');

// GET ventas con filtros opcionales (?date=YYYY-MM-DD, ?from=..., ?to=...)
router.get('/', (req, res) => {
  try {
    const { date, from, to, limit = 100 } = req.query;
    let query = `
      SELECT s.*, u.name as user_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
    `;
    const params = [];

    if (date) {
      query += ` WHERE date(s.created_at) = date(?)`;
      params.push(date);
    } else if (from && to) {
      query += ` WHERE s.created_at BETWEEN ? AND ?`;
      params.push(from, to);
    } else if (from) {
      query += ` WHERE s.created_at >= ?`;
      params.push(from);
    }

    query += ` ORDER BY s.created_at DESC LIMIT ?`;
    params.push(Number(limit));

    const sales = db.prepare(query).all(...params);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET venta por ID con items
router.get('/:id', (req, res) => {
  try {
    const sale = db.prepare(`
      SELECT s.*, u.name as user_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(req.params.id);

    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const items = db.prepare(`
      SELECT si.*, p.name as product_name
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `).all(req.params.id);

    res.json({ ...sale, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear venta con items (transacción)
router.post('/', (req, res) => {
  try {
    const { total, payment_method, user_id, items } = req.body;

    if (!total || !payment_method || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'total, payment_method e items son requeridos' });
    }

    const createSale = db.transaction(() => {
      // Insertar venta
      const saleResult = db.prepare(`
        INSERT INTO sales (total, payment_method, user_id)
        VALUES (?, ?, ?)
      `).run(Number(total), payment_method, user_id || null);

      const saleId = saleResult.lastInsertRowid;

      // Insertar items y actualizar stock
      const insertItem = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);
      const getProduct = db.prepare(`SELECT stock FROM products WHERE id = ?`);
      const updateStock = db.prepare(`
        UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const insertMovement = db.prepare(`
        INSERT INTO stock_movements (product_id, type, quantity, before_stock, after_stock, reference, user_id)
        VALUES (?, 'OUT', ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        insertItem.run(saleId, item.product_id, Number(item.quantity), Number(item.price), Number(item.quantity) * Number(item.price));

        const product = getProduct.get(item.product_id);
        if (product) {
          const before = Number(product.stock);
          const qty = Number(item.quantity);
          if (before < qty) {
            throw new Error(`Stock insuficiente para producto ID ${item.product_id} (disponible: ${before}, requerido: ${qty})`);
          }
          const after = before - qty;
          updateStock.run(qty, item.product_id);
          insertMovement.run(
            item.product_id,
            qty,
            before,
            after,
            `Venta #${saleId}`,
            user_id || null
          );
        }
      }

      return saleId;
    });

    const saleId = createSale();
    res.status(201).json({ id: saleId, total, payment_method });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
