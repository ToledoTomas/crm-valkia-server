# CRM Valkia Backend

Sistema de gestión para negocio de indumentaria femenina. Backend REST API construido con [NestJS](https://nestjs.com/) y TypeScript.

## 🎯 Características Principales

- ✅ **Productos con Variantes**: Gestión de productos con múltiples combinaciones de color/talle
- ✅ **Control de Stock**: Descuento automático de inventario en cada venta con historial de movimientos
- ✅ **Gestión de Ventas**: Creación de facturas con snapshot de precios y costos
- ✅ **Análisis de Rentabilidad**: Reportes de ganancias por producto y categoría
- ✅ **Segmentación de Clientes**: Clasificación automática (Nuevo/Recurrente/VIP/Inactivo)
- ✅ **Dashboard**: KPIs en tiempo real (ventas, ganancias, stock bajo)
- ✅ **Autenticación JWT**: Sistema de login seguro

## 🛠 Stack Tecnológico

- **Framework**: NestJS v11
- **Lenguaje**: TypeScript
- **ORM**: TypeORM
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (jsonwebtoken)
- **Testing**: Jest
- **Validación**: class-validator + class-transformer

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL 12+
- npm o yarn

## 🚀 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd crm-valkia/backend/crm-valkia
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crear archivo `.env` en la raíz:

   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5432
   DB_DATABASE=crm_valkia
   DB_USERNAME=postgres
   DB_PASSWORD=tu_password
   JWT_SECRET_TOKEN=tu_secret_key_super_segura
   ```

4. **Ejecutar migraciones de base de datos**

   ```bash
   npm run migration:run
   ```

5. **Iniciar el servidor**

   ```bash
   # Modo desarrollo (con hot-reload)
   npm run start:dev

   # Modo producción
   npm run start:prod
   ```

## 🔐 Autenticación

Todas las rutas (excepto login/register) requieren autenticación JWT.

**Obtener token:**

```bash
POST /auth/register
{
  "email": "admin@crm.com",
  "password": "password123"
}

POST /auth/login
{
  "email": "admin@crm.com",
  "password": "password123"
}
# Response: { "accessToken": "eyJhbGciOiJIUzI1NiIs..." }
```

**Usar token:**

```bash
Authorization: Bearer <accessToken>
```

## 📚 API Endpoints

### Auth

```
POST   /auth/register    - Registrar nuevo usuario
POST   /auth/login       - Iniciar sesión
GET    /auth/profile     - Obtener perfil del usuario actual
```

### Productos

```
GET    /products                    - Listar productos (con variantes)
GET    /products/search             - Buscar productos por nombre
GET    /products/:id                - Obtener producto específico
POST   /products                    - Crear producto
PATCH  /products/:id                - Actualizar producto
DELETE /products/:id                - Eliminar producto

# Gestión de Variantes
POST   /products/:id/variants       - Agregar variante a producto
PATCH  /products/variants/:id       - Actualizar variante
DELETE /products/variants/:id       - Eliminar variante
```

### Clientes

```
GET    /customer              - Listar clientes
GET    /customer/search       - Buscar clientes por nombre
GET    /customer/:id          - Obtener cliente específico
POST   /customer              - Crear cliente
PATCH  /customer/:id          - Actualizar cliente
DELETE /customer/:id          - Eliminar cliente (soft-delete)
```

**Campos calculados automáticos:**

- `totalSpent`: Total gastado por el cliente
- `lastPurchase`: Fecha de última compra
- `orderCount`: Cantidad de órdenes
- `classification`: Nuevo/Recurrente/VIP/Inactivo

### Ventas (Invoices)

```
GET    /invoice               - Listar ventas
GET    /invoice/:id           - Obtener venta específica
POST   /invoice               - Crear nueva venta
DELETE /invoice/:id           - Eliminar venta (revertir stock)
```

**Crear venta:**

```json
{
  "customerId": 1, // opcional
  "items": [
    {
      "productVariantId": 1,
      "quantity": 2
    }
  ]
}
```

**Notas:**

- El stock se descuenta automáticamente
- Se guarda snapshot de precios (priceAtSale, costAtSale)
- Se calcula automáticamente: total, totalCost, totalProfit
- Se registra movimiento de stock tipo SALE

### Stock

```
GET    /stock                 - Listar variantes con stock
GET    /stock/low             - Listar productos con stock bajo
GET    /stock/movements/:id   - Ver historial de movimientos
POST   /stock/adjust          - Ajustar stock manualmente
```

**Ajuste manual:**

```json
{
  "productVariantId": 1,
  "quantity": 5, // positivo: sumar, negativo: restar
  "reason": "Ajuste por inventario físico"
}
```

### Dashboard

```
GET    /dashboard/kpis              - KPIs principales
GET    /dashboard/sales-by-month    - Ventas últimos 12 meses
GET    /dashboard/profit-by-month   - Ganancias últimos 12 meses
GET    /dashboard/top-products      - Top 5 productos más vendidos
```

**KPIs retornados:**

- `salesToday`: Ventas del día
- `salesThisMonth`: Ventas del mes
- `profitThisMonth`: Ganancia del mes
- `averageTicket`: Ticket promedio
- `topProduct`: Producto más vendido
- `lowStockCount`: Cantidad de productos con stock bajo
- `newCustomersThisMonth`: Clientes nuevos del mes

### Reportes

```
GET    /reports/profitability/products      - Rentabilidad por producto
GET    /reports/profitability/categories    - Rentabilidad por categoría
GET    /reports/products/no-rotation        - Productos sin rotación
GET    /reports/customers/top-spenders      - Clientes que más gastan
GET    /reports/sales                       - Ventas por rango de fecha
```

## 🗄 Modelo de Datos

### Entidades Principales

```
Product
├── id (PK)
├── name
├── category
├── description
├── active
├── variants[] (1:N ProductVariant)
└── createdAt

ProductVariant
├── id (PK)
├── productId (FK)
├── color
├── size
├── cost
├── price
├── stock
├── minStock
├── invoiceItems[] (1:N InvoiceItem)
└── stockMovements[] (1:N StockMovement)

Customer
├── id (PK)
├── name
├── phone
├── email
├── instagram
├── birthday
├── invoices[] (1:N Invoice)
├── deletedAt (soft-delete)
└── createdAt

Invoice
├── id (PK)
├── customerId (FK, nullable)
├── total
├── totalCost
├── totalProfit
├── items[] (1:N InvoiceItem)
└── createdAt

InvoiceItem
├── id (PK)
├── invoiceId (FK)
├── productVariantId (FK)
├── quantity
├── priceAtSale  ← snapshot
├── costAtSale   ← snapshot

StockMovement
├── id (PK)
├── productVariantId (FK)
├── type (SALE | MANUAL_ADJUSTMENT)
├── quantity
├── reason
└── createdAt
```

## 🧪 Testing

```bash
# Unit tests
$ npm run test

# Tests en modo watch
$ npm run test:watch

# Coverage report
$ npm run test:cov

# E2E tests
$ npm run test:e2e
```

## 🔄 Migraciones

```bash
# Generar migración después de cambiar entidades
$ npm run migration:generate -- src/migrations/NombreMigracion

# Ejecutar migraciones pendientes
$ npm run migration:run

# Revertir última migración
$ npm run migration:revert

# Crear migración vacía
$ npm run migration:create -- src/migrations/NombreMigracion
```

## 📁 Estructura del Proyecto

```
src/
├── auth/                    # Autenticación (JWT)
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   └── auth.guard.ts
├── customer/                # Módulo de clientes
│   ├── dto/
│   ├── entity/
│   ├── customer.controller.ts
│   ├── customer.module.ts
│   └── customer.service.ts
├── dashboard/               # Dashboard y KPIs
│   ├── dashboard.controller.ts
│   ├── dashboard.module.ts
│   └── dashboard.service.ts
├── invoice/                 # Ventas
│   ├── dto/
│   ├── entity/
│   ├── invoice.controller.ts
│   ├── invoice.module.ts
│   └── invoice.service.ts
├── product/                 # Productos y variantes
│   ├── dto/
│   ├── entities/
│   ├── product.controller.ts
│   ├── product.module.ts
│   └── product.service.ts
├── reports/                 # Reportes
│   ├── reports.controller.ts
│   ├── reports.module.ts
│   └── reports.service.ts
├── stock/                   # Inventario
│   ├── dto/
│   ├── entity/
│   ├── stock.controller.ts
│   ├── stock.module.ts
│   └── stock.service.ts
├── user/                    # Usuarios
│   ├── dto/
│   ├── entity/
│   ├── user.controller.ts
│   ├── user.module.ts
│   └── user.service.ts
├── common/                  # Utilidades compartidas
│   ├── dto/
│   └── interfaces/
├── app.module.ts           # Módulo principal
├── data-source.ts          # Configuración TypeORM
└── main.ts                # Punto de entrada
```

## 🔧 Scripts Útiles

```bash
# Formatear código
$ npm run format

# Linting
$ npm run lint

# Build para producción
$ npm run build

# Verificar build
$ npm run build && echo "Build exitoso!"
```

## 📝 Notas de Implementación

### Lógica de Negocio

1. **Variantes de Producto**: Cada producto puede tener múltiples variantes (color + talle) con stock, costo y precio independientes.

2. **Descuento Automático**: Al crear una venta, el stock se descuenta automáticamente de las variantes correspondientes.

3. **Snapshot de Precios**: En cada venta se guardan `priceAtSale` y `costAtSale` para mantener histórico exacto aunque cambien los precios del producto.

4. **Clasificación de Clientes**: Automática basada en cantidad de compras:
   - Nuevo: 1 compra
   - Recurrente: 2-5 compras
   - VIP: 6+ compras
   - Inactivo: 90+ días sin comprar

5. **Movimientos de Stock**: Todos los cambios de inventario se registran (ventas y ajustes manuales).

### Seguridad

- Todas las rutas protegidas con JWT
- Contraseñas hasheadas con bcrypt
- Soft-delete en clientes (no se pierde historial)
- Transacciones para operaciones críticas (ventas)

## 📄 Licencia

UNLICENSED

---

**Desarrollado para CRM Valkia** 🚀
