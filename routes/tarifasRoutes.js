import { Router } from "express";
import {
  listarTarifas,
  obtenerTarifaPorId,
  obtenerTarifaVigente,
  crearTarifa,
  actualizarTarifa,
  activarTarifa,
  desactivarTarifa,
} from "../controllers/tarifasController.js";

const router = Router();

router.get("/vigente", obtenerTarifaVigente);
router.get("/", listarTarifas);
router.get("/:id", obtenerTarifaPorId);

router.post("/", crearTarifa);
router.put("/:id", actualizarTarifa);

router.patch("/:id/activar", activarTarifa);
router.patch("/:id/desactivar", desactivarTarifa);

export default router;