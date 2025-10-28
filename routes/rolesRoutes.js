import { Router } from "express";
import {
  altaRol,
  obtenerRol,
  editaRol,
  eliminarRol,
} from "../controllers/rolesControllers.js";

const router = Router();

router.get("/obtenerRol", obtenerRol);
router.post("/altaRol", altaRol);
router.put("/editaGenero", editaRol);
router.put("/eliminarRol", eliminarRol);

export default router;
