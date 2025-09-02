const { Router } = require("express");
const { obtenerGenero, altaGenero, editaGenero } = require("../controllers/generoControllers");

const router = Router();

router.get("/obtenerGenero", obtenerGenero);
router.post("/altaGenero", altaGenero);
router.put("/editaGenero", editaGenero);

module.exports = router;
