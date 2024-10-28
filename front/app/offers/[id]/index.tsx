import {StyleSheet, Image} from "react-native";
import {Layout, Text, Button} from "@ui-kitten/components"
import { viewedOffer } from "@/states/viewedOffer";
import { useRouter } from "expo-router";
import { CDN_URL } from "@/consts";
import { user } from "@/states/user";

const style = StyleSheet.create({
	container: {
		marginHorizontal: "auto"
	},
	offerTitle: {
		fontWeight: 700,	
		fontSize: 20
	},
	offerDescription: {

	},
	offerAuthor: {
		fontStyle: "italic",
	},
	image: {
		marginVertical: 20,
		width: 300,
		height: 300,
		resizeMode: "cover",
	},
	contactButton: {
		borderRadius: 300,
		marginVertical: 300,
	}
});

export default function OfferView() {
	const router = useRouter();
	const authorUsername = (() => {
		const usernameMaybe = viewedOffer?.user.username;

		if (!usernameMaybe)
			throw new Error("The path to author username returned undefined");

		return usernameMaybe;
	})();

	function openChat() {
		router.push(`/chats/view?offerId=${viewedOffer!.id}`);
	}
	
	return (
		<Layout style={style.container}>
			<Text style={style.offerTitle}>{viewedOffer?.title}</Text>
			<Text style={style.offerAuthor}>Postée par {authorUsername}</Text>
			<Image
				style={style.image}
				source={{
					uri:CDN_URL + viewedOffer?.image
				}}
			/>
			<Text style={style.offerDescription}>{viewedOffer?.description}</Text>
			{
				(user?.id === viewedOffer?.user.id) ? 
					null : 
					<Button style={style.contactButton} onPress={() => openChat()}>
						<Text>Contacter le vendeur</Text>
					</Button>
			}
		</Layout>
	)
}

