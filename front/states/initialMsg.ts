let initialMsg: null|any = null;

export function setInitialMsg(msg: any) {
	initialMsg = msg;
}

export function isInitialMsgNull(): boolean {
	return initialMsg === null;
}

export function useInitialMsg(): any|null {
	const msg = initialMsg;
	initialMsg = null;
	return msg;
} 
