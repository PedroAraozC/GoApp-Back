const { Router } = require("express");
const {
  iniciarViaje,
  asignarConductor,
  comenzarViaje,
  finalizarViaje,
  cancelarViaje,
} = require("../controllers/viajesControllers");

const router = Router();

router.post("/iniciarViaje", iniciarViaje);
router.put("/:id/aceptar", asignarConductor);
router.put("/:id/comenzar", comenzarViaje);
router.put("/:id/finalizar", finalizarViaje);
router.put("/:id/cancelar", cancelarViaje);

module.exports = router;
