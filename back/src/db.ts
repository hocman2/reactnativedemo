import { Database } from "node-sqlite3-wasm";
export const db = new Database(process.env.DB_FILE_NAME);
