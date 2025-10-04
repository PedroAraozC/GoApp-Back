const { Router } = require("express");
<<<<<<< HEAD
const { login, obtenerUsuarios} = require("../controllers/userControllers");
=======
const { login, obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } = require("../controllers/userControllers");
>>>>>>> 83f11e316e4d26bc2e48e8a0ea9b4c0992ade751

const router = Router();

// Ruta para el login de usuario
router.post("/login", login); 
router.get("/obtenerUsuarios", obtenerUsuarios);

// Rutas CRUD usuarios
router.get("/obtenerUsuarios", obtenerUsuarios);
router.post("/crearUsuario", crearUsuario);
router.put("/actualizarUsuario/:id", actualizarUsuario);
router.put("/eliminarUsuario/:id", eliminarUsuario);

module.exports = router;
