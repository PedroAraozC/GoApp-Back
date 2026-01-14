import Router  from "express" ;
import { obtener } from "../controllers/pagosControllers.js";

const router = Router();

router.get("/obtener", obtener);
// router.post("/alta", alta);
// router.put("/edita", edita);
// router.put("/elimina", elimina);

export default router;
