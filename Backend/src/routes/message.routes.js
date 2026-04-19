import { getMessages, getUsersForSidebar,markMessageAsSeen ,sendMessage } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import express from "express";
import {upload} from "../middlewares/multer.middleware.js";

const messageRouter = express.Router();
messageRouter.get("/users",verifyJWT,getUsersForSidebar)
messageRouter.get("/:id",verifyJWT,getMessages)
messageRouter.post("/send/:id",verifyJWT, upload.single("image"),sendMessage)
messageRouter.patch("/seen/:messageId", verifyJWT, markMessageAsSeen);

export default messageRouter;
