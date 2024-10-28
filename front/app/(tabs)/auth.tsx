import { DATA_SERVER_URL } from "@/consts";
import { setSessionId, setUser } from "@/states/user";
import { Input, Layout, Button, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as evaProps from "@eva-design/eva"
import { Pressable, StyleSheet } from "react-native";
import { customTheme } from "@/custom-theme";

const style = StyleSheet.create({
	form: {
		paddingVertical: 300,
		paddingHorizontal: 300,
	}, 
	field: {
		margin: "auto",
		width: 300,
		marginBottom: 25,
	},
	registerButton: {
		marginTop: 16,
		textAlign: "center",
		textDecorationLine: "underline",
		color: customTheme["color-info-500"],
	},
	submitButton: {
		margin: "auto",
		marginTop: 80,
		width: 200,
		height: 50,
		borderRadius: 500,
	} 
});

export default function Auth() {

	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [sentDisabled, setSentDisabled] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null as string|null);
	const [successMsg, setSuccessMsg] = useState(null as string|null);

	async function formSent() {
		setSentDisabled(true);
	
		try {
			const response = await fetch(DATA_SERVER_URL + "authenticate", {
				method: "POST",
				mode: "cors", 
				credentials: "include",
				body: JSON.stringify({
					username,
					password,
				}), 
				headers: [
					["Content-Type", "application/json"]
				]
			});

			if (!response.ok) {
				setSuccessMsg(null);
				setErrorMsg(await response.text());
			}

			const {session, user} = await response.json();
			
			await setSessionId(session);
			await setUser(user);
			
			if (router.canGoBack()) {
				router.back();
			} else {
				router.navigate("/");
			}
		} catch(e) {
			setSentDisabled(false);
			console.error(e);
		}
	}

	async function register() {
		setSentDisabled(true);
	
		try {
			const response = await fetch(DATA_SERVER_URL + "register", {
				method: "POST",
				mode: "cors", 
				credentials: "include",
				body: JSON.stringify({
					username,
					password,
				}), 
				headers: [
					["Content-Type", "application/json"]
				]
			});

			if (!response.ok) {
				setSuccessMsg(null);
				setErrorMsg(await response.text());
			} else {
				setErrorMsg(null);
				setSuccessMsg("Inscription réussie. Vous pouvez désormais vous connecter");
			}
		} catch(e) {
			console.error(e);
		} finally {
			setSentDisabled(false);
		}
	}

	return (
		<Layout style={style.form}>
			<Input
				style={style.field}
				placeholder="username"
				value={username}
				onChangeText={setUsername}
			/>
			<Input
				style={style.field}
				placeholder="password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry={true}
			/>
			<Button style={style.submitButton} disabled={sentDisabled} onPress={() => formSent()}>
				<Text {...evaProps}>Se connecter</Text>
			</Button>
			<Pressable onPress={() => register()}>
				<Text style={style.registerButton}>S'inscrire</Text>
			</Pressable>
			{(errorMsg) ? <Text status="danger" {...evaProps}>{errorMsg}</Text>:null}
			{(successMsg) ? <Text status="success" {...evaProps}>{successMsg}</Text>:null}
		</Layout>
	);
}
