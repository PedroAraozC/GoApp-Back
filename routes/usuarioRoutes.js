const { Router } = require("express");
const {
  obtenerUsuarios,
  obtenerUsuarioId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  login,
  google_login,
} = require("../controllers/userControllers");

const router = Router();

router.get("/obtenerUsuarios", obtenerUsuarios);
router.get("/obtenerUsuarioId/:id", obtenerUsuarioId);
router.post("/crearUsuario", crearUsuario);
router.put("/actualizarUsuario/:id", actualizarUsuario);
router.put("/eliminarUsuario/:id", eliminarUsuario);
router.post("/login", login);
router.post("/google_login", google_login);

module.exports = router;
