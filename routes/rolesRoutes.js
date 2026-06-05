import { Router } from "express";
import {
  altaRol,
  obtenerRol,
  editaRol,
  eliminarRol,
  obtenerRolAdmin,
} from "../controllers/rolesControllers.js";
import { authWeb } from "../middlewares/authWeb.js";

const router = Router();

//WEB BACKOFFICE
router.get("/obtenerRolAdmin", authWeb, obtenerRolAdmin);
router.post("/altaRol", authWeb, altaRol);
router.put("/editaGenero", authWeb, editaRol);
router.put("/eliminarRol", authWeb, eliminarRol);
router.get("/obtenerRol", authWeb, obtenerRol);

export default router;
