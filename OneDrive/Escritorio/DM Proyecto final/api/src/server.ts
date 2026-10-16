import express, { Application } from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import v1Routes from "./routes/v1";
import { errorMiddleware } from "./middlewares/error.middleware";

// Configuración de Swagger JSDoc
const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Documentación API Proyecto Final",
      version: "1.0.0",
      description: "API modular con TypeScript y Express",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo local",
      },
    ],
  },
  // Busca las anotaciones JSDoc dentro de las rutas
  apis: [
    path.join(process.cwd(), "src/routes/v1/*.ts"),
    path.join(process.cwd(), "src/routes/v1/*.js"),
    path.join(process.cwd(), "src/routes/v1/index.ts")
  ],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

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
    // Interfaz de Swagger UI
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Rutas v1 de la API
    this.app.use("/api/v1", v1Routes);
  }

  private configureErrorHandling(): void {
    // El middleware de captura de errores va siempre al final
    this.app.use(errorMiddleware);
  }
}