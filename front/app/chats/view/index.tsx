import { DATA_SERVER_URL } from "@/consts"
import { useSessionInfo } from "@/hooks/useSessionInfo"
import { createChat } from "@/states/chats"
import { sessionId, user } from "@/states/user"
import { ChatProps, MessageProps } from "@/types/chatProps"
import { UserProps } from "@/types/userProps"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { FlatList, StyleSheet } from "react-native"
import {Layout, Text, Input, Button} from "@ui-kitten/components" 
import {Authorization, MessageReceived, SendMessage, WebSocketMessage} from "common/dist/chatWsMessages"
import { customTheme } from "@/custom-theme"
import { isInitialMsgNull, setInitialMsg, useInitialMsg } from "@/states/initialMsg"

const style = StyleSheet.create({
	layout: {
		flex: 1,
		marginHorizontal: "auto",
		justifyContent: "space-between",
	},
	list: {
		flex: 1,
	},
	messageAuthor: {
		fontWeight: 600
	},
	messageBody: {

	},
	sendContainer: {
		flexDirection: "row",
	},
	message: {
		marginVertical: 4,
		padding: 4,
		borderRadius: 8,
		backgroundColor: customTheme["color-primary-500"],
	},
	messageSelf: {
		marginVertical: 4,
		padding: 4,
		borderRadius: 8,
		borderColor: "black",
		borderWidth: 1,
	},
	sendButton: {

	}
});

export default function SingleChatView() {
	const searchParams = useLocalSearchParams();
	let offerId = searchParams.offerId as string;
	let chatId = searchParams.chatId as string;

	const [messageInput, setMessageInput] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [chat, setChat] = useState(null as ChatProps|null);
	const [interlocutor, setInterlocutor] = useState(null as UserProps|null);
	const [ws, setWs] = useState(null as WebSocket|null);

	useSessionInfo(async (sid) => {
		if (!sessionId) {
			throw new Error("No session ID. TODO: Redirect to login page");
		}

		if (chatId) {
			const r = await fetch(DATA_SERVER_URL + "getChat?chatId=" + chatId, {
				method: "GET",
				headers: [
					["Authorization", "Bearer " + sid],
				]
			});

			if (r.ok) {
				const rjson = await r.json();
				setChat({
					id: rjson.chat.id,
					offer: rjson.chat.offer,
					offerer: rjson.chat.offerer,
					buyer: rjson.chat.buyer,
					messages: rjson.messages,
				});
			} else {
				throw new Error(await r.text());
			}

			const ws = new WebSocket(DATA_SERVER_URL + `startChat?chatId=${chatId}`);
			setWs(ws);
			
			ws.addEventListener("open",() => {
				console.log("Auth ok!");
				ws!.send(JSON.stringify({type: "Authorization", sid: sessionId! } satisfies Authorization))
			});
		}

		setIsLoading(false);
	});

	useEffect(() => {
		if (!ws)
			return;

		ws.addEventListener("message", (evt: MessageEvent<any>) => {
			const data: WebSocketMessage = JSON.parse(evt.data);

			if (data.type === "AuthorizationOk") {
				if (!isInitialMsgNull()) {
					ws?.send(useInitialMsg());
				}
			}
			else if (data.type === "MessageReceived") {
				receiveMessage(data);
			} else if (data.type === "FatalError" || data.type === "BadRequest") {
				console.error(data.content);
			}
		});
	}, [ws]);

	useEffect(() => {
		if (chat) {
			setInterlocutor(findInterlocutor(chat, user!));
		}

	}, [chat]);

	function receiveMessage(payload: MessageReceived) {
		chat?.messages.push({
			seq: payload.seq,
			content: payload.content,
			sentAt: payload.time,
			authorId: payload.authorId
		});
	}

	function findInterlocutor(chat: ChatProps, user: UserProps): UserProps {
		return (chat.buyer.id === user.id) ? chat.offerer : chat.buyer;	
	}

	async function sendMessage() {
		const msg = JSON.stringify({
			type: "SendMessage",
			content: messageInput
		} as SendMessage);

		if (!chatId) {
			if (!offerId) {
				throw new Error("Neither viewedChatId or offerId (as url param) were set");
			}

			const createdId = await createChat(sessionId!, offerId);
			chatId = createdId;
			setInitialMsg(msg);
			router.replace(`/chats/view?chatId=${chatId}`);
		} else {
			ws?.send(msg);
		}

		setMessageInput("");
	}
	
	const Item = ({message}: {message: MessageProps}) => (
		<Layout style={(message.authorId === user?.id) ? style.messageSelf : style.message}>
			<Text style={style.messageAuthor}>{message.authorId === user?.id ? "Vous" : interlocutor?.username}</Text>
			<Text style={style.messageBody}>{message.content}</Text>
		</Layout>
	)

	if (isLoading)
		return (
		<Text>Loading...</Text>
	);

	return (
		<Layout style={style.layout}>
			<FlatList
				style={style.list}
				data={chat?.messages}
				renderItem={(item) => <Item message={item.item}/>}
			/>		
			<Layout style={style.sendContainer}>
				<Input
					style={{
						borderWidth: 1,
						borderColor: "rgba(1, 1, 1, 0.5)",
					}}
					value={messageInput}
					onChange={(e) => setMessageInput(e.nativeEvent.text)}
				/>
				<Button style={style.sendButton} onPress={() => sendMessage()}><Text>Envoyer</Text></Button>
			</Layout>
		</Layout>
	)
}
