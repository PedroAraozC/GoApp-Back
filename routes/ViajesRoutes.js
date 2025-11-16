import { Router } from "express";
import {
  iniciarViaje,
  obtenerViaje,
  obtenerViajesUsuario,
  asignarConductor,
  comenzarViaje,
  finalizarViaje,
  cancelarViaje
} from "../controllers/viajesControllers.js";

const router = Router();

router.post("/iniciar", iniciarViaje);                     // crea el viaje en "buscando"
router.get("/:id", obtenerViaje);                          // detalle (para polling)
router.get("/usuario/:id_usuario", obtenerViajesUsuario);  // historial (por defecto finalizados)

router.put("/:id/asignar", asignarConductor);              // asigna conductor (cuando aplique)
router.put("/:id/comenzar", comenzarViaje);                // pasa a "en_curso"
router.put("/:id/finalizar", finalizarViaje);              // pasa a "finalizado"
router.put("/:id/cancelar", cancelarViaje);                // pasa a "cancelado"

export default router;
