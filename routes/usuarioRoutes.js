import { Router } from"express";
import{
  obtenerUsuarios,
  obtenerUsuarioId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  login,
  google_login,
  rollbackUsuario,
  confirmarUsuario,
  editarRolUsuario,
  loginBackOffice
} from"../controllers/userControllers.js";

const router = Router();

router.get("/obtenerUsuarios", obtenerUsuarios);
router.put("/editarRolUsuario", editarRolUsuario);
router.get("/obtenerUsuarioId/:id", obtenerUsuarioId);
router.post("/crearUsuario", crearUsuario);
router.put("/actualizarUsuario/:id", actualizarUsuario);
router.put("/eliminarUsuario/:id", eliminarUsuario);
router.post("/login", login);
router.post("/loginBackOffice", loginBackOffice);
router.post("/google_login", google_login);
router.delete("/rollback/:id_usuario", rollbackUsuario);
router.put("/confirmar/:id_usuario", confirmarUsuario)

export default router;
