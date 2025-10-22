import Router  from "express";
import {
  obtenerUsuarios,
  obtenerUsuarioId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  login,
  google_login,
  verificarUsuario,
  validarCodigo,
  changePassword
} from "../controllers/userControllers.js";

const router = Router();

router.get("/obtenerUsuarios", obtenerUsuarios);
router.get("/obtenerUsuarioId/:id", obtenerUsuarioId);
router.post("/crearUsuario", crearUsuario);
router.put("/actualizarUsuario/:id", actualizarUsuario);
router.put("/eliminarUsuario/:id", eliminarUsuario);
router.post("/login", login);
router.post("/google_login", google_login);
router.post("/recoveryPassword", verificarUsuario);
router.post("/verificarCodigo", validarCodigo);
router.post("/changePassword", changePassword);


export default router;
