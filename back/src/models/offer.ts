import { QueryResult } from "node-sqlite3-wasm";
import { User, userFrom } from "./user"
import { fillField, fillFieldRecursive, ModelFromOptions, startBuilding, endBuild, transformField} from "./modelBuilder";

export type Offer = {
	id: string,
	user?: User,
	title?: string,
	description?: string,
	image?: string,
};

export function offerFrom(qr: QueryResult, opts?: ModelFromOptions<Offer>): Offer {
	startBuilding(opts);
	fillField<Offer>("id", qr);	
	fillFieldRecursive<Offer, User>("user", userFrom, qr, {fieldMapping: {id: "user_id"}});
	fillField<Offer>("title", qr);
	fillField<Offer>("description", qr);
	fillField<Offer>("image", qr);
	transformField<Offer, "image">("image", (img) => {
		if (!img)
			return undefined;

		return process.env.OFFER_IMG_DIR + img;	
	});
	return endBuild();
}
