import { getRandomValues } from "crypto";
import { Request } from "express";

export const SESSION_DURATION = 7 * 24 * 3600;

type SessionId = string;
type Session = {
	meta: {
		expiry: number,
	};
	data: any,
};

const sessions: Map<SessionId, Session> = new Map();

export function createSession(): SessionId {
	
	let sid = "";

	do {
		const bytes = new Uint8Array(32);
		getRandomValues(bytes);
		sid = btoa(Array.from(bytes, (byte) => String.fromCodePoint(byte)).join(""));
	} while(sessions.has(sid));

	const expiry = Date.now() + SESSION_DURATION;

	sessions.set(sid, {meta: {expiry}, data: {}});
	return sid;
}

export function invalidateSession(id: SessionId) {
	sessions.delete(id);
} 

export function sessionExists(id: SessionId): boolean {
	return sessions.has(id);
}

export function getSessionId(req: Request): string|undefined {
	return req.headers.authorization?.replace("Bearer ", "");
}

export function getUserSession(req: Request): any|undefined {
	if (!req.headers.authorization)
		return undefined;

	return getSession(req.headers.authorization.replace("Bearer ", ""));
}

export function getSession(id: SessionId): any|undefined {
	const sessionMaybe = sessions.get(id);
	if (!sessionMaybe)
		return undefined;

	if (sessionMaybe.meta.expiry < Date.now()) {
		invalidateSession(id);
		return undefined;
	}

	return sessionMaybe.data;
}
