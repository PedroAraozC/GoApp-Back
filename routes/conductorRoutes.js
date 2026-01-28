import { Router } from "express";
import { uploadConductorImage } from "../middlewares/uploadConductor.js";
import {
  cambiarEstadoConductor,
  obtenerCarnetConductor,
  subirImagenConductor,
  getImagenesConductor,
  crearChofer,
  obtenerConductores,
} from "../controllers/conductorControllers.js";

const router = Router();

router.post("/crearChofer", crearChofer);

router.put("/cambiarEstado", cambiarEstadoConductor);

router.get("/:idUsuario/carnet", obtenerCarnetConductor);
router.get("/obtener", obtenerConductores);

router.post(
  "/imagenes",
  uploadConductorImage.single("imagen"),
  subirImagenConductor,
);

router.get("/:id_conductor/imagenes", getImagenesConductor);

export default router;
