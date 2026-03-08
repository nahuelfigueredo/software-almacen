const express = require('express');
const router = express.Router();
const db = require('../database/init');

// GET /api/products/alerts/low-stock - Productos con stock bajo (antes de las rutas con :id)
router.get('/alerts/low-stock', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1 AND p.stock <= p.min_stock
      ORDER BY (p.stock - p.min_stock) ASC
    `).all();

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products - Listar todos los productos activos
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;

    let query = `
      SELECT p.*, c.name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1
    `;
    const params = [];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.barcode LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.name ASC';

    const products = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:id - Obtener un producto por ID o código de barras
router.get('/:id', (req, res) => {
  try {
    const param = req.params.id;
    let product = db.prepare(`
      SELECT p.*, c.name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.active = 1
    `).get(param);

    if (!product) {
      product = db.prepare(`
        SELECT p.*, c.name as category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.barcode = ? AND p.active = 1
      `).get(param);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products - Crear nuevo producto
router.post('/', (req, res) => {
  try {
    const { name, barcode, category_id, category, price, cost, stock, min_stock, unit, description } = req.body;

    // Validaciones
    if (!name || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y precio son obligatorios'
      });
    }

    if (Number(price) < 0 || (cost !== undefined && Number(cost) < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Precio y costo deben ser mayores o iguales a 0'
      });
    }

    // Resolver category_id: aceptar numérico directo o buscar por nombre de texto
    let resolvedCategoryId = category_id || null;
    if (!resolvedCategoryId && category) {
      const cat = db.prepare('SELECT id FROM categories WHERE name = ? AND active = 1').get(category.trim());
      if (cat) resolvedCategoryId = cat.id;
    }

    const insert = db.prepare(`
      INSERT INTO products (name, barcode, category_id, price, cost, stock, min_stock, unit, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name,
      barcode || null,
      resolvedCategoryId,
      Number(price),
      Number(cost || 0),
      Number(stock || 0),
      Number(min_stock || 0),
      unit || 'unidad',
      description || null
    );

    const newProduct = db.prepare(`
      SELECT p.*, c.name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear producto:', error);

    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({
        success: false,
        error: 'El código de barras ya existe'
      });
    }

    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', (req, res) => {
  try {
    const { name, barcode, category_id, category, price, cost, min_stock, unit, description } = req.body;

    // Verificar que el producto existe
    const existing = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Resolver category_id: aceptar numérico directo o buscar por nombre de texto
    let resolvedCategoryId = category_id !== undefined ? category_id : existing.category_id;
    if (category_id === undefined && category !== undefined) {
      if (category) {
        const cat = db.prepare('SELECT id FROM categories WHERE name = ? AND active = 1').get(category.trim());
        resolvedCategoryId = cat ? cat.id : existing.category_id;
      } else {
        resolvedCategoryId = existing.category_id;
      }
    }

    const update = db.prepare(`
      UPDATE products
      SET name = ?, barcode = ?, category_id = ?, price = ?, cost = ?, min_stock = ?, unit = ?, description = ?
      WHERE id = ? AND active = 1
    `);

    update.run(
      name || existing.name,
      barcode !== undefined ? barcode : existing.barcode,
      resolvedCategoryId,
      price !== undefined ? Number(price) : existing.price,
      cost !== undefined ? Number(cost) : existing.cost,
      min_stock !== undefined ? Number(min_stock) : existing.min_stock,
      unit || existing.unit,
      description !== undefined ? description : existing.description,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT p.*, c.name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

    res.json({
      success: true,
      data: updated,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/products/:id/stock - Ajustar stock
router.patch('/:id/stock', (req, res) => {
  try {
    const { quantity, type, note, user_id, stock: newStock } = req.body;

    // Soporte para la forma antigua { stock: valor } y la nueva { quantity, type }
    if (newStock !== undefined && quantity === undefined && type === undefined) {
      // Forma antigua: ajuste absoluto directo
      if (newStock === null) {
        return res.status(400).json({ success: false, error: 'stock es requerido' });
      }
      const result = db.prepare(`
        UPDATE products SET stock = ? WHERE id = ? AND active = 1
      `).run(Number(newStock), req.params.id);

      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Producto no encontrado' });
      }
      return res.json({ success: true, data: { id: Number(req.params.id), stock: Number(newStock) } });
    }

    if (quantity === undefined || !type) {
      return res.status(400).json({
        success: false,
        error: 'Cantidad y tipo son obligatorios (o usar { stock } para ajuste absoluto)'
      });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    const before_stock = product.stock;
    let after_stock;

    switch (type.toUpperCase()) {
      case 'IN':
        after_stock = before_stock + Math.abs(Number(quantity));
        break;
      case 'OUT':
        after_stock = before_stock - Math.abs(Number(quantity));
        break;
      case 'ADJ':
        after_stock = Number(quantity);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Tipo inválido. Use IN, OUT o ADJ'
        });
    }

    if (after_stock < 0) {
      return res.status(400).json({
        success: false,
        error: 'El stock no puede ser negativo'
      });
    }

    // Actualizar stock y registrar movimiento en transacción
    db.transaction(() => {
      db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(after_stock, req.params.id);
      db.prepare(`
        INSERT INTO stock_movements (product_id, type, quantity, before_stock, after_stock, note, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(req.params.id, type.toUpperCase(), Number(quantity), before_stock, after_stock, note || null, user_id || null);
    })();

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      data: updated,
      movement: {
        before: before_stock,
        after: after_stock,
        change: after_stock - before_stock
      },
      message: 'Stock actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id - Eliminar producto (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
