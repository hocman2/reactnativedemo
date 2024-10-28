import {Layout, Input, Text, Button} from "@ui-kitten/components"
import { Image } from "react-native";
import filePicker from "../../../file-picker"
import { DATA_SERVER_URL } from "@/consts";
import { useState } from "react";
import { sessionId } from "@/states/user";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import * as evaProps from "@eva-design/eva"

const style = StyleSheet.create({
	form: {
		paddingHorizontal: 300,
		paddingVertical: 24,
		flex: 1,
		alignContent: "space-between"
	}, 
	titleText: {
		fontSize: 24,
		fontWeight: 600,
		textAlign: "center",
	},
	field: {
		margin: "auto",
		width: 300,
		marginBottom: 25,
	},
	imagePicker: {
		width: 150,
		height: 150,
		margin: "auto",
		borderRadius: 16,

	},
	shownImage: {
		width: 130,
		height: 130,
		resizeMode: "cover",
	},
	submitButton: {
		margin: "auto",
		marginTop: 80,
		width: 200,
		height: 50,
		borderRadius: 500,
	} 
});

export default function CreateOfferView() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState(undefined as string|undefined);

	function submitForm() {
		const form = new FormData();
		form.append("title", title);
		form.append("description", description);

		if (image) {
			form.append("image", image);
		}
	
		if (!sessionId) {
			console.error("No session");
			return;
		}

		fetch(DATA_SERVER_URL + "postOffer", {
			method: "POST",
			body: form,
			headers: [ 
				["Authorization", "Bearer "+sessionId] 
			]
		}).then((r) => {
				if (r.ok) {
					if (router.canGoBack()) {
						router.back();
					} else {
						router.replace("/");
					}
				}
		});
	}

	function openPicker() {
		filePicker.pickImage().then((r: any) => { setImage(r.uri) });
	}

	return (
		<Layout style={style.form}>
			<Text style={style.titleText}>Poster une offre</Text>
			<Layout style={{
				marginVertical: "auto",
			}}>
				<Input
					style={style.field}
					placeholder="Titre"
					onChangeText={setTitle}
					value={title}
				/>
				<Input
					style={style.field}
					placeholder="Description"
					onChangeText={setDescription}
					value={description}
				/>
				<Button style={style.imagePicker} onPress={() => openPicker()}>
					{(image) ? (
						<Layout>
							<Image style={style.shownImage} source={{uri: image}}/>
						</Layout>
					) : (
						<Text>Image</Text>
					)}
				</Button>
			</Layout>
			<Button style={style.submitButton} onPress={() => submitForm()}>
				<Text {...evaProps}>Envoyer</Text>
			</Button>
		</Layout>
	)
}
