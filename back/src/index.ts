import e from "express";
import cors from "cors";

import * as offersControllers from "./controllers/offer"
import * as userControllers from "./controllers/user"
import * as chatControllers from "./controllers/chat"
import multer from "multer"
import expressWs from "express-ws"
import { isAuth, isAuthWs } from "./middlewares/isAuth";

const app = e();
const PORT = 9930;

const wsInst = expressWs(app);

app.use(cors({
	origin: "http://localhost:8081",
	optionsSuccessStatus: 200,
	credentials: true,
}));
app.use(e.static(process.env.STATIC_DIR_NAME!));
app.use(e.json());

app.get("/api/viewOffers", offersControllers.getOffers)
app.post("/api/postOffer", isAuth, multer().single("image"), offersControllers.postOffer)

app.get("/api/validateSession", userControllers.validateSession);
app.post("/api/register", userControllers.register);
app.post("/api/authenticate", userControllers.authenticate);

app.post("/api/createChat", isAuth, chatControllers.createChat);
app.post("/api/postMessage", isAuth, chatControllers.postMessage);
app.get("/api/getChats", isAuth, chatControllers.getUserChats);
app.get("/api/getChat", isAuth, chatControllers.getChat);
wsInst.app.ws("/api/startChat", isAuthWs, chatControllers.wsHandler);

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
})
