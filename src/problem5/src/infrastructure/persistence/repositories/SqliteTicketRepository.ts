import Database from "better-sqlite3";
import { TicketFilter } from "../../../application/ports/TicketFilter";
import { TicketRepository } from "../../../application/ports/TicketRepository";
import { Ticket } from "../../../domain/ticket/Ticket";
import { TicketPriority } from "../../../domain/ticket/TicketPriority";
import { TicketStatus } from "../../../domain/ticket/TicketStatus";

interface TicketRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

function mapRowToTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TicketStatus,
    priority: row.priority as TicketPriority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Database §12 — implements TicketRepository against SQLite using
 * parameterized statements only. Maps snake_case columns to the
 * camelCase domain/application Ticket representation.
 */
export class SqliteTicketRepository implements TicketRepository {
  constructor(private readonly db: Database.Database) {}

  async create(ticket: Ticket): Promise<Ticket> {
    this.db
      .prepare(
        `INSERT INTO tickets (id, title, description, status, priority, created_at, updated_at)
         VALUES (@id, @title, @description, @status, @priority, @createdAt, @updatedAt)`,
      )
      .run({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      });
    return ticket;
  }

  async findById(id: string): Promise<Ticket | null> {
    const row = this.db
      .prepare("SELECT * FROM tickets WHERE id = @id")
      .get({ id }) as TicketRow | undefined;
    return row ? mapRowToTicket(row) : null;
  }

  async findMany(filter: TicketFilter): Promise<Ticket[]> {
    const conditions: string[] = [];
    const params: Record<string, string> = {};

    if (filter.status) {
      conditions.push("status = @status");
      params.status = filter.status;
    }
    if (filter.priority) {
      conditions.push("priority = @priority");
      params.priority = filter.priority;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = this.db
      .prepare(`SELECT * FROM tickets ${whereClause} ORDER BY created_at ASC`)
      .all(params) as TicketRow[];

    return rows.map(mapRowToTicket);
  }

  async update(ticket: Ticket): Promise<Ticket> {
    this.db
      .prepare(
        `UPDATE tickets
         SET title = @title, description = @description, status = @status,
             priority = @priority, updated_at = @updatedAt
         WHERE id = @id`,
      )
      .run({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        updatedAt: ticket.updatedAt,
      });
    return ticket;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db
      .prepare("DELETE FROM tickets WHERE id = @id")
      .run({ id });
    return result.changes > 0;
  }
}
