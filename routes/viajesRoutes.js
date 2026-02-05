// routes/viajesRoutes.js
import { Router } from "express";
import {
  iniciarViaje,
  asignarConductor,
  rechazarViaje,
  actualizarUbicacion,
  enCaminoAlEncuentro,   // ✅ NUEVO
  llegarEncuentro,
  comenzarViaje,
  finalizarViaje,
  cancelarViaje,
  getViajeActivo,
} from "../controllers/viajesControllers.js";

const router = Router();

// Iniciar un nuevo viaje
router.post("/iniciarViaje", iniciarViaje);

// ✅ Obtener el viaje activo de un usuario (pasajero o conductor)
router.get("/activo/:tipo/:id_usuario", getViajeActivo);

// Aceptar o rechazar viaje (conductor)
router.put("/:id/aceptar", asignarConductor);
router.put("/:id/rechazar", rechazarViaje);

// Actualizar ubicación en tiempo real
router.put("/:id/actualizarUbicacion", actualizarUbicacion);

// ✅ Conductor en camino al punto de encuentro (estado 6)
router.put("/:id/enCamino", enCaminoAlEncuentro);

// Llegar al punto de encuentro (estado 7)
router.put("/:id/llegarEncuentro", llegarEncuentro);

// Comenzar el viaje (estado 2 - En curso)
router.put("/:id/comenzar", comenzarViaje);

// Finalizar el viaje (estado 4 - Finalizado)
router.put("/:id/finalizar", finalizarViaje);

// Cancelar viaje (pasajero o conductor)
router.put("/:id/cancelar", cancelarViaje);

export default router;
