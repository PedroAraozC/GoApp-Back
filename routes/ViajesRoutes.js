import { Router } from "express";
import {
  iniciarViaje,
  // obtenerViaje,
  // obtenerViajesUsuario,
  asignarConductor,
  comenzarViaje,
  finalizarViaje,
  // cancelarViaje,
} from "../controllers/viajesControllers.js";

const router = Router();

router.post("/iniciar", iniciarViaje);                     // crea el viaje en "buscando"
// router.get("/:id", obtenerViaje);                          // detalle
// router.get("/usuario/:id_usuario", obtenerViajesUsuario);  // historial

router.put("/:id/asignar", asignarConductor);              // asigna conductor
router.put("/:id/comenzar", comenzarViaje);                // pasa a "en_curso"
router.put("/:id/finalizar", finalizarViaje);              // pasa a "finalizado"
// router.put("/:id/cancelar", cancelarViaje);                // pasa a "cancelado"

export default router;
