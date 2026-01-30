import { Router } from "express";
import {
  obtenerGenero,
  altaGenero,
  editaGenero,
  eliminaGenero,
  obtenerGeneroAdmin,
} from "../controllers/generoControllers.js";

const router = Router();

router.get("/obtenerGenero", obtenerGenero);
router.get("/obtenerGeneroAdmin", obtenerGeneroAdmin);
router.post("/altaGenero", altaGenero);
router.put("/editaGenero", editaGenero);
router.put("/eliminaGenero", eliminaGenero);

export default router;
