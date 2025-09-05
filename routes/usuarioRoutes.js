const { Router } = require("express");
const { login, obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } = require("../controllers/userControllers");

const router = Router();

// Ruta para el login de usuario
router.post("/login", login);

// Rutas CRUD usuarios
router.get("/obtenerUsuarios", obtenerUsuarios);
router.post("/crearUsuario", crearUsuario);
router.put("/actualizarUsuario/:id", actualizarUsuario);
router.put("/eliminarUsuario/:id", eliminarUsuario);

module.exports = router;
