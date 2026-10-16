import dotenv from "dotenv";
import { Server } from "./server";

dotenv.config();

const server = new Server();
const PORT = process.env.PORT || 3000;

server.app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/api/v1/health`);
  console.log(`Documentación de Swagger en http://localhost:${PORT}/api-docs`);
});