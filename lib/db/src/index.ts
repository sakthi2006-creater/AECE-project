import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import * as schema from "./schema/index.js";

const dbPath = path.resolve(import.meta.dirname, "..", "sqlite.db");
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export * from "./schema/index.js";
