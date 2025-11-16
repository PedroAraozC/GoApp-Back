const { Router } = require("express");
const { cambiarEstadoConductor } = require("../controllers/conductorControllers");

const router = Router();

router.put("/cambiarEstado", cambiarEstadoConductor)


module.exports = router;
