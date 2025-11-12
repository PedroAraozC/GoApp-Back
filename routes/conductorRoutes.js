import Router from "express";
import { obtenerConductores } from "../controllers/conductoresControllers.js";

const router = Router();

router.get("/obtener", obtenerConductores);

export default router;
