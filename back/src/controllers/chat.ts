import { Response, Request } from "express"
import { getSessionId, getUserSession } from "../sessions"
import { qb } from "../queryBuilder"
import { db } from "../db"
import { v4 as uuidv4 } from "uuid"
import { Message, messageFrom } from "../models/message"
import { chatFrom } from "../models/chat"
import { userFrom } from "../models/user"
import * as ws from "ws"
import {WebSocketMessage} from "common/dist/chatWsMessages"
import { broadcastMessageSent, joinChat, leaveChat } from "../openChats"

export function createChat(req: Request, res: Response) {
	const { userId } = getUserSession(req);
	const { offerId } = req.body;

	if (!offerId) {
		res.status(400).send("Missing offerId field");
		return;
	}

	// Does the user own the offer ? That's an error
	const offerQuery = qb("offer").select("user_id").where("id","=",offerId).toQuery();	
	try {
		const result = db.get(offerQuery)
		if (!result) {
			res.status(400).send("No offer found for the provided id");
			return;
		}

		const offererId = result["user_id"]?.valueOf() as number;
		if (offererId === userId) {
			res.status(400).send("Can't create a chat with self!");
			return;
		}

		const id = uuidv4();
		const createChatQuery = qb("chat")
		.insert({
			id,
			created_at: Date.now(),
			offer_id: offerId,
			offerer_id: offererId,
			buyer_id: userId,
			next_seq: 1,
		})
		.toQuery();

		db.exec(createChatQuery);
		res.json({
			chatId: id
		});

	} catch(e) {
		console.error(e);
		res.sendStatus(500);
		return;
	}
}

function postMessageGeneric(userId: number, chatId: string, content: string): [any|undefined, string] {
	const chatQuery = qb("chat").select("*").where("id","=",chatId).toQuery();
	const result = db.get(chatQuery);
	if (!result) {
		return [undefined, "No chat found with the provided id"];
	}

	let nextSeq = result["next_seq"]?.valueOf() as number;
	const message = {
		seq: nextSeq,
		chat_id: chatId,
		author_id: userId,
		content,
		sent_at: Date.now()
	};

	const msgQuery = qb("message").insert(message).toQuery();
	db.exec(msgQuery);

	const updateSeqQuery = qb("chat").where("id","=",chatId).update({
		next_seq: nextSeq+1
	}).toQuery();
	db.exec(updateSeqQuery);
	
	return [message, ""];
}

export function postMessage(req: Request, res: Response) {
	const {userId} = getUserSession(req);
	const {chatId, content} = req.body;

	if (!chatId) {
		res.status(400).send("Missing chatId field");
		return;
	}

	try {
		const [success, errorMsg] = postMessageGeneric(userId, chatId, content);

		if (!success) {
			res.status(400).send(errorMsg);
			return;
		}
	}	catch(e) {
		res.sendStatus(500);
		console.error(e);
		return;
	}
	
	res.sendStatus(200);
}

export function getUserChats(req: Request, res: Response) {
	const {userId} = getUserSession(req);

	const query = qb("chat")
		.select("chat.*", "message.seq", "message.sent_at", "message.content", "message.author_id", "user.username")
		.max("message.seq")
		.join("message", "chat.id", "=", "message.chat_id")
		.join("user", "message.author_id", "=", "user.id")
		.where("chat.buyer_id","=",userId)
		.orWhere("chat.offerer_id","=",userId)
		.groupBy("chat.id")
		.toQuery();

	const result = db.all(query);
	res.json(result.map((r) => { return {
		id: r["id"]?.valueOf() as string, 
		lastMessage: messageFrom(r, {ignoredFields: ["authorId"]}),
		messageAuthor: userFrom(r, {fieldMapping: {id: "author_id"}}),
	};}));
}

export function getChat(req: Request, res: Response) {
	if (!req.query["chatId"]) {
		res.status(400).send("Missing query parameter chatId");
	}

	const {userId} = getUserSession(req);
	const chatId = req.query["chatId"] as string;

	const participatesQuery = qb("chat")
		.select("chat.*", "buyer.username as buyer_username", "offerer.username as offerer_username")
		.join("user as buyer", "chat.buyer_id", "=", "buyer.id")
		.join("user as offerer", "chat.offerer_id", "=", "offerer.id")
		.where("chat.id","=",chatId).toQuery();

	try {
		const chatResponse = db.get(participatesQuery);
		
		if (!chatResponse) {
			res.status(400).send("No chat found with this id");
			return;
		}
		const chat = chatFrom(chatResponse);
		if (!chat.buyer || !chat.offerer) {
			console.error("Failed to find a buyer or an offerer when fetching a chat");
			res.sendStatus(500);
			return;
		}
		if (chat.offerer.id !== userId && chat.buyer.id !== userId) {
			res.status(403).send("User is not authorized to see this chat");
			return;
		}

		const messagesQuery = qb("message")
			.select("*", "user.id as user_id")
			.join("user", "message.author_id","=","user.id")
			.where("chat_id","=",chatId)
			.toQuery();

		const messages = db.all(messagesQuery);

		res.json({
			chat,
			messages: messages.map(r => messageFrom(r))
		});
	} catch(e) {
		console.error(e);
		res.sendStatus(500);
		return;
	}
}

export function wsHandler(ws: ws.WebSocket, req: Request) {
	if (!req.query["chatId"]) {
		ws.send(JSON.stringify({type: "FatalError", content: "Must provide a chatId query parameter !"} satisfies WebSocketMessage));
		ws.close(1002);
		return;
	}

	const {userId} = getUserSession(req);
	const chatId = req.query["chatId"] as string;	
	const sessionId = getSessionId(req)!;
	joinChat(chatId, Object.assign(ws, {sessionId}));

	ws.on("message", (msg: any) => {
		msg = JSON.parse(msg) as WebSocketMessage;
		switch (msg.type) {
			case "SendMessage":
				try {
					const [insertedMsg, errorMsg] = postMessageGeneric(userId, chatId, msg.content);	
					if (!insertedMsg) {
						ws.send(JSON.stringify({type: "BadRequest", content: errorMsg} satisfies WebSocketMessage));
					} else {
						broadcastMessageSent(chatId, {
							sentAt: insertedMsg["sent_at"],
							authorId: insertedMsg["author_id"],
							content: insertedMsg.content,
							seq: insertedMsg.seq,
						});
					}
				} catch(e) {
					console.log(e);
					ws.close(1011);
				}
				break;
			default:
				ws.send(JSON.stringify({type: "BadRequest", content: `${msg.type} is not a supported message type`}));
		}
	});
	
	ws.on("close", () => {
		leaveChat(chatId,sessionId);
	});
}
