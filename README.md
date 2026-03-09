# Software Almacén — MCN Digital Studio

Aplicación web profesional de gestión de almacén con base de datos SQLite, API REST, dashboard con gráficos y panel de seguimiento de demo.

## Instalación

```bash
npm install
```

## 🎨 Modo Demo

Para demostraciones a clientes:

1. Copiar `.env.example` a `.env`
2. Configurar `DEMO_MODE=true`
3. `npm start`
4. Visitar `http://localhost:3000`

**Usuarios demo:**
- Dueño: PIN `9999`
- Administrador: PIN `1234`
- Vendedor: PIN `5678` (rol: cashier)

**Características demo:**
- 50+ productos realistas
- 15 ventas de ejemplo
- Banner visible de modo demo
- Botón de reset de datos

---

## 🚀 Instalación Producción

Para clientes que compran:

```bash
npm install
npm run setup
# Seguir las instrucciones en pantalla
npm start
```

El script preguntará:
- Nombre del negocio
- Nombre del usuario dueño
- PIN inicial
- Genera JWT secret único

---

## 📋 Diferencias Demo vs Producción

| Feature | Demo | Producción |
|---------|------|------------|
| Datos iniciales | 50+ productos, ventas ejemplo | Solo usuario dueño |
| Banner visible | ✅ Sí | ❌ No |
| Endpoint reset | ✅ Habilitado | ❌ Deshabilitado |
| JWT Secret | Compartido | Único generado |
| Usuarios | 3 precargados | 1 creado en setup |

---

## Configuración

Copiar el archivo de ejemplo y ajustar las variables:

```bash
cp .env.example .env
```

Variables de entorno disponibles:

| Variable               | Descripción                              | Por defecto          |
|------------------------|------------------------------------------|----------------------|
| `PORT`                 | Puerto en que escucha el servidor        | `3000`               |
| `DEMO_ADMIN_KEY`       | Clave de acceso al panel de estadísticas | `mcndigitalstudio`   |
| `DEMO_MODE`            | Habilita modo demostración               | `false`              |
| `DEMO_AUTO_RESET_HOURS`| Horas para reset automático en demo      | `24`                 |
| `DEMO_BANNER_ENABLED`  | Muestra banner de modo demo              | `true`               |
| `JWT_SECRET`           | Clave secreta para tokens JWT            | —                    |
| `JWT_EXPIRES_IN`       | Expiración del token de acceso           | `8h`                 |
| `JWT_REFRESH_EXPIRES_IN`| Expiración del token de refresco        | `7d`                 |

> ⚠️ Cambiar `DEMO_ADMIN_KEY` y `JWT_SECRET` por valores seguros antes de desplegar en producción.

## Ejecución

```bash
# Producción
npm start

# Desarrollo (reinicia automáticamente con Node 18+)
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`.  
La base de datos SQLite se crea automáticamente en `data/almacen.db`.

En **modo producción** (por defecto) se crea un único usuario inicial:

| Nombre | PIN  | Rol   |
|--------|------|-------|
| Dueño  | 9999 | owner |

En **modo demo** (`DEMO_MODE=true`) se precarga con:

| Nombre       | PIN  | Rol   |
|--------------|------|-------|
| Dueño        | 9999 | owner |
| Administrador| 1234 | admin |
| Vendedor     | 5678 | cashier|

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
│   │       ├── demo-banner.js      # Banner y reset de modo demo
│   │       └── theme.js            # Toggle dark/light mode
│   ├── css/                        # Estilos del frontend existente
│   ├── js/
│   │   └── app.js                  # Lógica frontend offline (localStorage)
│   └── *.html                      # Páginas de la aplicación
├── scripts/
│   └── setup.js                    # Configurador interactivo para producción
├── src/
│   ├── database/
│   │   ├── demo-seed.js            # Datos de demostración (50+ productos, ventas)
│   │   ├── init.js                 # Inicialización y seed de la DB
│   │   └── schema.sql              # Esquema SQLite
│   ├── routes/
│   │   ├── demo.js                 # Endpoint de reset demo
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

### Demo Reset (solo cuando `DEMO_MODE=true`)
| Método | Endpoint           | Descripción                             |
|--------|--------------------|-----------------------------------------|
| GET    | `/api/demo/status` | Estado del modo demo                    |
| POST   | `/api/demo/reset`  | Resetea la base de datos de demo        |

## Características

- 🎨 **Sistema de diseño MCN** — Colores corporativos, variables CSS, modo oscuro/claro
- 📊 **Dashboard con gráficos** — Ventas por hora, productos top, métodos de pago, tendencia semanal (Chart.js)
- 💾 **Base de datos SQLite** — Persistencia real con better-sqlite3, WAL mode, índices optimizados
- 🖨️ **Tickets PDF** — Generación de tickets de 80mm con pdfkit
- 📱 **Responsive** — Diseño adaptable a mobile, tablet y desktop
- 🌙 **Modo oscuro** — Toggle con persistencia en localStorage

