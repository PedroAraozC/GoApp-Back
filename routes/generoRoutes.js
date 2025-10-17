import Router  from "express" ;
import { obtenerGenero, altaGenero, editaGenero, eliminaGenero } from "../controllers/generoControllers.js";

const router = Router();

router.get("/obtenerGenero", obtenerGenero);
router.post("/altaGenero", altaGenero);
router.put("/editaGenero", editaGenero);
router.put("/eliminaGenero", eliminaGenero);

export default router;
