const { Router } = require("express");
const {
  iniciarViaje,
  asignarConductor,
  comenzarViaje,
  finalizarViaje,
} = require("../controllers/viajesControllers");

const router = Router();

router.post("/iniciarViaje", iniciarViaje);
router.post("/:id/aceptar", asignarConductor);
router.put("/:id/comenzar", comenzarViaje);
router.put("/:id/finalizar", finalizarViaje);

module.exports = router;
