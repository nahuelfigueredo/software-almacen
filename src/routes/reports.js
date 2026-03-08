const express = require('express');
const router = express.Router();
const db = require('../database/init');

// GET reporte diario (?date=YYYY-MM-DD, por defecto hoy)
router.get('/daily', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const totals = db.prepare(`
      SELECT
        COUNT(*) as total_sales,
        COALESCE(SUM(total), 0) as total_amount,
        COALESCE(AVG(total), 0) as avg_ticket,
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END), 0) as cash,
        COALESCE(SUM(CASE WHEN payment_method = 'mp' THEN total ELSE 0 END), 0) as mp,
        COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END), 0) as card,
        COALESCE(SUM(CASE WHEN payment_method = 'transfer' THEN total ELSE 0 END), 0) as transfer
      FROM sales
      WHERE date(created_at) = date(?)
    `).get(date);

    res.json({ date, ...totals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET tendencia semanal (últimos 7 días)
router.get('/weekly', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        date(created_at) as day,
        COUNT(*) as total_sales,
        COALESCE(SUM(total), 0) as total_amount
      FROM sales
      WHERE created_at >= date('now', '-6 days')
      GROUP BY date(created_at)
      ORDER BY day ASC
    `).all();

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET productos más vendidos (últimos 30 días)
router.get('/top-products', (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const rows = db.prepare(`
      SELECT
        p.id,
        p.name,
        SUM(si.quantity) as total_qty,
        SUM(si.quantity * si.price) as total_amount
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.created_at >= date('now', '-30 days')
      GROUP BY p.id, p.name
      ORDER BY total_qty DESC
      LIMIT ?
    `).all(limit);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET distribución por métodos de pago (últimos 30 días)
router.get('/payment-methods', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        payment_method,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total_amount
      FROM sales
      WHERE created_at >= date('now', '-30 days')
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `).all();

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ventas por hora del día (hoy)
router.get('/hourly', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const rows = db.prepare(`
      SELECT
        strftime('%H', created_at) as hour,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total_amount
      FROM sales
      WHERE date(created_at) = date(?)
      GROUP BY strftime('%H', created_at)
      ORDER BY hour ASC
    `).all(date);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET stock crítico (stock <= min_stock)
router.get('/low-stock', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.id, p.name, c.name as category, p.stock, p.min_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1 AND p.stock <= p.min_stock
      ORDER BY p.stock ASC
    `).all();

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
