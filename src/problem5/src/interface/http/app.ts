import Database from "better-sqlite3";
import express, { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { CreateTicket } from "../../application/use-cases/CreateTicket";
import { DeleteTicket } from "../../application/use-cases/DeleteTicket";
import { GetTicket } from "../../application/use-cases/GetTicket";
import { ListTickets } from "../../application/use-cases/ListTickets";
import { UpdateTicket } from "../../application/use-cases/UpdateTicket";
import { SqliteTicketRepository } from "../../infrastructure/persistence/repositories/SqliteTicketRepository";
import { TicketController } from "./controllers/ticket.controller";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { createTicketRouter } from "./routes/ticket.routes";

const OPENAPI_ROUTE = "/api-docs";

function loadOpenApiDocument() {
  const openapiPath = path.join(__dirname, "docs", "openapi.yaml");
  const raw = fs.readFileSync(openapiPath, "utf-8");
  return YAML.parse(raw);
}

// Architecture §6.1: HTTP layer wiring only — no business logic, no SQL.
export function createApp(db: Database.Database): Express {
  const repository = new SqliteTicketRepository(db);

  const controller = new TicketController(
    new CreateTicket(repository),
    new ListTickets(repository),
    new GetTicket(repository),
    new UpdateTicket(repository),
    new DeleteTicket(repository),
  );

  const app = express();

  // Security Baseline — reasonable request-size limit (Implementation Decision #17).
  app.use(express.json({ limit: "100kb" }));

  app.use("/api/v1/tickets", createTicketRouter(controller));

  const openapiDocument = loadOpenApiDocument();
  app.get("/openapi.json", (_req, res) => res.json(openapiDocument));
  app.use(OPENAPI_ROUTE, swaggerUi.serve, swaggerUi.setup(openapiDocument));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
