import express, { Application } from "express";
import cors from "cors";
import v1Routes from "./routes/v1"; // Se omite /index, TypeScript lo resuelve automaticamente
import { errorMiddleware } from "./middlewares/error.middleware";

export class Server {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    this.app.disable('x-powered-by');
    this.app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : false }));
    this.app.use(express.json({ limit: '16kb' }));
  }

  private configureRoutes(): void {
    this.app.use("/api/v1", v1Routes);
  }

  private configureErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}
