import { getSessionIdFromStorage, getUserFromStorage, sessionId, setMemorySession, setMemoryUser, user } from "@/states/user";
import { UserProps } from "@/types/userProps";
import { useEffect } from "react";

export function useSessionInfo(cb: (sessionId: string|null, user: UserProps|null) => void) {
	useEffect(() => {(async () => {
		if (user && sessionId) {
			cb(sessionId, user);
			return;
		}

		if (!user) {
			const storedUser = await getUserFromStorage();
			if (storedUser)
				setMemoryUser(storedUser);
		}

		if (!sessionId) {
			const storedSession = await getSessionIdFromStorage();
			if (storedSession)
				setMemorySession(storedSession);
		}

		cb(sessionId, user);
	})()}, []);
}
