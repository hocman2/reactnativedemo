import { OfferProps } from "./offerProps"
import { UserProps } from "./userProps"

export type MessageProps = {
	seq: number,
	sentAt: number,
	authorId: number,
	content: string,
}

export type MessagePreviewProps = {
	seq: number,
	sentAt: number,
	content: string,
}

export type ChatProps = {
	id: string,
	offer: OfferProps,
	offerer: UserProps,
	buyer: UserProps,
	messages: MessageProps[],
}

export type ChatPreviewProps = {
	id: string,
	lastMessage: MessagePreviewProps,
	messageAuthor: UserProps,
}
