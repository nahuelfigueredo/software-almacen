const seedDemoData = (db) => {
  console.log('🎨 MODO DEMO: Insertando datos de demostración...');

  // USUARIOS
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, pin, role, active)
    VALUES (?, ?, ?, ?, 1)
  `);

  insertUser.run(1, 'Dueño', '9999', 'owner');
  insertUser.run(2, 'Administrador', '1234', 'admin');
  insertUser.run(3, 'Vendedor', '5678', 'cashier');

  // CATEGORÍAS
  const categories = [
    ['Bebidas', 'Gaseosas, aguas, jugos, cervezas'],
    ['Almacén', 'Productos secos, enlatados, condimentos'],
    ['Lácteos', 'Leche, yogurt, quesos, manteca'],
    ['Panadería', 'Pan, facturas, galletitas, snacks'],
    ['Golosinas', 'Caramelos, chocolates, alfajores'],
    ['Limpieza', 'Productos de limpieza y higiene'],
    ['Congelados', 'Helados, pizzas, vegetales'],
    ['Frescos', 'Frutas y verduras']
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (name, description) VALUES (?, ?)
  `);
  categories.forEach(cat => insertCategory.run(...cat));

  // PRODUCTOS (50+ realistas)
  const products = [
    // Bebidas
    ['Coca Cola 2.25L', '7790895001234', 1, 2500, 1800, 50, 10, 'unidad'],
    ['Coca Cola 500ml', '7790895001235', 1, 1200, 850, 80, 20, 'unidad'],
    ['Sprite 2.25L', '7790895001236', 1, 2300, 1700, 45, 10, 'unidad'],
    ['Fanta 2L', '7790895001237', 1, 2200, 1600, 40, 8, 'unidad'],
    ['Agua Villavicencio 1.5L', '7790895001241', 1, 1200, 800, 100, 20, 'unidad'],
    ['Agua Eco de los Andes 2L', '7790895001242', 1, 1400, 950, 80, 15, 'unidad'],
    ['Cerveza Quilmes 1L', '7790895001258', 1, 3500, 2500, 60, 12, 'unidad'],
    ['Cerveza Brahma Lata', '7790895001259', 1, 1800, 1300, 100, 24, 'unidad'],
    ['Jugo Baggio Naranja 1L', '7790895001260', 1, 1500, 1100, 40, 10, 'unidad'],

    // Almacén
    ['Arroz Gallo Oro 1kg', '7790895002234', 2, 1800, 1200, 35, 5, 'unidad'],
    ['Arroz Dos Hermanos 1kg', '7790895002235', 2, 1600, 1100, 40, 8, 'unidad'],
    ['Fideos Matarazzo 500g', '7790895002241', 2, 950, 650, 60, 15, 'unidad'],
    ['Fideos Don Vicente Guiseros', '7790895002242', 2, 1100, 750, 50, 12, 'unidad'],
    ['Aceite Cocinero 900ml', '7790895002258', 2, 2200, 1600, 30, 5, 'unidad'],
    ['Aceite Lira 1.5L', '7790895002259', 2, 3500, 2600, 25, 5, 'unidad'],
    ['Sal Celusal Fina 500g', '7790895002260', 2, 600, 400, 50, 10, 'unidad'],
    ['Azúcar Ledesma 1kg', '7790895002261', 2, 1400, 1000, 45, 8, 'unidad'],
    ['Harina Pureza 1kg', '7790895002262', 2, 1200, 850, 40, 8, 'unidad'],

    // Lácteos
    ['Leche La Serenísima Entera 1L', '7790895003234', 3, 1400, 1000, 80, 20, 'unidad'],
    ['Leche Sancor Descremada 1L', '7790895003235', 3, 1450, 1050, 70, 18, 'unidad'],
    ['Yogurt Ser Natural 190g', '7790895003241', 3, 800, 550, 50, 12, 'unidad'],
    ['Yogurt La Serenísima Frutilla', '7790895003242', 3, 850, 600, 45, 10, 'unidad'],
    ['Queso Cremoso La Paulina 200g', '7790895003258', 3, 2800, 2000, 25, 6, 'unidad'],
    ['Queso Rallado Sancor 40g', '7790895003259', 3, 1200, 850, 40, 8, 'unidad'],
    ['Manteca La Serenísima 200g', '7790895003260', 3, 2200, 1600, 30, 6, 'unidad'],

    // Panadería
    ['Pan Lactal Bimbo Blanco', '7790895004234', 4, 1900, 1300, 40, 8, 'unidad'],
    ['Pan Lactal Bimbo Integral', '7790895004235', 4, 2100, 1450, 35, 7, 'unidad'],
    ['Galletitas Oreo 118g', '7790895004241', 4, 1600, 1100, 60, 12, 'unidad'],
    ['Galletitas Pepitos 140g', '7790895004242', 4, 1800, 1250, 55, 10, 'unidad'],
    ['Tostadas Criollitas', '7790895004243', 4, 1300, 900, 45, 8, 'unidad'],

    // Golosinas
    ['Alfajor Jorgito Clásico', '7790895005234', 5, 850, 600, 120, 24, 'unidad'],
    ['Alfajor Jorgito Triple', '7790895005235', 5, 1400, 1000, 80, 16, 'unidad'],
    ['Chocolate Milka 100g', '7790895005241', 5, 3200, 2300, 50, 10, 'unidad'],
    ['Chocolate Águila 25g', '7790895005242', 5, 800, 550, 100, 20, 'unidad'],
    ['Caramelos Sugus Bolsa 150g', '7790895005243', 5, 1500, 1050, 60, 12, 'unidad'],
    ['Chicles Beldent Menta', '7790895005244', 5, 600, 400, 80, 15, 'unidad'],

    // Limpieza
    ['Detergente Magistral 500ml', '7790895006234', 6, 1800, 1300, 30, 6, 'unidad'],
    ['Lavandina Ayudín 1L', '7790895006235', 6, 1200, 850, 40, 8, 'unidad'],
    ['Jabón Dove Cremoso', '7790895006236', 6, 2200, 1600, 35, 7, 'unidad'],
    ['Papel Higiénico Higienol x4', '7790895006237', 6, 2800, 2000, 50, 10, 'unidad'],

    // Congelados
    ['Helado Frigor Americana 1L', '7790895007234', 7, 4500, 3200, 25, 5, 'unidad'],
    ['Pizza Muzzarella Sibarita', '7790895007235', 7, 3800, 2700, 20, 4, 'unidad'],

    // Frescos
    ['Banana por kg', '2000001', 8, 1500, 1000, 20, 5, 'kg'],
    ['Manzana Roja por kg', '2000002', 8, 1800, 1200, 25, 5, 'kg'],
    ['Tomate por kg', '2000003', 8, 2200, 1500, 15, 3, 'kg'],
    ['Papa por kg', '2000004', 8, 1200, 800, 30, 8, 'kg']
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (name, barcode, category_id, price, cost, stock, min_stock, unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  products.forEach(p => insertProduct.run(...p));

  // VENTAS DE EJEMPLO (últimos 7 días)
  const today = new Date();
  const insertSale = db.prepare(`
    INSERT INTO sales (user_id, total, payment_method, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertSaleItem = db.prepare(`
    INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal)
    VALUES (?, ?, ?, ?, ?)
  `);

  const saleExamples = [
    [3, 5500, 'cash', -1, [[1, 2, 2500], [7, 1, 3500]]],
    [2, 12500, 'card', -1, [[33, 5, 850], [1, 3, 2500]]],
    [3, 8200, 'mixed', -2, [[20, 4, 1400], [14, 2, 2200]]],
    [2, 15800, 'cash', -3, [[10, 2, 1800], [29, 3, 1600], [7, 2, 3500]]],
    [3, 4200, 'transfer', -3, [[32, 4, 850], [36, 2, 600]]],
    [2, 9800, 'card', -4, [[19, 6, 1400], [25, 1, 2200]]],
    [3, 7600, 'cash', -4, [[1, 1, 2500], [27, 2, 1900], [12, 3, 950]]],
    [2, 11200, 'mixed', -5, [[33, 3, 850], [7, 2, 3500], [22, 1, 850]]],
    [3, 6300, 'cash', -5, [[15, 1, 3500], [17, 1, 1400], [16, 1, 600]]],
    [2, 18500, 'card', -6, [[43, 1, 4500], [44, 2, 3800], [1, 1, 2500]]],
    [3, 3200, 'cash', -6, [[32, 2, 850], [35, 2, 600], [34, 1, 800]]],
    [2, 14700, 'transfer', -7, [[10, 3, 1800], [11, 2, 1600], [13, 1, 1100]]],
    [3, 5100, 'cash', -7, [[26, 2, 1900], [30, 1, 1300], [28, 2, 1600]]],
    [2, 8900, 'card', 0, [[7, 2, 3500], [6, 1, 1400]]],
    [3, 4700, 'cash', 0, [[19, 2, 1400], [21, 1, 800], [16, 1, 600]]]
  ];

  let saleId = 1;
  saleExamples.forEach(([userId, total, payment, daysAgo, items]) => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysAgo);

    insertSale.run(userId, total, payment, date.toISOString());
    items.forEach(([productId, qty, price]) => {
      insertSaleItem.run(saleId, productId, qty, price, qty * price);
    });
    saleId++;
  });

  console.log('✅ Datos demo insertados: 50+ productos, 15 ventas de ejemplo');
};

module.exports = { seedDemoData };
