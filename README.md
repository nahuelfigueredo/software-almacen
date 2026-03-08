# Software Almacén — MCN Digital Studio

Aplicación web profesional de gestión de almacén con base de datos SQLite, API REST, dashboard con gráficos y panel de seguimiento de demo.

## Instalación

```bash
npm install
```

## Configuración

Copiar el archivo de ejemplo y ajustar las variables:

```bash
cp .env.example .env
```

Variables de entorno disponibles:

| Variable         | Descripción                              | Por defecto          |
|------------------|------------------------------------------|----------------------|
| `PORT`           | Puerto en que escucha el servidor        | `3000`               |
| `DEMO_ADMIN_KEY` | Clave de acceso al panel de estadísticas | `mcndigitalstudio`   |

> ⚠️ Cambiar `DEMO_ADMIN_KEY` por un valor seguro antes de desplegar en producción.

## Ejecución

```bash
# Producción
npm start

# Desarrollo (reinicia automáticamente con Node 18+)
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`.  
La base de datos SQLite se crea automáticamente en `data/almacen.db` con usuarios demo:

| Nombre  | PIN  | Rol       |
|---------|------|-----------|
| Dueño   | 9999 | owner     |
| Admin   | 1234 | admin     |
| Vendedor| 0000 | cashier   |

## Estructura del proyecto

```
software-almacen/
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   └── design-system.css   # Sistema de diseño MCN (colores, dark mode, responsive)
│   │   ├── img/
│   │   │   └── logo2.svg           # Logo MCN Digital Studio
│   │   └── js/
│   │       ├── api.js              # Cliente REST API
│   │       ├── charts.js           # Gráficos Chart.js con colores MCN
│   │       └── theme.js            # Toggle dark/light mode
│   ├── css/                        # Estilos del frontend existente
│   ├── js/
│   │   └── app.js                  # Lógica frontend offline (localStorage)
│   └── *.html                      # Páginas de la aplicación
├── src/
│   ├── database/
│   │   ├── init.js                 # Inicialización y seed de la DB
│   │   └── schema.sql              # Esquema SQLite
│   ├── routes/
│   │   ├── products.js             # CRUD de productos
│   │   ├── sales.js                # Ventas con items y descuento de stock
│   │   ├── users.js                # CRUD de usuarios
│   │   ├── stock.js                # Movimientos y ajustes de stock
│   │   └── reports.js              # Reportes y estadísticas
│   └── services/
│       └── ticketGenerator.js      # Generación de tickets PDF (80mm)
├── data/
│   └── almacen.db                  # Base de datos SQLite (auto-generada)
├── server.js                       # Servidor Express
├── package.json
└── .env.example
```

## API REST

### Productos
| Método | Endpoint             | Descripción                        |
|--------|----------------------|------------------------------------|
| GET    | `/api/products`      | Listar todos los productos activos |
| GET    | `/api/products/:id`  | Obtener producto por ID o barcode  |
| POST   | `/api/products`      | Crear producto                     |
| PUT    | `/api/products/:id`  | Actualizar producto                |
| PATCH  | `/api/products/:id/stock` | Actualizar stock              |
| DELETE | `/api/products/:id`  | Eliminar producto (soft delete)    |

### Ventas
| Método | Endpoint          | Descripción                               |
|--------|-------------------|-------------------------------------------|
| GET    | `/api/sales`      | Listar ventas (?date, ?from, ?to, ?limit) |
| GET    | `/api/sales/:id`  | Obtener venta con items                   |
| POST   | `/api/sales`      | Crear venta (descuenta stock automáticamente) |

### Usuarios
| Método | Endpoint          | Descripción              |
|--------|-------------------|--------------------------|
| GET    | `/api/users`      | Listar usuarios activos  |
| GET    | `/api/users/:id`  | Obtener usuario          |
| POST   | `/api/users`      | Crear usuario            |
| PUT    | `/api/users/:id`  | Actualizar usuario       |
| DELETE | `/api/users/:id`  | Eliminar usuario         |

### Stock
| Método | Endpoint              | Descripción                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/stock`          | Listar movimientos (?product_id, ?type) |
| POST   | `/api/stock/adjust`   | Ajuste manual de stock (IN/OUT/ADJ) |

### Reportes
| Método | Endpoint                        | Descripción                         |
|--------|---------------------------------|-------------------------------------|
| GET    | `/api/reports/daily`            | Reporte del día (?date=YYYY-MM-DD)  |
| GET    | `/api/reports/weekly`           | Tendencia de los últimos 7 días     |
| GET    | `/api/reports/top-products`     | Productos más vendidos (30 días)    |
| GET    | `/api/reports/payment-methods`  | Distribución por método de pago     |
| GET    | `/api/reports/hourly`           | Ventas por hora del día             |
| GET    | `/api/reports/low-stock`        | Productos con stock crítico         |

### Demo Tracking
| Método | Endpoint                             | Descripción                           |
|--------|--------------------------------------|---------------------------------------|
| POST   | `/api/track/login`                   | Registra un evento de inicio de sesión |
| GET    | `/admin/demo-stats?key=<ADMIN_KEY>`  | Estadísticas de uso del demo          |

## Características

- 🎨 **Sistema de diseño MCN** — Colores corporativos, variables CSS, modo oscuro/claro
- 📊 **Dashboard con gráficos** — Ventas por hora, productos top, métodos de pago, tendencia semanal (Chart.js)
- 💾 **Base de datos SQLite** — Persistencia real con better-sqlite3, WAL mode, índices optimizados
- 🖨️ **Tickets PDF** — Generación de tickets de 80mm con pdfkit
- 📱 **Responsive** — Diseño adaptable a mobile, tablet y desktop
- 🌙 **Modo oscuro** — Toggle con persistencia en localStorage

