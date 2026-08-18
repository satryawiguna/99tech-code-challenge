import { createConnection } from "../../infrastructure/persistence/database/connection";
import { initializeSchema } from "../../infrastructure/persistence/database/schema";
import { loadConfig } from "../../shared/config/env";
import { createApp } from "./app";

function main(): void {
  const config = loadConfig();

  const db = createConnection(config.databaseUrl);
  initializeSchema(db);

  const app = createApp(db);

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Ticket API listening on port ${config.port} [${config.nodeEnv}] (db: ${config.databaseUrl})`,
    );
  });
}

try {
  main();
} catch (err) {
  // Architecture §21 — startup failures must be identifiable; never leak
  // this detail to a client since no HTTP response has been sent yet.
  console.error(
    "Failed to start Ticket API:",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
}
