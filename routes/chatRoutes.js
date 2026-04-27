import { Router } from "express";
import { getMessages } from "../controllers/chatController.js";

const router = Router();

router.get("/:idViaje", getMessages);

export default router;