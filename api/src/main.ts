import dotenv from "dotenv";
import { Server } from "./server";

dotenv.config();

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un número entre 1 y 65535.');
}

const server = new Server();

server.app.listen(port, host, () => {
  console.log(`API disponible en http://${host}:${port}/api/v1/health`);
});
