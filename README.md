# Banco-frontend

Frontend – Sistema de Gestión de Préstamos para el backend **Banco-backend**.  
Forma parte de un proyecto académico de bases de datos relacionales sobre Oracle, donde el backend expone una API REST y la lógica de negocio principal (préstamos, cuotas, mora, penalizaciones, auditoría, etc.) reside en la base de datos y en procedimientos PL/SQL.

## Stack tecnológico

- React + TypeScript
- Vite
- React Router v6
- Zustand para estado global
- Axios como cliente HTTP
- Material UI (iconos y algunos componentes básicos)
- React Hook Form para formularios
- Recharts para algunos gráficos de reportes
- Vitest + React Testing Library para tests

## Arquitectura del frontend

La estructura del proyecto sigue una arquitectura por dominio, con separación explícita entre:

- Modelos de dominio del frontend y mapeos desde la API.
- Clientes HTTP (capa API).
- Stores de Zustand.
- Páginas y componentes de presentación.

Estructura principal:

- `src/app/`
  - `router/` – Ruteo principal (React Router), protección por rol (`RequireAuth`, `RequireRole`), lazy loading.
  - `providers/` – Proveedores globales: tema MUI, router, error boundary, notificaciones.
  - `store/` – Estado global transversal (UI, notificaciones, auth “re-export”).

- `src/modules/` – Módulos por dominio:
  - `auth/`
    - `api/` – login y servicios de autenticación.
    - `store/` – `useAuthStore` (token, usuario, roles).
    - `pages/` – `LoginPage`.
  - `prestatarios/`
    - `domain/` – modelo `Prestatario` + mappers desde la API.
    - `api/` – clientes HTTP (`prestatariosApi.ts`).
    - `store/` – `usePrestatariosStore`.
    - `pages/` – listado (`PrestatariosListPage`), formulario (`PrestatarioFormPage`).
    - `components/` – formulario, carga masiva, etc.
  - `prestamos/`
    - `domain/` – modelo `Prestamo`, `CuotaResumen` + mappers.
    - `api/` – `prestamosApi.ts`.
    - `store/` – `usePrestamosStore`.
    - `pages/` – listado, detalle, formulario.
  - `cuotas/`
    - `domain/` – modelo `Cuota` + mappers.
    - `api/` – `cuotasApi.ts`.
    - `store/` – `useCuotasStore`.
    - `pages/` – `CuotasListPage`.
  - `reportes/`
    - `domain/` – tipos de filas de reporte (`ReporteRow`).
    - `api/` – `reportesApi.ts`.
    - `pages/` – resumen de préstamos, morosos, refinanciaciones.
  - `notificaciones/`
    - `domain/` – modelo `Notificacion`.
    - `api/` – `notificacionesApi.ts`.
    - `pages/` – `NotificacionesPage`.
  - `auditoria/`
    - `api/` – `auditoriaApi.ts`.
    - `pages/` – `AuditoriaPage`.
  - `empleados/`
    - `domain/` – modelo `Empleado`.
    - `api/` – `empleadosApi.ts`.
    - `store/` – `useEmpleadosStore`.
    - `pages/` – listado y formulario de empleados.

- `src/shared/`
  - `api/httpClient.ts` – instancia de Axios con:
    - `baseURL = VITE_API_BASE_URL`.
    - Interceptor que agrega `Authorization: Bearer <token>`.
    - Interceptor de errores que normaliza mensajes de negocio y maneja 401/403.
  - `components/`
    - `Layout/MainLayout.tsx` – Navbar, sidebar y slots para las páginas.
    - `FullPageLoader.tsx` – loader para lazy loading.
    - `ui/` – `AppTable`, `AppButton`, `AppCard`, etc.
  - `hooks/` – hooks reutilizables (`usePagination`, `useConfirmationDialog`).
  - `utils/` – utilidades (`format.ts` para formato de dinero y fechas).
  - `types/` – tipos globales compartidos (actualmente `ReporteRow`).

### Capas por dominio

Dentro de cada módulo de dominio (`src/modules/<modulo>`):

- `domain/`
  - Define el **modelo de dominio del frontend** (p. ej., `Prestamo`, `Cuota`, `Prestatario`, `Notificacion`, `Empleado`).
  - Expone funciones de mapeo desde la respuesta cruda de la API (`mapXxxFromApi`, `mapXxxsFromApi`).

