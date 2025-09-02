const { Router } = require("express");
const { obtenerGenero } = require("../controllers/generoControllers");

const router = Router();

router.get("/obtenerGenero", obtenerGenero);

module.exports = router;
