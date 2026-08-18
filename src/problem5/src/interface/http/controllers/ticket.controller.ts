import { NextFunction, Request, Response } from "express";
import { CreateTicket } from "../../../application/use-cases/CreateTicket";
import { DeleteTicket } from "../../../application/use-cases/DeleteTicket";
import { GetTicket } from "../../../application/use-cases/GetTicket";
import { ListTickets } from "../../../application/use-cases/ListTickets";
import { UpdateTicket } from "../../../application/use-cases/UpdateTicket";
import { sendTicket, sendTicketCollection } from "../responses";
import {
  createTicketBodySchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketBodySchema,
} from "../schemas/ticket.schemas";

/**
 * Architecture §6.1: controllers stay thin — parse, invoke a use case, map
 * the result to an HTTP response. No SQL and no business rules live here.
 */
export class TicketController {
  constructor(
    private readonly createTicket: CreateTicket,
    private readonly listTickets: ListTickets,
    private readonly getTicket: GetTicket,
    private readonly updateTicket: UpdateTicket,
    private readonly deleteTicket: DeleteTicket,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = createTicketBodySchema.parse(req.body ?? {});
      const ticket = await this.createTicket.execute(body);
      sendTicket(res, 201, ticket);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = listTicketsQuerySchema.parse(req.query ?? {});
      const tickets = await this.listTickets.execute(query);
      sendTicketCollection(res, tickets);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = ticketIdParamSchema.parse(req.params);
      const ticket = await this.getTicket.execute(id);
      sendTicket(res, 200, ticket);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = ticketIdParamSchema.parse(req.params);
      const body = updateTicketBodySchema.parse(req.body ?? {});
      const ticket = await this.updateTicket.execute(id, body);
      sendTicket(res, 200, ticket);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = ticketIdParamSchema.parse(req.params);
      await this.deleteTicket.execute(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
