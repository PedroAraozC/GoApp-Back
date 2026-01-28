const { Router } = require("express");
const {
  obtenerGenero,
  altaGenero,
  editaGenero,
  eliminaGenero,
  obtenerGeneroAdmin,
} = require("../controllers/generoControllers");

const router = Router();

router.get("/obtenerGenero", obtenerGenero);
router.get("/obtenerGeneroAdmin", obtenerGeneroAdmin);
router.post("/altaGenero", altaGenero);
router.put("/editaGenero", editaGenero);
router.put("/eliminaGenero", eliminaGenero);

module.exports = router;
