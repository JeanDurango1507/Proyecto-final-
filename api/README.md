# API REST de SincroFin

La API Express entrega rutas JSON para salud, registro, inicio de sesión y movimientos. Los movimientos requieren un access token de Supabase; la API lo reenvía a PostgREST y Supabase aplica RLS.

## Inicio

Desde esta carpeta, copia `.env.example` a `.env`, configura la URL y la clave publicable del proyecto y ejecuta:

```text
npm install
npm run dev
```

La ruta de salud es `GET /api/v1/health`. Para acceso desde Expo Web, configura `CORS_ORIGINS` con el origen local exacto. La app móvil nativa no requiere CORS.

## Rutas

| Método y ruta | Uso |
| --- | --- |
| `GET /api/v1/health` | Estado del servidor. |
| `POST /api/v1/register` | Registro con `{ "name", "email", "password" }`. |
| `POST /api/v1/login` | Inicio con `{ "email", "password" }`; devuelve el token de Supabase. |
| `GET /api/v1/transactions?limit=20&offset=0` | Lista paginada con `Authorization: Bearer <token>`. |
| `GET /api/v1/transactions/:id` | Consulta un movimiento propio o de un grupo autorizado. |
| `POST /api/v1/transactions` | Crea un movimiento validado. |
| `PATCH /api/v1/transactions/:id` | Actualiza un movimiento después de validar el resultado completo. |

El cuerpo de un movimiento usa `title`, `amount`, `category_id`, `transaction_type` (`expense` o `income`), `scope` (`personal` o `family`) y `family_id` cuando aplica. No se deben registrar ni compartir contraseñas o access tokens.
