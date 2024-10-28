import { DATA_SERVER_URL } from "@/consts";
import { useSessionInfo } from "@/hooks/useSessionInfo";
import { ChatPreviewProps } from "@/types/chatProps";
import { Text, Layout, Divider } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

const style = StyleSheet.create({
	chatItem: {
		flex: 1,
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		alignContent: "space-between",
		marginVertical: 4,
		paddingHorizontal: 8,
	},
	chatItemSender: {
		fontWeight: 800,
		flex:1,
	},
	chatItemLastMessage: {
		textAlign: "left",
		fontStyle: "italic",
		flex: 1,
	},
	chatItemDate: {
		textAlign: "right",
		flex: 1,
	}
});

export default function ChatsView() {
	const router = useRouter();
	const [chats, setChats] = useState([] as ChatPreviewProps[]);

	function fetchChats(sid: string|null) {
		if (!sid) {
			console.error("No session ID. TODO: Redirect to login page");
			throw new Error();
		}

		fetch(DATA_SERVER_URL + "getChats", {
			method: "GET",
			headers: [
				["Authorization", "Bearer " + sid]
			]
		}).then(async (r) => {
			const chats = await r.json();
			setChats(chats);
		})
	}

	useSessionInfo((sid) => {
		fetchChats(sid);		
	});

	async function openChat(id: string) {
		router.push(`/chats/view?chatId=${id}`);
	}

	const Item = ({chat}: {chat:ChatPreviewProps}) => {
		const date = new Date(chat.lastMessage.sentAt);
		return (
		<Layout>
			<Pressable style={style.chatItem} onPress={() => openChat(chat.id)}>
				<Layout>
					<Text style={style.chatItemSender}>De: {chat.messageAuthor.username}</Text>
					<Text style={style.chatItemLastMessage}>{chat.lastMessage.content}</Text>
				</Layout>
				<Text style={style.chatItemDate}>{date.getDate()}/{date.getMonth()+1}/{date.getFullYear()}</Text>
			</Pressable>
		</Layout>
		)
	}

	return (
		<Layout>
			<FlatList
				data={chats}
				renderItem={(item) => <Item chat={item.item}/>}
				ItemSeparatorComponent={Divider}
			/>
		</Layout>
	)
}
