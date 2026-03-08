const express = require('express');
const router = express.Router();
const db = require('../database/init');

// GET todos los productos
router.get('/', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT * FROM products WHERE active = 1 ORDER BY name
    `).all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET producto por ID o código de barras
router.get('/:id', (req, res) => {
  try {
    const param = req.params.id;
    let product = db.prepare(`SELECT * FROM products WHERE id = ? AND active = 1`).get(param);
    if (!product) {
      product = db.prepare(`SELECT * FROM products WHERE barcode = ? AND active = 1`).get(param);
    }

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear producto
router.post('/', (req, res) => {
  try {
    const { name, barcode, category, price, cost, stock, min_stock } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: 'name y price son requeridos' });
    }

    const insert = db.prepare(`
      INSERT INTO products (name, barcode, category, price, cost, stock, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name,
      barcode || null,
      category || null,
      Number(price),
      Number(cost || 0),
      Number(stock || 0),
      Number(min_stock || 0)
    );

    const created = db.prepare(`SELECT * FROM products WHERE id = ?`).get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT actualizar producto
router.put('/:id', (req, res) => {
  try {
    const { name, barcode, category, price, cost, min_stock } = req.body;

    const update = db.prepare(`
      UPDATE products
      SET name = ?, barcode = ?, category = ?, price = ?, cost = ?, min_stock = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND active = 1
    `);

    const result = update.run(
      name,
      barcode || null,
      category || null,
      Number(price),
      Number(cost || 0),
      Number(min_stock || 0),
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ id: Number(req.params.id), ...req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH actualizar stock del producto
router.patch('/:id/stock', (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({ error: 'stock es requerido' });
    }

    const update = db.prepare(`
      UPDATE products
      SET stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND active = 1
    `);

    const result = update.run(Number(stock), req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ id: Number(req.params.id), stock: Number(stock) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE producto (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const update = db.prepare(`UPDATE products SET active = 0 WHERE id = ?`);
    const result = update.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
