import { DATA_SERVER_URL } from "@/consts";
import { clearSession, getSessionIdFromStorage, sessionId } from "@/states/user";
import { useEffect, useState } from "react";

// Check the session against the server
export function useAuth(onAuthChecked: (authenticated: boolean) => void): boolean {
	const [authChecked, setAuthChecked] = useState(false);

	useEffect(() => {
		(async () => {
			const sid = sessionId ?? await getSessionIdFromStorage();

			if (!sid) {
				setAuthChecked(false);
				onAuthChecked(false);	
				return;
			}

			const r = await fetch(DATA_SERVER_URL + "validateSession", {
				method: "GET",
				headers: [["Authorization", "Bearer "+sid]]
			});

			if (r.ok) {
				setAuthChecked(true);
				onAuthChecked(true);
			} else {
				await clearSession();
				setAuthChecked(false);
				onAuthChecked(false);
			}
		})(); 	
	}, []);

	return authChecked;
}
