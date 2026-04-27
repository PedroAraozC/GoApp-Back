import { Router } from "express";
import {
  altaRol,
  obtenerRol,
  editaRol,
  eliminarRol,
  obtenerRolAdmin,
} from "../controllers/rolesControllers.js";

const router = Router();

router.get("/obtenerRol", obtenerRol);
router.get("/obtenerRolAdmin", obtenerRolAdmin);
router.post("/altaRol", altaRol);
router.put("/editaGenero", editaRol);
router.put("/eliminarRol", eliminarRol);

export default router;
