import "dotenv/config";

export type NodeEnv = "local" | "dev" | "prod";

export interface AppConfig {
  nodeEnv: NodeEnv;
  port: number;
  databaseUrl: string;
}

const VALID_NODE_ENVS: readonly NodeEnv[] = ["local", "dev", "prod"];

function readNodeEnv(): NodeEnv {
  const raw = process.env.NODE_ENV ?? "local";
  if (!VALID_NODE_ENVS.includes(raw as NodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV "${raw}". Expected one of: ${VALID_NODE_ENVS.join(", ")}.`,
    );
  }
  return raw as NodeEnv;
}

function readPort(): number {
  const raw = process.env.PORT ?? "3000";
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT "${raw}". Expected a positive integer.`);
  }
  return port;
}

function readDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw || raw.trim() === "") {
    throw new Error("DATABASE_URL is required but was not provided.");
  }
  return raw;
}

export function loadConfig(): AppConfig {
  return {
    nodeEnv: readNodeEnv(),
    port: readPort(),
    databaseUrl: readDatabaseUrl(),
  };
}
