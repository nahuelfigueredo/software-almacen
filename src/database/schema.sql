-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  role TEXT NOT NULL, -- 'owner', 'admin', 'cashier'
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  category TEXT,
  price REAL NOT NULL,
  cost REAL DEFAULT 0,
  stock REAL DEFAULT 0,
  min_stock REAL DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ventas
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL, -- 'cash', 'card', 'mp', 'transfer'
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Detalle de ventas
CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Movimientos de stock
CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'IN', 'OUT', 'ADJ'
  quantity REAL NOT NULL,
  before_stock REAL NOT NULL,
  after_stock REAL NOT NULL,
  reference TEXT,
  note TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Caja diaria
CREATE TABLE IF NOT EXISTS cash_register (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  opening_amount REAL NOT NULL,
  closing_amount REAL,
  opened_by INTEGER,
  closed_by INTEGER,
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  FOREIGN KEY (opened_by) REFERENCES users(id),
  FOREIGN KEY (closed_by) REFERENCES users(id)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
