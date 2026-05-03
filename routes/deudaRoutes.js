import { Router } from "express";
import { obtenerDeuda, pagarDeuda } from "../controllers/deudaControllers.js";

const router = Router();

router.get("/:id_conductor", obtenerDeuda);
router.post("/pagar", pagarDeuda);

export default router;
