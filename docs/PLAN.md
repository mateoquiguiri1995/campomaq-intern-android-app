# Campo Maq Ventas — Plan de desarrollo

App Android interna para el equipo de ventas de Campo Maq (< 10 vendedores).
Permite consultar productos, precios, stock y clientes, y más adelante
generar cotizaciones/proformas en PDF.

## Reglas de arquitectura (no negociables)

- La app **NUNCA** se conecta directamente a Postgres.
- Todo el flujo de datos es:

  ```
  Pantalla → componentes del feature → hooks/lógica simple → servicio API → Backend API → Postgres
  ```

- Organización por features (`src/features/<modulo>`), cada uno con sus
  `components/`, `services/` y `types.ts`.
- Los servicios (`productService`, `clientService`, etc.) son el único
  punto que cambia cuando pasemos de mocks al API real: las pantallas no
  deberían enterarse.
- Sin Redux, sin Firebase, sin librerías de UI pesadas. StyleSheet simple.
- Los secretos nunca van en variables `EXPO_PUBLIC_*`.

---

## Fase 0 — Esqueleto ✅ (esta fase)

- [x] Setup de Expo + TypeScript + Expo Router.
- [x] Navegación básica: login → tabs (Inicio, Catálogo, Clientes, Reportes).
- [x] Pantallas placeholder con estilo Campo Maq (amarillo/negro/gris).
- [x] Datos mock en `productService.ts` y `clientService.ts`.
- [x] Tokens de tema: `colors.ts`, `spacing.ts`, `typography.ts`.
- [x] Utilidades: `formatCurrency`, `getStockLabel`.
- [x] Arquitectura simple por features con comentarios TODO.

## Fase 1 — Autenticación

- [ ] Endpoint real de login en el backend Campo Maq.
- [ ] `authService.login()` llamando al API real vía `src/api/client.ts`.
- [ ] `AuthProvider` (Context) con la sesión del vendedor.
- [ ] Guardar token con `expo-secure-store`.
- [ ] Rutas protegidas: sin sesión → redirigir a `/login`.
- [ ] Logout (borrar token y volver al login).
- [ ] Opción "Mantener sesión".
- [ ] Manejo de errores: credenciales inválidas, sin conexión, servidor caído.
- El login con QR sigue deshabilitado (placeholder).

## Fase 2 — Catálogo

- [ ] API real de productos (lista + detalle).
- [ ] Búsqueda por nombre y código de producto.
- [ ] Filtrado por categorías real.
- [ ] Estado de stock (Sin stock / Stock bajo / Disponible).
- [ ] Mostrar "stock actualizado hace X min" (el backend actualiza cada 10 min).
- [ ] Precios A / B / C.
- [ ] Margen (%).
- [ ] Pantalla de detalle de producto.
- [ ] Carga de imagen del producto (con `expo-image`).

## Fase 3 — Clientes

- [ ] API real de clientes.
- [ ] Búsqueda de clientes.
- [ ] Pantalla de detalle de cliente.
- [ ] Historial de compras.
- [ ] Acciones de contacto: llamar / enviar correo.
- [ ] Botón "Nueva cotización" desde el detalle del cliente.

## Fase 4 — Cotización / Proforma

- [ ] Armado de cotización local (en el teléfono, sin backend).
- [ ] Agregar productos a la cotización desde el catálogo.
- [ ] Elegir lista de precios A / B / C por línea.
- [ ] Cantidad por producto.
- [ ] Descuento opcional.
- [ ] Cálculo de subtotal, IVA y total.
- [ ] Generar PDF localmente (ej. `expo-print`).
- [ ] Compartir el PDF por el share sheet de Android (WhatsApp, correo, etc.).
- **Importante:** en esta fase la cotización NO se guarda en la base de datos.

## Fase 5 — Distribución del APK

- [ ] Configurar EAS Build (ya existe `eas.json` con perfil `preview`).
- [ ] Generar APK interno: `eas build --platform android --profile preview`.
- [ ] Definir cómo compartir el APK con los vendedores (link de EAS o archivo).
- [ ] Pruebas en teléfonos Android físicos reales del equipo.
- [ ] Validar en Android 10 o superior.

## Fase 6 — Mejoras

- [ ] Estados de carga (spinners/esqueletos simples).
- [ ] Estados de error con reintento.
- [ ] Estados vacíos ("No se encontraron productos", etc.).
- [ ] Pulido general de UI.
- [ ] Caché básico de productos/clientes para navegación más fluida.
- [ ] (Futuro, no ahora) Modo offline.
- [ ] (Futuro, no ahora) Reportes de ventas en la pestaña Reportes.

---

## Qué NO hacer

- No conectar la app directamente a Postgres.
- No guardar cotizaciones en la base de datos (por ahora).
- No agregar Redux, Firebase ni gestores de estado complejos.
- No agregar animaciones complejas ni librerías de UI pesadas.
- No poner secretos en `EXPO_PUBLIC_*`.
- No sobre-diseñar: es una app interna para menos de 10 personas.
