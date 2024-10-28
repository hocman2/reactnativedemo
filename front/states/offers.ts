import { OfferProps } from "@/types/offerProps";
import { users } from "./users";

export const offers: OfferProps[] = (() => {
	const offersData: any[] = require("../assets/mock/offers.json").offers;
	
	return offersData.map((o) => {
		return {
			id: o.id,
			title: o.title,
			image: o.image,
			description: o.description,
			author: users.find((u) => u.id === o.author)
		} as OfferProps
	})
})(); 
