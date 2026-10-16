import dotenv from "dotenv";
import { Server } from "./server";

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = new Server();

server.app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/api/v1/health`);
});