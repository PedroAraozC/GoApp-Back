const { Router } = require("express");
const { obtenerGenero, altaGenero, editaGenero, eliminaGenero } = require("../controllers/generoControllers");

const router = Router();

router.get("/obtenerGenero", obtenerGenero);
router.post("/altaGenero", altaGenero);
router.put("/editaGenero", editaGenero);
router.put("/eliminaGenero", eliminaGenero);

module.exports = router;
