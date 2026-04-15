import { getMessages, getUsersForSidebar,markMessageAsSeen } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import express from "express";

const messageRouter = express.Router();
messageRouter.get("/users",verifyJWT,getUsersForSidebar)
messageRouter.get("/:id",verifyJWT,getMessages)
messageRouter.patch("/seen/:messageId", verifyJWT, markMessageAsSeen);

export default messageRouter;
