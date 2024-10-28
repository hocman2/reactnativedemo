import { db } from "./db.js";
import { qb } from "./queryBuilder.js"

const query = qb.schema
	.createTable("user", (table) => {
		table.increments("id", {primaryKey: true}).unique();
		table.bigInteger("created_at");	
		table.string("username", 32);
		table.string("password");
	})
	.createTable("offer", (table) => {
		table.uuid("id", {primaryKey: true}).unique();
		table.bigInteger("created_at");
		table.integer("user_id")
			.references("user.id")
			.onDelete("cascade");
		table.string("title", 500);
		table.text("description");
		table.string("image", 500)
	})
	.createTable("chat", (table) => {
		table.uuid("id", {primaryKey: true}).unique();
		table.bigInteger("created_at");
		table.uuid("offer_id")
			.references("offer.id")
			.onDelete("cascade");	
		table.integer("offerer_id")
			.references("user.id")
		table.integer("buyer_id")
			.references("user.id");
		table.integer("next_seq").unsigned();
	})
	.createTable("message", (table) => {
		table.integer("seq").unsigned();
		table.string("chat_id")
			.references("chat.id")
			.onDelete("cascade");		
		table.integer("author_id")
			.references("user.id")
			.onDelete("cascade");
		table.text("content");
		table.bigInteger("sent_at");
	})
	.toQuery();

console.log(`Running: ${query}`);
db.exec(query);