- `api/`
  - Contiene los **clientes HTTP** que llaman a `/api/*` usando `httpClient`.
  - Siempre devuelven tipos de dominio del frontend, nunca respuestas crudas de la API.

- `store/`
  - Usa Zustand y trabaja únicamente con modelos de dominio, sin mapeos de API.
  - Expone acciones como `fetchAll`, `create`, `update`, `remove`, etc.

- `pages/` y `components/`
  - Solo consumen el store y la capa API por medio del store.
  - Representan la UI y la lógica de presentación (formularios, tablas, filtros).

## Configuración y ejecución

### Instalación

```bash
cd Banco-frontend
npm install
```

### Variables de entorno

Crear un archivo `.env` en la raíz (o usar variables de entorno del sistema) con al menos:

```env
VITE_API_BASE_URL=http://localhost:3000
```

El backend (Banco-backend) expone los endpoints bajo `/api/*` en ese host/puerto.

### Desarrollo

```bash
npm run dev
```

La aplicación se levanta normalmente en `http://localhost:5173`.

### Tests

El proyecto está configurado con Vitest y React Testing Library:

```bash
npm test
npm run test:watch
```

Configuración relevante:

- `vitest.config.ts` – extiende la configuración de Vite y configura `environment: "jsdom"` y `setupFiles`.
- `src/tests/setupTests.ts` – carga `@testing-library/jest-dom`.

## Integración con Banco-backend

Todas las peticiones HTTP se realizan contra el microservicio Banco-backend:

- Base URL: `VITE_API_BASE_URL` (por defecto `http://localhost:3000`).
- Prefijo de API: `/api/*`.

Ejemplos:

- Autenticación:
  - `POST /api/auth/login` con `{ username, password }`.
  - Devuelve `{ success: true, data: { token }, message }`.
  - El token se guarda en `useAuthStore` y se envía automáticamente en `Authorization: Bearer <token>`.

- Préstamos:
  - `GET /api/prestamos` – listado global (empleados).
  - `GET /api/prestamos/prestatario/:ci` – préstamos del prestatario.
  - `POST /api/prestamos` – crear préstamo.
  - `PUT /api/prestamos/:idPrestamo` – actualizar estado.
  - `DELETE /api/prestamos/:idPrestamo` – marcar como CANCELADO.

- Cuotas:
  - `GET /api/cuotas/pendientes` y `GET /api/cuotas/morosas`.
  - `POST /api/cuotas/:idCuota/pagar`.

Manejo de errores:

- `401 Unauthorized` – el `httpClient` hace logout y redirige a `/login`.
- `403 Forbidden` – el `httpClient` redirige a `/acceso-denegado`.
- Errores de negocio (`400/409` con mensajes como “El prestatario ya tiene 2 préstamos activos”) se muestran:
  - En snackbars globales (NotificationProvider) y
  - Dentro de los formularios/pantallas relevantes mediante `Alert` de MUI.

## Roles y permisos en la UI

Roles manejados por el frontend usando el payload del JWT:

- `PRESTATARIO`
  - Ve sus propios préstamos (y detalle de cuotas).
  - Puede solicitar nuevo préstamo (dentro de las reglas del backend).
  - Puede pagar sus cuotas desde la UI.
  - Ve sus notificaciones (recordatorios, mora, cancelación).

- `EMPLEADO`
  - Ve todos los prestatarios.
  - Gestiona préstamos globalmente (creación, actualización, cancelación).
  - Ve y usa reportes (resumen, morosos, refinanciaciones).
  - Gestiona notificaciones de forma masiva.
  - Accede a la sección de auditoría manual.

- `ADMIN`
  - Tiene capacidades de `EMPLEADO`.
  - Además, gestiona empleados desde el módulo de empleados.

Protecciones:

- `RequireAuth` – protege rutas si no hay token → redirige a `/login`.
- `RequireRole` – protege rutas por rol (empleados, admin, prestatarios) → redirige a `/acceso-denegado` si el rol no coincide.
- El menú lateral (`MainLayout`) se adapta según el rol: el prestatario solo ve “Mis préstamos” y “Mis notificaciones”; empleados y admin ven módulos administrativos.

## Módulos funcionales

### Auth

