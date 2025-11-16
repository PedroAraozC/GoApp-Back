const { Router } = require("express");
const { altaRol, obtenerRol, editaRol, eliminarRol } = require("../controllers/rolesControllers");

const router = Router();

router.get("/obtenerRol", obtenerRol);
router.post("/altaRol", altaRol);
router.put("/editaGenero", editaRol);
router.put("/eliminarRol", eliminarRol)

module.exports = router;