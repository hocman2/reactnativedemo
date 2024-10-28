import { QueryResult } from "node-sqlite3-wasm";
import { fillField, ModelFromOptions, startBuilding, endBuild } from "./modelBuilder";

export type User = {
	id: number,
	username?: string,
};

export function userFrom(qr: QueryResult, opts?: ModelFromOptions<User>): User {
	startBuilding(opts);
	fillField<User>("id", qr);
	fillField<User>("username", qr);
	return endBuild();
}
