const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DEMO_MODE = process.env.DEMO_MODE === 'true';

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

  if (DEMO_MODE) {
    const { seedDemoData } = require('./demo-seed');
    seedDemoData(db);
    return;
  }

  console.log('🌱 Insertando datos mínimos (producción)...');

  // Seed mínimo para producción - usar valores de .env si están disponibles
  const ownerName = process.env.OWNER_NAME || 'Dueño';
  const ownerPin = process.env.OWNER_PIN || '9999';

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, pin, role)
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run(1, ownerName, ownerPin, 'owner');
  console.log('✅ Usuario inicial creado. Configure más usuarios desde la app.');
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

// Inicializar
initSchema();
seedData();
runMigrations();

function getDb() {
  return db;
}

module.exports = db;
module.exports.getDb = getDb;
