import { NextFunction, Request, Response } from "express";
import { getSession } from "../sessions";
import * as ws from "ws";
import { WebSocketMessage } from "common/dist/chatWsMessages";

export function isAuth(req: Request, res: Response, next: NextFunction) {
	if (!req.headers.authorization) {
		res.sendStatus(401);
		return;
	}

	const sid = req.headers.authorization.replace("Bearer ", "");
	const session = getSession(sid);

	if (!sid || !session) {
		res.sendStatus(401);
		return;
	}

	next();
}

export function isAuthWs(ws: ws.WebSocket, req: Request, next: NextFunction) {
	const checkAuthCb = (msg: any) => {
		msg = JSON.parse(msg) as WebSocketMessage;
		if (msg.type === "Authorization") {
			const session = getSession(msg.sid);

			if (!session) {
				ws.close(3000);
				return;
			}
			
			req.headers.authorization = "Bearer " + msg.sid;
			ws.removeListener("message", checkAuthCb);
			ws.send(JSON.stringify({type: "AuthorizationOk"}));
			next();
		} else {
			ws.send(JSON.stringify({type: "BadRequest", content: "Must send an Authorization message first!"}));
		}
	};

	ws.on("message", checkAuthCb);
}
