# SincroFin — guía para presentar el proyecto final

## Qué hace la aplicación

SincroFin permite crear una cuenta, iniciar sesión, registrar ingresos y gastos, clasificarlos por categoría, consultar grupos familiares y ver un resumen financiero actualizado. Los datos se guardan en Supabase y se cargan mediante su API autenticada.

## Correspondencia con el último 40 %

| Requisito | Cómo se evidencia en el proyecto |
| --- | --- |
| Integrar consumo de APIs y manejo de datos (10 %) | Autenticación con Supabase Auth; lectura y escritura de movimientos y categorías; grupos familiares; resumen agregado desde una función SQL segura; estados de carga, error, actualización y lista vacía. |
| Buenas prácticas, seguridad básica y rendimiento (10 %) | Sesión cifrada en Android/iOS; validación de formularios y API; RLS para datos personales y familiares; secretos de servidor fuera del código; sin registros de contraseñas; lista paginada y carga paralela del resumen y movimientos. |
| Integrar y presentar la aplicación final (20 %) | Flujo completo conectado: registro, inicio, grupos, movimientos, saldo, ingresos/gastos, actualización y navegación. La guía de configuración está en `SUPABASE_SETUP.md`. |

## Preparación antes de la presentación

1. Completa `.env` y configura Supabase siguiendo `SUPABASE_SETUP.md`.
2. Ejecuta el esquema SQL o las migraciones pendientes; en particular debe existir `get_transaction_summary()`.
3. Para presentar con Expo Go, abre en VS Code la carpeta del repositorio y ejecuta `npm run start:lan` cuando el computador y el teléfono compartan Wi-Fi. Desde redes distintas ejecuta `npm run start:tunnel`; el computador debe seguir encendido y conectado a Internet.
4. Para presentar sin depender del computador, instala la compilación APK/IPA que se genera con EAS. La app instalada se conecta por Internet a Supabase. En iPhone, Expo Go y la terminal deben usar la misma cuenta Expo. Si Supabase pide confirmar el correo, hazlo antes de presentar.
5. Registra al menos un ingreso y un gasto con categorías distintas.
6. Crea un grupo familiar y guarda un movimiento familiar.
7. Cierra y vuelve a abrir la app o desliza la lista hacia abajo para mostrar que los datos vuelven a consultarse desde el servicio.
8. En un gasto, prueba el lector de facturas con un QR JSON que contenga `{"title":"Compra del mercado","amount":24500}`; revisa los datos y confirma el guardado.

La API Express es un servicio opcional; el flujo móvil principal consulta Supabase directamente con su SDK. `.env` no se publica en GitHub; configura las variables de EAS para compilar versiones instalables.

## Recorrido sugerido de demostración

1. Registra/inicia sesión y muestra la navegación protegida.
2. En el inicio, explica que el saldo total, ingresos, gastos y número de movimientos se calculan en el servidor; la lista carga por páginas.
3. Crea un gasto y un ingreso; vuelve al inicio y actualiza para ver los cambios.
4. Intenta guardar un monto cero o una descripción vacía para mostrar las validaciones.
5. Crea un grupo y registra un movimiento familiar.
6. Explica que RLS aplica la autorización en la base de datos: cada usuario ve lo personal y los miembros autorizados ven lo familiar.

## Guion breve

> “SincroFin es una aplicación móvil de finanzas personales y familiares. La app autentica usuarios con Supabase, consulta categorías y grupos, y guarda ingresos y gastos mediante solicitudes autenticadas. El saldo se calcula en el servidor respetando las políticas RLS, mientras que el historial se trae en páginas para limitar el trabajo de red y la cantidad de elementos en pantalla. La sesión móvil usa almacenamiento seguro del dispositivo, los formularios validan los datos y el servidor REST no registra contraseñas ni incluye claves en el código.”

## Comandos

```text
# App móvil, desde la carpeta principal
npm install
npm run start:lan

# API opcional, desde api/
npm install
npm run dev
```
