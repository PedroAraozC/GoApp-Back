const { Router } = require("express");
import { uploadConductorImage } from "../middlewares/uploadConductor.js";
const {
  cambiarEstadoConductor,
  obtenerCarnetConductor,
  subirImagenConductor,
  getImagenesConductor,
} = require("../controllers/conductorControllers");

const router = Router();

router.put("/cambiarEstado", cambiarEstadoConductor);

router.get("/:idUsuario/carnet", obtenerCarnetConductor);

router.post(
  "/imagenes",
  uploadConductorImage.single("imagen"),
  subirImagenConductor,
);

router.get("/:id_conductor/imagenes", getImagenesConductor);

module.exports = router;
