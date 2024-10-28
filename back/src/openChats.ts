import * as ws from "ws";
import { Message } from "./models/message";
import { MessageReceived } from "common/dist/chatWsMessages";

const openChats: Map<string, (ws.WebSocket & {sessionId: string})[]> = new Map();

export function joinChat(chatId: string, ws: ws.WebSocket & {sessionId: string}) {
	const websockets = openChats.get(chatId);
	if (websockets) {
		websockets.push(ws);
	} else {
		openChats.set(chatId, [ws]);
	}
} 

export function broadcastMessageSent(chatId: string, message: Message) {
	const websockets = openChats.get(chatId);
	if (!websockets)
		return;

	for (let socket of websockets) {
		socket.send(JSON.stringify({
			type: "MessageReceived",
			seq: message.seq,
			time: message.sentAt!,
			content: message.content!,
			authorId: message.authorId!
		} satisfies MessageReceived));
	}
}

export function leaveChat(chatId: string, sessionId: string) {
	const websockets = openChats.get(chatId);
	if (!websockets)
		return;

	openChats.set(chatId, websockets.filter((ws) => ws.sessionId != sessionId));
}
