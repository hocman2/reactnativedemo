import { UserProps } from "./userProps";

export type OfferProps = {
	id: string,
	user: UserProps,
	title: string,
	image: string,
	description: string
};
