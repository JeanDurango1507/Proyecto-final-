# SincroFin

Aplicación móvil de finanzas personales y familiares construida con Expo, React Native, TypeScript y Supabase.

## Primeros pasos

1. Configura `.env` con los valores de `.env.example`.
2. Prepara la base de datos con `SUPABASE_SETUP.md`.
3. Ejecuta `npm install` y `npm run typecheck`.
4. Para Expo Go, inicia con `npm run start:lan` en la misma Wi-Fi. Desde otra red, usa `npm run start:tunnel` mientras el computador siga encendido y conectado a Internet.
5. Para instalar la app sin depender del servidor Expo de tu computador, configura EAS como se explica en `SUPABASE_SETUP.md` y genera un APK o una compilación para iOS.

La API REST opcional está en `api/`; su guía está en `api/README.md`. El recorrido y la demostración del proyecto están en `GUIA_PRESENTACION.md`.

## Funciones

- Registro, inicio y recuperación de contraseña.
- Ingresos y gastos con categorías y grupos familiares.
- Resumen de ingresos, gastos, saldo total e historial paginado.
- Validación de datos, manejo de errores y políticas RLS.
- Sesión cifrada del dispositivo en Android/iOS con Expo SecureStore.
- QR de Expo Go para abrir la app en equipos conectados a la misma red.
- Escaneo de QR de facturas desde la cámara del celular antes de guardar el gasto.
- Desbloqueo biométrico opcional: Android en Expo Go y Android/iOS en compilaciones nativas. La huella o el rostro los valida el sistema operativo; la app no almacena datos biométricos.

## Qué incluye este proyecto

- `src/`: frontend Expo/React Native, navegación, autenticación, cámara QR y pantallas.
- `src/lib` y `src/services`: conexión HTTPS directa con Supabase para usuarios, categorías, grupos y movimientos.
- `supabase/`: esquema de base de datos, políticas RLS y migraciones.
- `api/`: backend REST Express opcional; la app móvil principal no depende de él.
- `eas.json`: perfiles para compilar un APK de prueba Android o una versión de producción.

Supabase es el backend alojado en la nube. El frontend no necesita estar en la misma Wi-Fi para conectarse a esa base; necesita acceso a Internet. Expo Go en desarrollo sí necesita que Metro sea alcanzable por LAN o túnel.

## Compilaciones instalables

La app instalada incluye el bundle móvil y se conecta directamente a Supabase por Internet; no necesita la red Wi-Fi ni el servidor Metro del computador. El perfil Android genera un APK de prueba. Las compilaciones iOS necesitan credenciales de Apple y se distribuyen con TestFlight o mediante distribución interna.

```text
npm run build:android:apk
npm run build:ios:preview
```

Configura `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` también en los entornos Preview y Production de EAS. La API Express no hace falta para compilar ni para conectar la app móvil.

El APK Android de prueba de la versión 1.0.0 se descarga desde [GitHub Releases](https://github.com/JeanDurango1507/Proyecto-final-/releases/tag/sincrofin-android-preview-1).
