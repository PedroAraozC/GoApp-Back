const { Router } = require("express");
const { login } = require("../controllers/userControllers");

const router = Router();

// Ruta para el login de usuario
router.post("/login", login);

module.exports = router;
