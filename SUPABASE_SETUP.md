# Configuración de SincroFin

## Aplicación móvil

1. Copia `.env.example` como `.env` en la carpeta principal.
2. En Supabase, crea un proyecto y copia la URL y la clave publicable (anon) a esas dos variables.
3. En el SQL Editor de Supabase, ejecuta una sola vez `supabase/schema.sql` para una base nueva.
4. Para una base existente, ejecuta las migraciones pendientes de `supabase/` en orden numérico. `002_categories_kind.sql` prepara las categorías, `003_transaction_summary.sql` agrega el resumen del inicio, `004_create_family_atomic.sql` hace atómica la creación de grupos y `005_family_helper_privileges.sql` restringe las funciones de grupos a usuarios autenticados.
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

## App instalable para usar desde cualquier red

Expo Go sirve para desarrollo: el teléfono descarga el código desde Metro. Si el computador y el celular no están en la misma Wi-Fi, inicia el túnel incluido con `npm run start:tunnel`. El computador debe permanecer encendido y conectado a Internet mientras usas esa sesión; el enlace del túnel es público mientras el proceso esté abierto y puede ser más lento que LAN.

Para instalar una app que no dependa del servidor Expo del computador, usa EAS Build. El archivo `eas.json` incluye un perfil Preview para APK Android y un perfil Production para tienda. Antes de compilar:

1. Inicia sesión o crea una cuenta Expo con `npx eas-cli login`.
2. Enlaza este proyecto con tu cuenta mediante `npx eas-cli init`.
3. En el panel de Expo, crea `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` en los entornos `preview` y `production`.
4. Genera el instalador con `npm run build:android:apk` o `npm run build:ios:preview`.

El APK/IPA contiene el código de la app y funciona sin LAN ni Metro. Sigue necesitando Internet para iniciar sesión y sincronizar los datos con Supabase. La distribución iOS interna requiere cuenta y firma de Apple; para iPhone también se puede distribuir por TestFlight.

## Protección de credenciales

- No publiques `.env` ni claves privadas.
- La clave publicable/anon se usa en el cliente; la seguridad de los datos la aplican las políticas RLS.
- Nunca pongas una clave `service_role` en la app móvil ni en `api/.env`.
- En Android e iOS, la sesión se almacena con Expo SecureStore. En web se usa el almacenamiento del navegador.

## QR y conexión desde el celular

Abre en VS Code la carpeta del repositorio que contiene este archivo y `package.json`. Ejecuta `npm run start:lan` y escanea el QR si ambos equipos están en la misma red. Para probar desde una red distinta, ejecuta `npm run start:tunnel` y escanea el nuevo QR; el servidor debe permanecer activo en el computador. Para una app que se abra sin Metro, instala la compilación EAS descrita arriba.

El proyecto está fijado en Expo SDK 54 para abrirse con Expo Go de App Store en iOS. En un iPhone físico, Expo Go y la terminal deben usar la misma cuenta Expo. En Android, instala Expo Go compatible con SDK 54 si la versión de Play Store no coincide. La cámara y el escáner de facturas funcionan en dispositivos físicos iOS y Android.

El desbloqueo biométrico es opcional y se activa después de iniciar sesión en Android o en una compilación nativa de iOS. Face ID no está disponible en Expo Go para iOS; la sesión de Supabase igual queda guardada en almacenamiento seguro.
