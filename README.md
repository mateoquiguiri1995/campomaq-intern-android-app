# Campo Maq Ventas

App Android interna para el equipo de ventas de Campo Maq (Quito, Ecuador).
Permite consultar productos, precios, stock y clientes. Más adelante
generará cotizaciones/proformas en PDF.

**Estado actual: Fase 0 — esqueleto con datos mock.** No hay autenticación
real ni llamadas al backend todavía. Ver el roadmap completo en
[`docs/PLAN.md`](docs/PLAN.md).

## Requisitos

- Node.js 20 o superior.
- Un teléfono Android físico con la app **Expo Go** instalada
  ([Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)).
- **No necesitas Android Studio ni un emulador.** El desarrollo normal se
  hace con Expo Go en un teléfono real (ideal para laptops con pocos recursos).

## Cómo correr la app

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm start
```

Luego, en el teléfono:

1. Conecta el teléfono a la **misma red WiFi** que tu laptop.
2. Abre **Expo Go** y escanea el código QR que aparece en la terminal.
3. La app se carga en el teléfono. Cada cambio que guardes se recarga solo.

> Si la red WiFi bloquea la conexión, corre `npx expo start --tunnel`.

El emulador de Android Studio es **opcional**: si ya lo tienes instalado,
`npm run android` lo abre, pero no es necesario para desarrollar.

## Estructura del proyecto

```
app/                      # Rutas (Expo Router)
  _layout.tsx             # Stack raíz: login → tabs
  login.tsx               # Login (mock, sin autenticación real)
  (tabs)/                 # Pestañas: Inicio, Catálogo, Clientes, Reportes
src/
  api/client.ts           # Cliente HTTP (placeholder, ver TODOs)
  components/common/      # UI compartida (ScreenContainer, AppHeader, ...)
  features/               # Un folder por módulo de negocio
    auth/                 #   login (mock)
    catalog/              #   productos: componentes + servicio + tipos
    clients/              #   clientes: componentes + servicio + tipos
    quotes/               #   cotizaciones (placeholder, Fase 4)
    reports/              #   reportes (placeholder, Fase 6)
  theme/                  # Tokens: colores, espaciado, tipografía
  utils/                  # formatCurrency, getStockLabel
docs/PLAN.md              # Roadmap completo por fases
```

## ¿Dónde están los datos mock?

- Productos: `src/features/catalog/services/productService.ts`
- Clientes: `src/features/clients/services/clientService.ts`

## ¿Dónde irá la integración con el API real?

Cuando el backend esté listo, **solo cambian los servicios**, no las pantallas:

1. `src/api/client.ts` — implementar `apiGet()` con `fetch()`, la URL base
   de `EXPO_PUBLIC_API_BASE_URL` y el header `Authorization`.
2. Cada `*Service.ts` reemplaza su mock por una llamada a `apiGet()`.

Regla de oro: **la app nunca se conecta directamente a Postgres.** Todo pasa
por el backend API de Campo Maq.

Configuración local: copia `.env.example` a `.env` y ajusta los valores.
Nunca pongas secretos en variables `EXPO_PUBLIC_*` (van dentro del APK y
cualquiera puede leerlas).

## Cómo generar el APK interno (más adelante, Fase 5)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

El perfil `preview` de `eas.json` genera un **APK** instalable directamente
en los teléfonos de los vendedores (Android 10+), sin pasar por Play Store.
EAS entrega un link de descarga que se puede compartir por WhatsApp o correo.

## Convenciones de código

- TypeScript en todo el código; tipos simples, sin complejidad innecesaria.
- Estilos con `StyleSheet` y los tokens de `src/theme/` (no colores sueltos).
- Textos de UI en español.
- Pantallas pequeñas: la lógica va en servicios/hooks, la UI en componentes.
- Los `TODO(Fase N)` marcan exactamente dónde va el trabajo futuro.
