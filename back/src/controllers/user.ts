import { Request, Response } from "express";
import { qb } from "../queryBuilder";
import { bcrypt, bcryptVerify } from "hash-wasm";
import { db } from "../db";
import { getRandomValues } from "crypto";
import { userFrom } from "../models/user";
import { createSession, getSession, invalidateSession} from "../sessions";

export async function register(req: Request, res: Response) {
	const {username, password} = req.body as {username: string, password: string};

	const userExistsQuery = qb("user").select("username").where("username","=",username).toQuery();
	
	if (db.get(userExistsQuery)) {
		res.status(400).send("User with this username already exists");
		return;
	} 

	const salt = new Uint8Array(16);
	getRandomValues(salt);
	const passHash = await bcrypt({password, salt, costFactor: 10, outputType: "encoded"});
	
	const query = qb("user")
								.insert({
									username,
									password: passHash,
									created_at: Date.now() 
								})
								.toQuery();
	try {
		db.exec(query);
	} catch(e) {
		console.log(e);
		res.sendStatus(500);
		return;
	}
	
	res.sendStatus(200);
}

export async function validateSession(req: Request, res: Response) {
	if (!req.headers.authorization) {
		res.sendStatus(400);
		return;
	}
	const sidMaybe = getSession(req.headers.authorization.replace("Bearer ", ""));
	if (sidMaybe) {
		res.sendStatus(200);
		return;
	} else {
		res.sendStatus(400);
		return;
	}
}

export async function authenticate(req: Request, res: Response) {
	const {username, password} = req.body as {username: string, password: string};

	const query = qb("user")
								.select("*")
								.where("username","=",username)
								.toQuery();
	try {
		var qr = db.get(query);
	} catch(e) {
		console.log(e);
		res.sendStatus(500);
		return;
	}

	if (!qr) {
		res.status(400).send(`No user with username ${username}`);
		return;
	}

	if (!qr["password"]) {
		res.status(500).send();
		console.log(`No password field on query response for user ${username}: `, qr);
		return;
	}

	const pwValid = await bcryptVerify({
		password,
		hash: qr["password"]?.valueOf() as string,	
	});

	if (pwValid) {
		const user = userFrom(qr);
		const expiry = new Date();
		expiry.setDate(new Date().getDate() + 7);

		const sid = createSession();
		const session = getSession(sid);
		session["userId"] = user.id;

		res.json({				
			user,
			session: sid
		});
	} else {
		res.status(401).send("Password is invalid");
	}
}

export function logout(req: Request, res: Response) {
	const sid = req.headers.authorization;
	
	if (!sid) {
		res.sendStatus(204);
		return;
	}

	invalidateSession(sid);
	res.sendStatus(200);
}
