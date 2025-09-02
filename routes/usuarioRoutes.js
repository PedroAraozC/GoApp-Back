const { Router } = require("express");
const { login, obtenerUsuarios} = require("../controllers/userControllers");

const router = Router();

// Ruta para el login de usuario
router.post("/login", login); 
router.get("/obtenerUsuarios", obtenerUsuarios);

module.exports = router;
