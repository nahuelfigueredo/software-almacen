const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/almacen.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Crear directorio data si no existe
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar base de datos
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Ejecutar schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// Seed inicial (usuarios demo)
const seedUsers = () => {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, pin, role)
    VALUES (?, ?, ?, ?)
  `);

  insert.run(1, 'Dueño', '9999', 'owner');
  insert.run(2, 'Admin', '1234', 'admin');
  insert.run(3, 'Vendedor', '0000', 'cashier');
};

seedUsers();

module.exports = db;
