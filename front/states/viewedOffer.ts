import { OfferProps } from "@/types/offerProps";
export let viewedOffer: OfferProps | undefined = undefined;
export function setViewedOffer(value: OfferProps|undefined) {
	viewedOffer = value;
}
