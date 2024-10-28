import { Request, Response } from "express";
import { qb } from "../queryBuilder";
import { db } from "../db";
import { offerFrom, Offer } from "../models/offer";
import { v4 as uuidv4 } from "uuid";
import { getUserSession } from "../sessions";
import { writeFileSync } from "fs";

export function getOffers(req: Request, res: Response) {
	const OFFERS_PER_PAGE = 20;
	const page = (req.query.page) ? parseInt(req.query.page as string) : 1;
	
	const query = qb("offer")
		.select("offer.*", "user.id as user_id", "user.username")
		.join("user", "offer.user_id", "=", "user.id")
		.limit(OFFERS_PER_PAGE)
		.offset(page-1)
		.toQuery();
	
	try {
		const offers: Offer[] = db.all(query).map((qr) => offerFrom(qr));
		res.json(offers);
	}catch(e) {
		console.log(e);
		res.sendStatus(500);
	}
}

export function viewOffer(req: Request, res: Response) {
	if (!req.query.id) {
		res.status(400).send("Must provide an offer ID");
		return;
	}

	const id = parseInt(req.query.id as string);
	
	const query = qb("offer")
		.select("offer.*", "user.id as user_id", "user.username")
		.join("user", "offer.user_id", "=", "user.id")
		.where("offer.id", "=", id)
		.toQuery();
	
	try {
		var qr = db.get(query);
	} catch(e) {
		console.log(e);
		res.sendStatus(500);
		return;
	}

	if (!qr) {
		res.status(400).send(`No offer with id ${id} found`);
		return;
	}

	const offer = offerFrom(qr);
	res.json(offer);
}

export function postOffer(req: Request, res: Response) {
	const {title,description,image} = req.body;

	if (title === "" || description === "" || image === "") {
		res.status(400).send("Fields title, description or image can't be empty");
		return;
	}

	const imageId = uuidv4();
	const imageExtension = image.substring(image.indexOf("/")+1, image.indexOf(";"));
	const imageData = image.split(";base64,").pop();
	const storagePath = process.env.STATIC_DIR_NAME + "/" + process.env.OFFER_IMG_DIR;
	writeFileSync(storagePath + imageId + "." + imageExtension, imageData, {encoding:"base64"}); 

	const session = getUserSession(req);
	const query = qb("offer").insert({
									id: uuidv4(),
									user_id: session["userId"],
									title,
									description,
									image: imageId + "." + imageExtension,
									created_at: Date.now(),
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
