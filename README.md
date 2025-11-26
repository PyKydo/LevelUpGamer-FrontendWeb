# LevelUpGamer Frontend

Esta app web en React + TypeScript + Vite es un E-commerce para una tienda llamada Level-Up Gamer. El sitio muestra productos gamer, entradas de blog y un carrito sencillo.

## Stack tecnico

Elegimos herramientas conocidas en el curso para no complicarnos de mas:

- `React 18` con `TypeScript` para ganar tipado y componentes declarativos.
- `Vite` porque levanta el entorno en segundos y facilita el HMR.
- `React Context` y hooks personalizados (`src/hooks`) para manejar autenticacion, carrito, busquedas y notificaciones.
- `Vitest` + `React Testing Library` (tests en `src/**/*.test.ts(x)`) para comprobar helpers y escenarios criticos.

## Estructura principal

- `src/components`: UI reutilizable dividida en `auth`, `common`, `layout` y `products`.
- `src/pages`: vistas completas como inicio, tienda, blog, carrito y detalle.
- `src/hooks`: proveedores y hooks (`AuthProvider`, `CartProvider`, `SearchProvider`, `useNotification`, etc.).
- `src/helpers`: utilidades puras para API mock, formato de datos, validaciones y almacenamiento local.

## Flujo funcional destacado

1. **Explorar productos**: la pagina principal permite filtrar por categoria y agregar items al carrito global.
2. **Blog**: hay pagina de listado y detalle con navegacion sencilla.
3. **Carrito**: `CartContext` maneja cantidades, totales y persistencia en `localStorage` (helper `storage.helper.ts`).
4. **Autenticacion basica**: `AuthContext` simula login/registro con datos de usuarios para proteger secciones.
5. **Notificaciones**: `NotificationProvider` muestra avisos rapidos (por ejemplo, producto agregado o error de validacion).

## Como ejecutar el proyecto

```bash
npm install
npm run dev
```

El servidor de desarrollo queda en `http://localhost:5173`. Cuando necesitamos demostrar funcionalidades en laboratorio corremos las pruebas automaticas:

```bash
npm run test
```

## Buenas practicas aplicadas

- Tipados compartidos en `src/types` para evitar any.
- ESLint + TypeScript estrictos (`tsconfig.*`) para mantener calidad.
- Helpers con pruebas unitarias (`api.helper.test.ts`, `cart.helper.test.ts`, etc.).
