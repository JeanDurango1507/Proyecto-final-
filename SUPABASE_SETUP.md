# Configuración de SincroFin

## Aplicación móvil

1. Copia `.env.example` como `.env` en la carpeta principal.
2. En Supabase, crea un proyecto y copia la URL y la clave publicable (anon) a esas dos variables.
3. En el SQL Editor de Supabase, ejecuta una sola vez `supabase/schema.sql` para una base nueva.
4. Para una base existente, ejecuta las migraciones pendientes de `supabase/` en orden numérico. `002_categories_kind.sql` prepara las categorías, `003_transaction_summary.sql` agrega el resumen del inicio y `004_create_family_atomic.sql` hace atómica la creación de grupos.
5. Desde la carpeta principal ejecuta `npm install` y luego `npm run start:lan`.
6. Conecta el teléfono a la misma red Wi-Fi. En iPhone usa Expo Go de App Store e inicia sesión con la misma cuenta Expo que usa la terminal. En Android instala una versión de Expo Go compatible con SDK 54 desde [expo.dev/go](https://expo.dev/go) si la versión de Play Store no abre el proyecto. Escanea el QR que muestra la terminal de VS Code.

La cuenta se registra con Supabase Auth. Si el proyecto exige confirmar el correo, confirma el mensaje antes de iniciar sesión. El trigger del esquema crea el perfil. Los grupos, categorías y movimientos se consultan y guardan en Supabase; las políticas RLS limitan cada solicitud a los datos que puede consultar el usuario autenticado. Al crear un movimiento de gasto, el botón **Leer QR de factura** lee códigos QR con campos JSON como `title` y `amount`; el usuario revisa y confirma los datos antes de guardarlos.

## API Express opcional

La carpeta `api/` contiene rutas REST para salud, acceso y movimientos. Para ejecutarla:

1. Copia `api/.env.example` como `api/.env`.
2. Configura `SUPABASE_URL` y la clave publicable del mismo proyecto.
3. Ejecuta `npm install` y `npm run dev` dentro de `api/`.
4. Comprueba `http://localhost:3000/api/v1/health`.

Para consumirla desde un navegador local, ajusta `CORS_ORIGINS` a su origen. Una app móvil nativa no usa CORS. Las rutas de movimientos requieren `Authorization: Bearer <access_token>` y delegan la autorización en las políticas RLS de Supabase.

## Protección de credenciales

- No publiques `.env` ni claves privadas.
- La clave publicable/anon se usa en el cliente; la seguridad de los datos la aplican las políticas RLS.
- Nunca pongas una clave `service_role` en la app móvil ni en `api/.env`.
- En Android e iOS, la sesión se almacena con Expo SecureStore. En web se usa el almacenamiento del navegador.

## QR y conexión desde el celular

Abre en VS Code la carpeta del repositorio que contiene este archivo y `package.json`. Desde la terminal integrada ejecuta `npm run start:lan` y escanea el QR. El teléfono y el computador deben estar en la misma red. El QR en modo LAN no publica el servidor en Internet.

El proyecto está fijado en Expo SDK 54 para abrirse con Expo Go de App Store en iOS. En un iPhone físico, Expo Go y la terminal deben usar la misma cuenta Expo. En Android, instala Expo Go compatible con SDK 54 si la versión de Play Store no coincide. Si la red bloquea la conexión LAN, ejecuta `npm run start:tunnel`; el túnel suele ser más lento. La cámara y el escáner de facturas funcionan en dispositivos físicos iOS y Android.

El desbloqueo biométrico es opcional y se activa después de iniciar sesión en Android o en una compilación nativa de iOS. Face ID no está disponible en Expo Go para iOS; la sesión de Supabase igual queda guardada en almacenamiento seguro.
