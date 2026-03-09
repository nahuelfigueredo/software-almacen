const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Rutas
const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'almacen.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Crear directorio data si no existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('📁 Directorio data/ creado');
}

// Inicializar base de datos
const db = new Database(DB_PATH);

// Optimizaciones de SQLite
db.pragma('journal_mode = WAL'); // Write-Ahead Logging para mejor concurrencia
db.pragma('foreign_keys = ON');  // Activar claves foráneas

console.log('🗄️  Base de datos inicializada:', DB_PATH);

// Ejecutar schema si es necesario
const initSchema = () => {
  try {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    console.log('✅ Schema de base de datos aplicado');
  } catch (error) {
    console.error('❌ Error al aplicar schema:', error.message);
    throw error;
  }
};

// Seed data inicial
const seedData = () => {
  // Verificar si ya hay datos
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

  if (userCount.count > 0) {
    console.log('ℹ️  Datos ya existentes, saltando seed');
    return;
  }

  console.log('🌱 Insertando datos iniciales...');

  // Usuarios
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, pin, role)
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run(1, 'Dueño', '9999', 'owner');
  insertUser.run(2, 'Administrador', '1234', 'admin');
  insertUser.run(3, 'Vendedor', '5678', 'seller');

  // Categorías
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, description)
    VALUES (?, ?)
  `);

  insertCategory.run('Bebidas', 'Gaseosas, aguas, jugos');
  insertCategory.run('Almacén', 'Productos secos y enlatados');
  insertCategory.run('Lácteos', 'Leche, yogurt, quesos');
  insertCategory.run('Panadería', 'Pan, facturas, galletitas');
  insertCategory.run('Golosinas', 'Caramelos, chocolates, snacks');
  insertCategory.run('Limpieza', 'Productos de limpieza');

  // Productos de ejemplo
  const insertProduct = db.prepare(`
    INSERT INTO products (name, barcode, category_id, price, cost, stock, min_stock, unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Bebidas (category_id=1)
  insertProduct.run('Coca Cola 2.25L', '7790895001234', 1, 2500, 1800, 50, 10, 'unidad');
  insertProduct.run('Agua Mineral 1.5L', '7790895001241', 1, 1200, 800, 80, 20, 'unidad');
  insertProduct.run('Cerveza Quilmes 1L', '7790895001258', 1, 3500, 2500, 40, 12, 'unidad');

  // Almacén (category_id=2)
  insertProduct.run('Arroz Gallo 1kg', '7790895002234', 2, 1800, 1200, 30, 5, 'unidad');
  insertProduct.run('Fideos Matarazzo 500g', '7790895002241', 2, 950, 650, 45, 10, 'unidad');
  insertProduct.run('Aceite Cocinero 900ml', '7790895002258', 2, 2200, 1600, 25, 5, 'unidad');

  // Lácteos (category_id=3)
  insertProduct.run('Leche La Serenísima 1L', '7790895003234', 3, 1400, 1000, 60, 15, 'unidad');
  insertProduct.run('Yogurt Ser 190g', '7790895003241', 3, 800, 550, 40, 10, 'unidad');
  insertProduct.run('Queso Cremoso 200g', '7790895003258', 3, 2800, 2000, 20, 5, 'unidad');

  // Panadería (category_id=4)
  insertProduct.run('Pan Lactal Bimbo', '7790895004234', 4, 1900, 1300, 35, 8, 'unidad');
  insertProduct.run('Galletitas Oreo', '7790895004241', 4, 1600, 1100, 50, 12, 'unidad');

  // Golosinas (category_id=5)
  insertProduct.run('Alfajor Jorgito', '7790895005234', 5, 850, 600, 100, 20, 'unidad');
  insertProduct.run('Chocolate Milka', '7790895005241', 5, 3200, 2300, 45, 10, 'unidad');

  console.log('✅ Datos iniciales insertados');
};

// Migraciones: agregar columnas JWT a users si no existen
const runMigrations = () => {
  const columns = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);

  if (!columns.includes('pin_hash')) {
    db.exec("ALTER TABLE users ADD COLUMN pin_hash TEXT");
    // Copiar pin existente a pin_hash para soporte legacy
    db.exec("UPDATE users SET pin_hash = pin WHERE pin_hash IS NULL");
    console.log('✅ Columna pin_hash agregada a users');
  }

  if (!columns.includes('refresh_token')) {
    db.exec("ALTER TABLE users ADD COLUMN refresh_token TEXT");
    console.log('✅ Columna refresh_token agregada a users');
  }

  if (!columns.includes('last_login')) {
    db.exec("ALTER TABLE users ADD COLUMN last_login DATETIME");
    console.log('✅ Columna last_login agregada a users');
  }

  db.exec("CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token)");
};

// Migración: actualizar rol cashier a seller
const migrateCashierToSeller = () => {
  const cashierUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'cashier'").get();

  if (cashierUsers.count > 0) {
    db.transaction(() => {
      db.exec("UPDATE users SET role = 'seller' WHERE role = 'cashier'");
    })();
    console.log(`✅ Migrados ${cashierUsers.count} usuarios de 'cashier' a 'seller'`);
  }
};

// Inicializar
initSchema();
seedData();
runMigrations();
migrateCashierToSeller();

function getDb() {
  return db;
}

module.exports = db;
module.exports.getDb = getDb;