- Login (`LoginPage`) con validación (`react-hook-form`) y manejo de errores.
- `useAuthStore`:
  - Guarda `token` y `user` ({ id, username, role, id_prestatario }).
  - Decodifica el JWT en el frontend.
  - Expone helpers `isEmpleado`, `isPrestatario`, `isAdmin`.

### Prestatarios

- Listado de prestatarios (`PrestatariosListPage`) con tabla, búsqueda básica y acciones (editar/eliminar).
- Formulario de alta (`PrestatarioFormPage` + `PrestatarioForm`).
- Carga masiva (`PrestatariosBulkUploadSection`):
  - Sube archivo CSV/TXT, llama a `cargaMasivaPrestatarios`.
  - Muestra resultados (totales, aceptados, rechazados).
  - Consulta y muestra logs de carga.

### Prestamos

- Listado (`PrestamosListPage`):
  - Filtros por estado e ID de prestatario.
  - Uso de `formatCurrencyCOP` y `formatDate`.
- Formulario (`PrestamoFormPage`):
  - Solicitud de nuevo préstamo con validaciones.
  - Muestra reglas de negocio clave:
    - Máximo 2 préstamos activos por prestatario.
    - Tipos de interés BAJA/MEDIA/ALTA con tooltips explicativos.
  - Muestra errores de negocio del backend en Alerts y snackbars.
- Detalle (`PrestamoDetailPage`):
  - Información del préstamo (monto, cuotas, interés, fechas, estado).
  - Cuotas asociadas (resumen).
  - Indica si el prestatario se aproxima/alcanza el límite de 2 préstamos activos.

### Cuotas

- `CuotasListPage` (por préstamo):
  - Muestra cuotas pendientes y morosas.
  - Permite pagar solo cuotas en estado PENDIENTE (tooltip y botón deshabilitado para el resto).
  - Muestra mensajes de negocio del backend cuando un pago no es válido.

### Reportes

- `ResumenPrestamosPage`:
  - Tarjetas de totales.
  - Gráfico circular con distribución de préstamos por estado.
  - Texto de ayuda orientado a interpretar la salud de la cartera.
- `MorososPage`:
  - Tabla dinámica de prestatarios/préstamos morosos.
- `RefinanciacionesPage`:
  - Tabla dinámica de refinanciaciones activas.

### Notificaciones

- `NotificacionesPage`:
  - Tab “Pendientes” y “Histórico”.
  - Para prestatarios: solo sus notificaciones.
  - Para empleados: vista global + acciones masivas (recordatorios de pago, mora, cancelación).
  - Iconos diferentes para enviadas/no enviadas.

### Auditoría

- `AuditoriaPage`:
  - Permite registrar eventos de auditoría manuales (usuario, IP, dominio, tabla, operación, descripción).
  - Explica que la consulta del log completo se hace en el backend/Oracle.

### Empleados

- `EmpleadosListPage`:
  - Lista de empleados, acciones de edición y eliminación.
- `EmpleadoFormPage`:
  - Alta y edición de empleados (campos básicos).
  - Usa `react-hook-form` para validación.

## Reglas de negocio visibles en la UI

La lógica de negocio vive en Banco-backend y en la base de datos Oracle. El frontend **no reimplementa las reglas**, solo las refleja y guía al usuario:

- Máximo 2 préstamos activos por prestatario:
  - El formulario de solicitud advierte de esta regla.
  - El detalle del préstamo muestra cuántos préstamos activos tiene el cliente.
  - Si se viola la regla, el backend devuelve un error que se muestra en el formulario/snackbar.

- Tipos de interés (BAJA / MEDIA / ALTA):
  - Formularios y detalles incluyen tooltips explicando el efecto sobre el monto total y las cuotas.

- Mora y penalizaciones:
  - Cuotas morosas se muestran con iconos y estilos diferenciados.
  - Textos explican que pueden generarse penalizaciones según la política de la entidad.

- Pagos de cuota:
  - Solo se permiten acciones sobre cuotas pendientes; el botón de pago se desactiva para otros estados y explica el motivo.

## Ideas futuras / TODO

- i18n y soporte multimoneda.
- Modo oscuro completo con MUI.
- Más gráficos en reportes (líneas de tiempo, comparativos).
- Mejoras de accesibilidad (roles ARIA, navegación por teclado).
- Filtros avanzados por rango de fechas y montos en listas de préstamos y reportes.

