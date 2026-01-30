// routes/viajesRoutes.js
import{ Router } from"express";
import {
  iniciarViaje,
  asignarConductor,
  rechazarViaje,
  actualizarUbicacion,
  llegarEncuentro,
  comenzarViaje,
  finalizarViaje,
  cancelarViaje,
} from "../controllers/viajesControllers.js";

const router = Router();

// Iniciar un nuevo viaje
router.post("/iniciarViaje", iniciarViaje);

// Aceptar o rechazar viaje (conductor)
router.put("/:id/aceptar", asignarConductor);
router.put("/:id/rechazar", rechazarViaje);

// Actualizar ubicación en tiempo real
router.put("/:id/actualizarUbicacion", actualizarUbicacion);

// Llegar al punto de encuentro
router.put("/:id/llegarEncuentro", llegarEncuentro);

// Comenzar el viaje (después de llegar al encuentro)
router.put("/:id/comenzar", comenzarViaje);

// Finalizar el viaje
router.put("/:id/finalizar", finalizarViaje);

// Cancelar viaje (pasajero o conductor)
router.put("/:id/cancelar", cancelarViaje);

export default router;
