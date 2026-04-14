import { getMessages, getUsersForSidebar,markMessageAsSeen } from "../controllers/message.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const messageRouter = express.Router();
messageRouter.get("/users",verifyJWT,getUsersForSidebar)
messageRouter.get("/:id",verifyJWT,getMessages)
messageRouter.patch("/seen/:messageId", verifyJWT, markMessageAsSeen);

export default messageRouter;
