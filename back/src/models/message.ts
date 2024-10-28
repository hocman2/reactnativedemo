import { QueryResult } from "node-sqlite3-wasm";
import { fillField, ModelFromOptions, startBuilding, endBuild } from "./modelBuilder";

export type Message = {
	seq: number,
	sentAt?: number,
	authorId?: number,
	content?: string,
};

export function messageFrom(qr: QueryResult, opts?: ModelFromOptions<Message>): Message {
	startBuilding(opts);
	fillField<Message>("seq", qr);
	fillField<Message>("sentAt", qr, "sent_at");
	fillField<Message>("authorId", qr, "author_id");
	fillField<Message>("content", qr, "content");
	return endBuild();
}
