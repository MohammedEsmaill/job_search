import { Router } from 'express';
import * as CS from "./chat.service.js";
import * as CV from "./chat.validation.js";
import { authentication,validation } from "../../middleWare/index.js";
const chatRouter = Router()
chatRouter.get("/getChat/:userId",authentication(),validation(CV.getChatSchema),CS.getChat)
export default chatRouter
