import { OfferProps } from "@/types/offerProps";
import { UserProps } from "@/types/userProps";

export const users: UserProps[] = (() => {
	const usersData: any[] = require("../assets/mock/users.json").users;
	const offersData: any[] = require("../assets/mock/offers.json").offers;
	return usersData.map((u: any) => {
		return {
			id: u.id,
			username: u.username,
			offers: offersData.filter((o) => o.author === u.id)
		}
	});
})();
