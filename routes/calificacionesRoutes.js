import { Router } from "express";
import { crearCalificacion } from "../controllers/calificacionesControllers.js";

const router = Router();

router.post("/", crearCalificacion);

export default router;