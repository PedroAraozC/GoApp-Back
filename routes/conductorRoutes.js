import { Router } from "express";
import { uploadConductorImage } from "../middlewares/uploadConductor.js";
import { authWeb } from "../middlewares/authWeb.js";
import {
  cambiarEstadoConductor,
  obtenerCarnetConductor,
  subirImagenConductor,
  getImagenesConductor,
  crearChofer,
  obtenerConductores,
  obtenerConductoresPendientes,
  actualizarChofer,
  validarConductor,
  obtenerDetalleConductor,
  eliminarImagen,
} from "../controllers/conductorControllers.js";

const router = Router();

router.put("/actualizarChofer/:id_conductor", actualizarChofer);

router.put("/validar", validarConductor);

// ⬇️ SIEMPRE AL FINAL
router.get("/:idUsuario/carnet", obtenerCarnetConductor);

//RUTAS WEB
router.get("/obtener", authWeb, obtenerConductores);
router.post("/crearChofer", authWeb, crearChofer);
router.get("/pendientes", authWeb, obtenerConductoresPendientes);
router.put("/cambiarEstado", authWeb, cambiarEstadoConductor);
router.get("/detalle/:id_usuario", authWeb, obtenerDetalleConductor);
router.get("/:id_conductor/imagenes", authWeb, getImagenesConductor);
router.post(
  "/imagenes",
  authWeb,
  uploadConductorImage.single("imagen"),
  subirImagenConductor,
);
router.delete("/imagenes", eliminarImagen);

export default router;
