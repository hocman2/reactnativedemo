export interface Authorization {
	type: "Authorization",
	sid: string,
}

export interface AuthorizationOk {
	type: "AuthorizationOk",
}

export interface BadRequest {
	type: "BadRequest",
	content: string,
}

export interface FatalError {
	type: "FatalError",
	content: string
};

export interface MessageReceived {
	type: "MessageReceived",
	seq: number,
	time: number,
	content: string,
	authorId: number,
};

export interface SendMessage {
	type: "SendMessage",
	content: string
}

export type WebSocketMessage = Authorization | AuthorizationOk | FatalError | BadRequest | MessageReceived | SendMessage;
