<<<<<<< HEAD
const { Router } = require("express");
const { cambiarEstadoConductor } = require("../controllers/conductorControllers");

const router = Router();

router.put("/cambiarEstado", cambiarEstadoConductor)


module.exports = router;
=======
import  Router  from "express";

const router = Router();

export default router;
>>>>>>> 22b722e465c21f174dc42aed5f307e8108c6e0ba
