# SincroFin

Aplicación móvil de finanzas personales y familiares construida con Expo, React Native, TypeScript y Supabase.

## Primeros pasos

1. Configura `.env` con los valores de `.env.example`.
2. Prepara la base de datos con `SUPABASE_SETUP.md`.
3. Ejecuta `npm install`, `npm run typecheck` y `npm run start:lan`.

La API REST opcional está en `api/`; su guía está en `api/README.md`. El recorrido y la demostración del proyecto están en `GUIA_PRESENTACION.md`.

## Funciones

- Registro, inicio y recuperación de contraseña.
- Ingresos y gastos con categorías y grupos familiares.
- Resumen de ingresos, gastos, saldo total e historial paginado.
- Validación de datos, manejo de errores y políticas RLS.
- Sesión cifrada del dispositivo en Android/iOS con Expo SecureStore.
- QR de Expo Go para abrir la app en equipos conectados a la misma red.
- Escaneo de QR de facturas desde la cámara del celular antes de guardar el gasto.
