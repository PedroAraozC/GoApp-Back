import { Router } from "express";
import { crearCalificacion } from "../controllers/calificacionesControllers.js";

const router = Router();

router.post("/calificaciones", crearCalificacion);

export default router;