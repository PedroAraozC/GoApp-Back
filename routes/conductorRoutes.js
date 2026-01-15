const { Router } = require("express");
const {
  cambiarEstadoConductor,
  obtenerCarnetConductor, // ✅ NUEVO
} = require("../controllers/conductorControllers");

const router = Router();

router.put("/cambiarEstado", cambiarEstadoConductor);

// ✅ NUEVO: Carnet Digital
router.get("/:idUsuario/carnet", obtenerCarnetConductor);

module.exports = router;
