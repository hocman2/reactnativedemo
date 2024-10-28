import { DATA_SERVER_URL } from "@/consts";

export async function pushMessage(sid: string, chatId: string, content: string) {
	await fetch(DATA_SERVER_URL + "postMessage", {
		method: "POST",
		headers: [
			["Authorization", "Bearer " + sid],
			["Content-Type", "application/json"]
		],
		body: JSON.stringify({
			chatId, content
		})
	});
}

export async function createChat(sid: string, offerId: string): Promise<string> {
	const r = await fetch(DATA_SERVER_URL + "createChat", {
		method: "POST",
		headers: [
			["Authorization", "Bearer " + sid],
			["Content-Type", "application/json"]
		],
		body: JSON.stringify({
			offerId
		}),
	});

	if (!r.ok)
		throw new Error(await r.text());

	return (await r.json())["chatId"];
}
