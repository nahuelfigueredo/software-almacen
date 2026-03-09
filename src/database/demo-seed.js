const bcrypt = require('bcryptjs');

function seedDemoData(db) {
  console.log('🎨 Insertando datos de DEMO...');

  // === USUARIOS ===
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, pin, pin_hash, role, active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);

  insertUser.run(1, 'Dueño Demo', '9999', bcrypt.hashSync('9999', 10), 'owner');
  insertUser.run(2, 'Administrador Demo', '1234', bcrypt.hashSync('1234', 10), 'admin');
  insertUser.run(3, 'Vendedor Demo', '5678', bcrypt.hashSync('5678', 10), 'cashier');

  // === CATEGORÍAS ===
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, description) VALUES (?, ?)
  `);

  const categories = [
    ['Bebidas', 'Gaseosas, aguas, jugos, cervezas'],
    ['Almacén', 'Productos secos, enlatados, harinas'],
    ['Lácteos', 'Leche, yogurt, quesos, manteca'],
    ['Panadería', 'Pan, facturas, galletitas, tortas'],
    ['Golosinas', 'Caramelos, chocolates, alfajores, snacks'],
    ['Limpieza', 'Productos de limpieza y hogar'],
    ['Higiene Personal', 'Jabones, shampoo, cremas'],
    ['Congelados', 'Helados, hamburguesas, pizzas']
  ];

  categories.forEach(([name, desc]) => insertCategory.run(name, desc));

  // === 50+ PRODUCTOS REALISTAS ===
  const insertProduct = db.prepare(`
    INSERT INTO products (name, barcode, category_id, price, cost, stock, min_stock, unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Bebidas (cat 1)
  insertProduct.run('Coca Cola 2.25L', '7790895001234', 1, 2500, 1800, 45, 10, 'unidad');
  insertProduct.run('Coca Cola Zero 2.25L', '7790895001235', 1, 2500, 1800, 38, 10, 'unidad');
  insertProduct.run('Sprite 2.25L', '7790895001236', 1, 2300, 1700, 42, 10, 'unidad');
  insertProduct.run('Fanta 2.25L', '7790895001237', 1, 2300, 1700, 35, 10, 'unidad');
  insertProduct.run('Agua Mineral 1.5L', '7790895001241', 1, 1200, 800, 80, 20, 'unidad');
  insertProduct.run('Agua Saborizada 1.5L', '7790895001242', 1, 1400, 950, 55, 15, 'unidad');
  insertProduct.run('Cerveza Quilmes 1L', '7790895001258', 1, 3500, 2500, 30, 12, 'unidad');
  insertProduct.run('Cerveza Brahma 1L', '7790895001259', 1, 3300, 2400, 25, 10, 'unidad');
  insertProduct.run('Jugo Baggio 1L', '7790895001260', 1, 1800, 1200, 48, 12, 'unidad');
  insertProduct.run('Energizante Speed 250ml', '7790895001270', 1, 2200, 1600, 60, 20, 'unidad');

  // Almacén (cat 2)
  insertProduct.run('Arroz Gallo 1kg', '7790895002234', 2, 1800, 1200, 28, 5, 'unidad');
  insertProduct.run('Fideos Matarazzo 500g', '7790895002241', 2, 950, 650, 45, 10, 'unidad');
  insertProduct.run('Aceite Cocinero 900ml', '7790895002258', 2, 2200, 1600, 22, 5, 'unidad');
  insertProduct.run('Harina 0000 1kg', '7790895002300', 2, 1100, 750, 35, 8, 'unidad');
  insertProduct.run('Azúcar 1kg', '7790895002310', 2, 1300, 900, 40, 10, 'unidad');
  insertProduct.run('Sal Fina 500g', '7790895002320', 2, 650, 450, 50, 12, 'unidad');
  insertProduct.run('Yerba Mate Playadito 1kg', '7790895002330', 2, 3200, 2300, 38, 8, 'unidad');
  insertProduct.run('Café Torrado 500g', '7790895002340', 2, 2500, 1800, 25, 6, 'unidad');
  insertProduct.run('Atún Lomitos 170g', '7790895002350', 2, 2800, 2000, 42, 10, 'unidad');
  insertProduct.run('Arvejas Lata 300g', '7790895002360', 2, 1400, 950, 35, 8, 'unidad');

  // Lácteos (cat 3)
  insertProduct.run('Leche La Serenísima 1L', '7790895003234', 3, 1400, 1000, 55, 15, 'unidad');
  insertProduct.run('Leche Descremada 1L', '7790895003235', 3, 1450, 1050, 48, 12, 'unidad');
  insertProduct.run('Yogurt Ser Natural 190g', '7790895003241', 3, 800, 550, 38, 10, 'unidad');
  insertProduct.run('Yogurt Frutilla 190g', '7790895003242', 3, 850, 600, 35, 10, 'unidad');
  insertProduct.run('Queso Cremoso 200g', '7790895003258', 3, 2800, 2000, 18, 5, 'unidad');
  insertProduct.run('Manteca 200g', '7790895003270', 3, 2100, 1500, 22, 6, 'unidad');
  insertProduct.run('Dulce de Leche 400g', '7790895003280', 3, 2500, 1800, 28, 8, 'unidad');

  // Panadería (cat 4)
  insertProduct.run('Pan Lactal Bimbo', '7790895004234', 4, 1900, 1300, 32, 8, 'unidad');
  insertProduct.run('Pan Integral', '7790895004235', 4, 2100, 1450, 28, 6, 'unidad');
  insertProduct.run('Galletitas Oreo', '7790895004241', 4, 1600, 1100, 48, 12, 'unidad');
  insertProduct.run('Galletitas Express', '7790895004250', 4, 1200, 850, 55, 15, 'unidad');
  insertProduct.run('Bizcochos 500g', '7790895004260', 4, 1800, 1250, 30, 8, 'unidad');
  insertProduct.run('Tostadas 120g', '7790895004270', 4, 1100, 750, 42, 10, 'unidad');

  // Golosinas (cat 5)
  insertProduct.run('Alfajor Jorgito', '7790895005234', 5, 850, 600, 95, 20, 'unidad');
  insertProduct.run('Alfajor Guaymallén', '7790895005235', 5, 700, 500, 110, 25, 'unidad');
  insertProduct.run('Chocolate Milka', '7790895005241', 5, 3200, 2300, 42, 10, 'unidad');
  insertProduct.run('Caramelos Sugus', '7790895005250', 5, 600, 400, 85, 20, 'unidad');
  insertProduct.run('Chupetín Pico Dulce', '7790895005260', 5, 300, 200, 120, 30, 'unidad');
  insertProduct.run('Papas Lays 150g', '7790895005270', 5, 2200, 1600, 48, 12, 'unidad');
  insertProduct.run('Maní con Chocolate', '7790895005280', 5, 1800, 1250, 38, 10, 'unidad');

  // Limpieza (cat 6)
  insertProduct.run('Lavandina 1L', '7790895006100', 6, 1500, 1000, 32, 8, 'unidad');
  insertProduct.run('Detergente Magistral 750ml', '7790895006110', 6, 2200, 1550, 28, 6, 'unidad');
  insertProduct.run('Esponja de Cocina x3', '7790895006120', 6, 1200, 850, 45, 12, 'pack');
  insertProduct.run('Bolsas Residuo 50x70', '7790895006130', 6, 1800, 1250, 38, 10, 'rollo');

  // Higiene (cat 7)
  insertProduct.run('Jabón Dove 90g', '7790895007100', 7, 1600, 1150, 42, 10, 'unidad');
  insertProduct.run('Shampoo Sedal 350ml', '7790895007110', 7, 2800, 2000, 28, 8, 'unidad');
  insertProduct.run('Pasta Dental Colgate', '7790895007120', 7, 2100, 1500, 35, 8, 'unidad');
  insertProduct.run('Papel Higiénico x4', '7790895007130', 7, 2500, 1800, 48, 12, 'pack');

  // Congelados (cat 8)
  insertProduct.run('Helado Grido 1L', '7790895008100', 8, 4500, 3200, 15, 4, 'unidad');
  insertProduct.run('Hamburguesas Paty x4', '7790895008110', 8, 3200, 2300, 22, 6, 'pack');
  insertProduct.run('Pizza Muzza Congelada', '7790895008120', 8, 3800, 2700, 18, 5, 'unidad');

  // === VENTAS DE EJEMPLO (últimos 7 días) ===
  const insertSale = db.prepare(`
    INSERT INTO sales (user_id, total, payment_method, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertSaleItem = db.prepare(`
    INSERT INTO sale_items (sale_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `);

  // Get actual product count for valid IDs
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

  // Generar 20 ventas de ejemplo
  const paymentMethods = ['cash', 'card', 'transfer', 'mixed'];
  const now = new Date();

  for (let i = 1; i <= 20; i++) {
    // Fecha en últimos 7 días (determinista usando índice)
    const daysAgo = i % 7;
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    saleDate.setHours(8 + (i % 12)); // Entre 8am y 8pm

    // 2-5 productos por venta
    const numItems = (i % 4) + 2;
    let total = 0;
    const items = [];

    for (let j = 0; j < numItems; j++) {
      const productId = ((i * 3 + j) % productCount) + 1;
      const quantity = (j % 3) + 1;
      const price = 500 + ((i * 7 + j * 13) % 3000);
      total += price * quantity;
      items.push({ productId, quantity, price });
    }

    const userId = (i % 3) + 1; // User 1, 2 o 3
    const paymentMethod = paymentMethods[i % paymentMethods.length];

    const result = insertSale.run(userId, total, paymentMethod, saleDate.toISOString());
    const saleId = result.lastInsertRowid;

    items.forEach(item => {
      insertSaleItem.run(saleId, item.productId, item.quantity, item.price);
    });
  }

  console.log('✅ Datos de demo insertados: 3 usuarios, 8 categorías, 50+ productos, 20 ventas');
}

module.exports = { seedDemoData };
