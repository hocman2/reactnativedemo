import { UserProps } from "@/types/userProps";
import AsyncStorage from "@react-native-async-storage/async-storage"

export let user: UserProps|null = null;
export let sessionId: string|null = null;

export async function getUserFromStorage(): Promise<UserProps | null> {
	if (user)
		return user;

	const storedUser = await AsyncStorage.getItem("user");

	if (storedUser)
		user = JSON.parse(storedUser);
	
	return user;
}

export async function getSessionIdFromStorage(): Promise<string|null> {
	if (sessionId)
		return sessionId;

	sessionId = await AsyncStorage.getItem("session");

	return sessionId;
}

export async function setUser(usr: UserProps) {
	await AsyncStorage.setItem("user", JSON.stringify(usr));
}

export function setMemoryUser(usr: UserProps) {
	user = usr;
}

export function setMemorySession(sid: string) {
	sessionId = sid;
} 

export async function setSessionId(session: string) {
	await AsyncStorage.setItem("session", session);
}

export async function clearSession() {
	user = null;
	sessionId = null;

	await Promise.all([
		AsyncStorage.removeItem("session"),
		AsyncStorage.removeItem("user")
	]);
}
