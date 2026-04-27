import { Router } from "express";
import { uploadConductorImage } from "../middlewares/uploadConductor.js";
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
} from "../controllers/conductorControllers.js";

const router = Router();

router.post("/crearChofer", crearChofer);
router.put("/cambiarEstado", cambiarEstadoConductor);

router.get("/obtener", obtenerConductores);
router.get("/pendientes", obtenerConductoresPendientes);

router.post(
  "/imagenes",
  uploadConductorImage.single("imagen"),
  subirImagenConductor,
);

router.get("/:id_conductor/imagenes", getImagenesConductor);
router.put("/actualizarChofer/:id_conductor", actualizarChofer);

router.put("/validar", validarConductor);
router.get("/detalle/:id_usuario", obtenerDetalleConductor);

// ⬇️ SIEMPRE AL FINAL
router.get("/:idUsuario/carnet", obtenerCarnetConductor);

export default router;
