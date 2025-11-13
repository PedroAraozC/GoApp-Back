import Router from "express";
import {
  obtenerConductores,
  obtenerDetalleConductores,
} from "../controllers/conductoresControllers.js";

const router = Router();

router.get("/obtener", obtenerConductores);
router.get("/obtenerDetalle/:id", obtenerDetalleConductores);

export default router;
