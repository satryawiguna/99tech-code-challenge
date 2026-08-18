import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller";

// API Contract §3: exact endpoint set — no additional business routes.
export function createTicketRouter(controller: TicketController): Router {
  const router = Router();

  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}
