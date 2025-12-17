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

## Configuracion del backend (local vs produccion)

- Cuando ejecutas `npm run dev` la app apunta primero a `http://localhost:8080/api/v1` y, si no responde, cambia al backend desplegado.
- En build (`npm run build` o despliegues) el primer host es siempre el backend remoto (ngrok/IP) y se mantiene el fallback automatico.
- Puedes sobreescribir las URLs creando un archivo `.env` o `.env.development` con estas claves:

```bash
VITE_API_LOCAL_HOST=http://localhost:8080
VITE_API_PRIMARY_HOST=https://overintense-frederic-unpercipient.ngrok-free.dev
VITE_API_SECONDARY_HOST=http://98.89.104.110:8081
# Fuerza un entorno especifico sin importar el comando (local | production)
VITE_API_ENV=local
```

- Establece `VITE_API_ENV=production` si quieres probar contra el backend remoto aun estando en modo `dev`.

## Buenas practicas aplicadas

- Tipados compartidos en `src/types` para evitar any.
- ESLint + TypeScript estrictos (`tsconfig.*`) para mantener calidad.
- Helpers con pruebas unitarias (`api.helper.test.ts`, `cart.helper.test.ts`, etc.).
