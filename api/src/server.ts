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
    this.app.use(cors());
    this.app.use(express.json());
  }

  private configureRoutes(): void {
    this.app.use("/api/v1", v1Routes);
  }

  private configureErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}