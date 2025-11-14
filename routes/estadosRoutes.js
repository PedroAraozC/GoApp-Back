import Router from "express";
import {
  obtenerEstado,
  cambiarEstadoSolicitud,
} from "../controllers/estadosControllers.js";

const router = Router();

router.get("/obtener", obtenerEstado);
router.put("/cambiarEstado", cambiarEstadoSolicitud);

export default router;
