import { Router } from "express";
import {
  obtenerUsuarios,
  obtenerUsuarioId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  login,
  google_login,
  rollbackUsuario,
  confirmarUsuario,
<<<<<<< HEAD
  editarUsuarioWeb,
  loginBackOffice,
  verifyTokenBackOffice,
  crearUsuarioWeb,
} from "../controllers/userControllers.js";
import { authWeb } from "../middlewares/authWeb.js";
=======
  editarRolUsuario,
  loginBackOffice
} from"../controllers/userControllers.js";
>>>>>>> 635a1128cb78b84dab5eb79f8555f40236f8e78e

const router = Router();

router.get("/obtenerUsuarioId/:id", obtenerUsuarioId);
router.post("/crearUsuario", crearUsuario);
router.put("/actualizarUsuario/:id", actualizarUsuario);
router.post("/login", login);
router.post("/loginBackOffice", loginBackOffice);
router.post("/google_login", google_login);
router.delete("/rollback/:id_usuario", rollbackUsuario);
router.put("/confirmar/:id_usuario", confirmarUsuario);

//WEB BACKOFFICE

router.post("/loginBackOffice", loginBackOffice);
router.get("/verifyToken", authWeb, verifyTokenBackOffice);
router.get("/obtenerUsuarios", authWeb, obtenerUsuarios);
router.put("/editarUsuarioWeb", authWeb, editarUsuarioWeb);
router.put("/eliminarUsuario/:id", authWeb, eliminarUsuario);
router.post("/crearUsuarioWeb", authWeb, crearUsuarioWeb);

export default router;
