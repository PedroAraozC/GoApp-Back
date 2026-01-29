import { Router } from "express";
import {
  eliminarTipoVehiculo,
  editaTipoVehiculo,
  altaTipoVehiculo,
  obtenerTipoVehiculoAdmin,
  obtenerTipoVehiculo,
} from"../controllers/tipoVehiculosController.js";

const router = Router();

router.get("/obtener", obtenerTipoVehiculo);
router.get("/obtenerAdmin", obtenerTipoVehiculoAdmin);
router.post("/alta", altaTipoVehiculo);
router.put("/edita", editaTipoVehiculo);
router.put("/elimina", eliminarTipoVehiculo);

export default router;
