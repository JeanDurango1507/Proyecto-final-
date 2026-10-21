# Configuración de SincroFin

## Aplicación Expo

1. Copia `.env.example` como `.env`.
2. Completa la URL y la clave pública del mismo proyecto Supabase.
3. Ejecuta `npm install` y después `npx expo start --clear`.

## Base de datos

En un proyecto Supabase nuevo ejecuta `sincrofin_supabase_schema.sql` una sola vez.

En una base existente ejecuta las migraciones dentro de `supabase/` en orden. `002_categories_kind.sql` repara la columna `kind` de `categories` sin eliminar datos.

La aplicación registra usuarios mediante Supabase Auth. El trigger del esquema crea su fila en `public.profiles`. Los movimientos se guardan en `public.transactions` y las categorías se consultan desde `public.categories`.

No subas `.env` ni ninguna clave `service_role` al repositorio.
