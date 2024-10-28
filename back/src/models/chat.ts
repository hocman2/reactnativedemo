import { User, userFrom } from "./user";
import { Offer, offerFrom } from "./offer";
import { QueryResult } from "node-sqlite3-wasm";
import { fillField, fillFieldRecursive, ModelFromOptions, startBuilding, endBuild} from "./modelBuilder";

export type Chat = {
	id: string,
	offer?: Offer,
	buyer?: User,
	offerer?: User,
	nextSeq?: number,
};

export function chatFrom(qr: QueryResult, opts?: ModelFromOptions<Chat>): Chat {
	startBuilding(opts);
	fillField<Chat>("id", qr);
	fillFieldRecursive<Chat, Offer>("offer", offerFrom, qr, {fieldMapping: {id: "offer_id"}, ignoredFields: ["user"]});
	fillFieldRecursive<Chat, User>("buyer", userFrom, qr, {fieldMapping: {id: "buyer_id", username: "buyer_username"}});	
	fillFieldRecursive<Chat, User>("offerer", userFrom, qr, {fieldMapping: {id: "offerer_id", username: "offerer_username"}});
	fillField<Chat>("nextSeq", qr, "next_seq");
	return endBuild();
}
